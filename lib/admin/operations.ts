import { and, eq } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db/client";
import { emailLog, registrations } from "@/lib/db/schema";
import {
  AdminGatewayError,
  adminGatewayFetch,
  hasLocalDb,
} from "@/lib/admin/gateway";
import { dispatchPavelEmail } from "@/lib/email/dispatch";
import {
  buildPavelConfirmationEmail,
  buildPavelCertificateEmail,
} from "@/lib/email/pavelTemplates";
import type { PavelRegistrationSubmission } from "@/lib/email/pavelTemplates";
import { loadSchedule } from "@/lib/pavel/loadSchedule";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import { syncAttendance } from "@/lib/pavel/attendanceSync";
import {
  issueCertificateForRegistration,
  issueEarnedCertificates,
} from "@/lib/pavel/certificate";
import { certificates } from "@/lib/db/schema";

/**
 * Operator actions for a single seat.
 *
 * Everything here already ran automatically at some point; these exist for when
 * it did not land — a buyer who deleted the email, an address typo corrected
 * after the fact, a Zoom report that was slow. Without them the only recourse
 * is the database, which is not a thing an operator should need on launch day.
 */

const SENDER = { email: "hello@fynix.digital", name: "Pavel Klimakov Workshop" };

const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fynix.digital"
).replace(/\/+$/, "");

export type OperationResult = { ok: true; message: string } | { ok: false; message: string };

/**
 * Release a claimed email slot so it can be sent again.
 *
 * `email_log` has a unique (registration_id, type), which is what makes the
 * automated flows impossible to double-send. A deliberate operator resend has
 * to clear that claim first — otherwise dispatch reports "already_sent" and
 * nothing reaches the buyer, which looks exactly like success.
 *
 * The row is replaced rather than duplicated, so the log keeps meaning "when
 * this person last received this email".
 */
async function releaseEmailClaim(db: Db, registrationId: string, type: string) {
  await db
    .delete(emailLog)
    .where(and(eq(emailLog.registrationId, registrationId), eq(emailLog.type, type)));
}

async function findByRef(db: Db, ref: string) {
  const [row] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.ref, ref.trim()))
    .limit(1);
  return row;
}

/** Send the confirmation again, with the buyer's current join link. */
export async function resendConfirmation(
  db: Db,
  ref: string
): Promise<OperationResult> {
  const registration = await findByRef(db, ref);
  if (!registration) return { ok: false, message: `No registration for ${ref}.` };
  if (registration.status !== "paid") {
    return { ok: false, message: `${ref} is ${registration.status}, not paid.` };
  }

  const schedule = await loadSchedule();
  const submission: PavelRegistrationSubmission = {
    name: registration.name,
    email: registration.email,
    country: registration.country,
    amountDisplay: registration.amountDisplay ?? undefined,
    ref: registration.ref,
    joinUrl: registration.zoomJoinUrl ?? undefined,
    schedule,
  };

  const email = buildPavelConfirmationEmail(submission);
  await releaseEmailClaim(db, registration.id, "confirmation");

  const result = await dispatchPavelEmail({
    registrationId: registration.id,
    type: "confirmation",
    to: [{ email: registration.email, name: registration.name }],
    subject: email.subject,
    htmlContent: email.html,
    textContent: email.text,
    sender: SENDER,
  });

  if (result.status === "error") {
    return { ok: false, message: `Send failed: ${result.reason}` };
  }
  // No join link is worth saying out loud: the email is useless without it.
  const caveat = registration.zoomJoinUrl
    ? ""
    : " (warning: this seat still has no Zoom link)";
  return { ok: true, message: `Confirmation resent to ${registration.email}${caveat}.` };
}

/**
 * Pull attendance from Zoom now, then issue any certificates it has earned.
 *
 * The cron does this on a timer, but only once the session's scheduled end has
 * passed. A workshop that finishes early therefore waits — this is the button
 * for that, and for a Zoom report that was not ready on the last attempt.
 */
export async function runAttendanceSyncNow(db: Db): Promise<OperationResult> {
  // Forced: pressing this button is the operator saying the session is over,
  // which is a better signal than the scheduled end time. Without it the button
  // refuses in the very case it was built for — a workshop that finished early.
  const attendance = await syncAttendance(db, undefined, { force: true });

  if (attendance.status === "error") {
    return { ok: false, message: `Attendance sync failed: ${attendance.reason}` };
  }
  if (attendance.status === "not_ready") {
    return {
      ok: false,
      message: `Zoom's report is not ready yet: ${attendance.reason} Try again in a few minutes.`,
    };
  }
  if (attendance.status === "skipped") {
    return { ok: false, message: attendance.reason };
  }

  const issued = await issueEarnedCertificates(db);
  return {
    ok: true,
    message:
      `Synced ${attendance.matched} attendee(s), ${attendance.absent} absent. ` +
      `Certificates issued: ${issued.issued}.`,
  };
}

/**
 * Issue the certificate if it has been earned, then send it.
 *
 * Issuance stays gated on attendance — this cannot mint a credential for
 * someone who did not attend, which is the whole point of the gate. It only
 * covers the case where the certificate exists (or is now earned) and the email
 * did not arrive.
 */
export async function resendCertificate(
  db: Db,
  ref: string
): Promise<OperationResult> {
  const registration = await findByRef(db, ref);
  if (!registration) return { ok: false, message: `No registration for ${ref}.` };

  const issue = await issueCertificateForRegistration(db, registration.id);
  if (issue.status === "not_eligible") {
    return { ok: false, message: `Not eligible: ${issue.reason}` };
  }
  if (issue.status === "error") {
    return { ok: false, message: `Could not issue: ${issue.reason}` };
  }

  const [certificate] = await db
    .select({ credentialId: certificates.credentialId })
    .from(certificates)
    .where(eq(certificates.registrationId, registration.id))
    .limit(1);

  if (!certificate) {
    return { ok: false, message: "No certificate found for this seat." };
  }

  const [schedule, session] = await Promise.all([
    loadSchedule(),
    getActiveSession(db),
  ]);
  const email = buildPavelCertificateEmail({
    name: registration.name,
    email: registration.email,
    country: registration.country,
    amountDisplay: registration.amountDisplay ?? undefined,
    ref: registration.ref,
    joinUrl: registration.zoomJoinUrl ?? undefined,
    schedule,
    recordingUrl: session?.recordingUrl ?? undefined,
    certificateUrl: `${SITE_ORIGIN}/pavel/certificate/${certificate.credentialId}`,
  });

  await releaseEmailClaim(db, registration.id, "certificate");

  const result = await dispatchPavelEmail({
    registrationId: registration.id,
    type: "certificate",
    to: [{ email: registration.email, name: registration.name }],
    subject: email.subject,
    htmlContent: email.html,
    textContent: email.text,
    sender: SENDER,
  });

  if (result.status === "error") {
    return { ok: false, message: `Send failed: ${result.reason}` };
  }
  return {
    ok: true,
    message: `Certificate ${certificate.credentialId} sent to ${registration.email}.`,
  };
}

/** Path of the droplet-side endpoint that performs these. */
export const OPERATIONS_DATA_PATH = "/api/admin/data/operations";

export type AdminOperation =
  | "resend_confirmation"
  | "sync_attendance"
  | "resend_certificate";

/**
 * Run an operation wherever the data lives.
 *
 * Same split as sessions and registrations: Postgres directly on the droplet
 * and in local dev, the droplet's internal admin API from Vercel, which has no
 * database of its own.
 */
export async function runAdminOperation(
  action: AdminOperation,
  input: { ref?: string } = {}
): Promise<OperationResult> {
  if (hasLocalDb()) {
    const db = getDb();
    if (!db) return { ok: false, message: "Database is not configured." };
    try {
      switch (action) {
        case "resend_confirmation":
          return await resendConfirmation(db, input.ref ?? "");
        case "resend_certificate":
          return await resendCertificate(db, input.ref ?? "");
        case "sync_attendance":
          return await runAttendanceSyncNow(db);
      }
    } catch (error) {
      console.error("[admin/operations] failed", error);
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Operation failed.",
      };
    }
  }

  try {
    const response = await adminGatewayFetch(OPERATIONS_DATA_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...input }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    return response.ok
      ? { ok: true, message: payload.message ?? "Done." }
      : { ok: false, message: payload.message ?? `Failed (HTTP ${response.status}).` };
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      return { ok: false, message: "The admin console is not connected to its data service." };
    }
    console.error("[admin/operations] gateway request failed", error);
    return { ok: false, message: "Could not reach the operations service." };
  }
}
