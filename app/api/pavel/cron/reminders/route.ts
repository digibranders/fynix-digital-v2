import { NextResponse } from "next/server";
import { and, eq, inArray, lte } from "drizzle-orm";
import { loadSchedule } from "@/lib/pavel/loadSchedule";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import {
  REMINDER_TYPES,
  dueReminderTypes,
  isReminderType,
  reminderWindowOpensAt,
  type ReminderType,
} from "@/lib/pavel/schedule";
import type { WorkshopSchedule } from "@/lib/pavel/workshopSchedule";
import { getDb, type Db } from "@/lib/db/client";
import { registrations, emailLog } from "@/lib/db/schema";
import {
  dispatchPavelEmail,
  type PavelEmailType,
} from "@/lib/email/dispatch";
import { backfillMissingInvoices } from "@/lib/pavel/invoice";
import { backfillWebinarAccess } from "@/lib/pavel/webinarAccess";
import { syncAttendance } from "@/lib/pavel/attendanceSync";
import { issueEarnedCertificates } from "@/lib/pavel/certificate";
import {
  buildPavelReminderEmail,
  buildPavelCertificateEmail,
  buildPavelMissedYouEmail,
  type PavelRegistrationSubmission,
} from "@/lib/email/pavelTemplates";
import { certificates } from "@/lib/db/schema";
import { hasEarnedCertificate } from "@/lib/pavel/certificate";

export const runtime = "nodejs";

// hello@fynix.digital is the Brevo-verified sender; steve@ is not, so it would
// bounce. The friendly name still reads as the workshop.
const SENDER = { email: "hello@fynix.digital", name: "Pavel Klimakov Workshop" };

/** Absolute origin for links in emails; the console and site live on Vercel. */
const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fynix.digital"
).replace(/\/+$/, "");


function buildEmail(type: ReminderType, submission: PavelRegistrationSubmission) {
  switch (type) {
    // The day-ahead touchpoints share the calm "week" template; the countdown
    // label inside it renders the exact lead time ("in 7 days" / "in 1 day").
    case "reminder_7d":
    case "reminder_3d":
    case "reminder_1d":
      return buildPavelReminderEmail(submission, "week");
    // Final hour uses the urgent variant.
    case "reminder_1h":
      return buildPavelReminderEmail(submission, "hour");
    case "post_event":
      // Handled per recipient in runReminderType: what someone receives after
      // the event depends on whether they actually attended.
      return null;
  }
}

async function runReminderType(
  db: Db,
  type: ReminderType,
  schedule: WorkshopSchedule,
  activeSessionId: string,
  recordingUrl?: string
) {
  const windowOpensAt = reminderWindowOpensAt(type, schedule);

  // Paid seats FOR THE ACTIVE SESSION only.
  //
  // This used to be every paid seat ever sold. The reminders are built from the
  // active session's schedule and carry that webinar's join link, so opening a
  // second cohort would have emailed the first cohort about an event they had
  // not bought, with a link they cannot use — and, after it ran, told them they
  // missed a workshop they were never in.
  let paid: {
    id: string;
    ref: string;
    name: string;
    email: string;
    country: string;
    amountDisplay: string | null;
    zoomJoinUrl: string | null;
    attendedMinutes: number | null;
    status: string;
    credentialId: string | null;
  }[];
  try {
    paid = await db
      .select({
        id: registrations.id,
        ref: registrations.ref,
        name: registrations.name,
        email: registrations.email,
        country: registrations.country,
        amountDisplay: registrations.amountDisplay,
        zoomJoinUrl: registrations.zoomJoinUrl,
        attendedMinutes: registrations.attendedMinutes,
        status: registrations.status,
        credentialId: certificates.credentialId,
      })
      .from(registrations)
      .leftJoin(certificates, eq(certificates.registrationId, registrations.id))
      .where(
        and(
          eq(registrations.status, "paid"),
          eq(registrations.sessionId, activeSessionId),
          // Skip anyone who registered AFTER this reminder was due. Every window
          // stays open until the workshop starts, so without this a buyer who
          // paid 70 minutes beforehand was immediately sent "1 day to go" — a
          // countdown that had already run out. They simply receive the next
          // reminder instead, which is the one that actually applies to them.
          ...(windowOpensAt ? [lte(registrations.createdAt, windowOpensAt)] : [])
        )
      );
  } catch (regError) {
    const reason = regError instanceof Error ? regError.message : "query failed";
    return { type, error: reason, sent: 0, skipped: 0, failed: 0 };
  }

  // Who already has this reminder logged — skip them without a send attempt.
  let alreadySent: Set<string>;
  try {
    // post_event fans out into two different logged types, so checking for
    // "post_event" would never match and every run would re-attempt. The
    // dispatcher's unique constraint is still the real guarantee; this is only
    // a cheap pre-filter.
    const typesForRun: string[] =
      type === "post_event" ? ["certificate", "missed_you"] : [type];

    const logged = await db
      .select({ registrationId: emailLog.registrationId })
      .from(emailLog)
      .where(inArray(emailLog.type, typesForRun));
    alreadySent = new Set(logged.map((row) => row.registrationId));
  } catch (logError) {
    const reason = logError instanceof Error ? logError.message : "query failed";
    return { type, error: reason, sent: 0, skipped: 0, failed: 0 };
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const reg of paid) {
    if (alreadySent.has(reg.id)) {
      skipped += 1;
      continue;
    }

    const submission: PavelRegistrationSubmission = {
      name: reg.name,
      email: reg.email,
      country: reg.country,
      amountDisplay: reg.amountDisplay ?? undefined,
      ref: reg.ref,
      joinUrl: reg.zoomJoinUrl ?? undefined,
      schedule,
      recordingUrl,
    };
    // After the event, what someone receives depends on whether they actually
    // turned up: a certificate for attendees, the recording for everyone else.
    // Each is logged under its own type, so a buyer can never receive both, and
    // a seat whose attendance has not synced yet is left for a later run rather
    // than being told it missed a workshop it may well have attended.
    let email: ReturnType<typeof buildPavelReminderEmail> | null;
    let emailType: PavelEmailType = type as PavelEmailType;

    if (type === "post_event") {
      if (reg.attendedMinutes === null) {
        skipped += 1;
        continue;
      }

      const earned = hasEarnedCertificate({
        status: reg.status,
        attendedMinutes: reg.attendedMinutes,
      });

      if (earned && reg.credentialId) {
        emailType = "certificate";
        email = buildPavelCertificateEmail({
          ...submission,
          certificateUrl: `${SITE_ORIGIN}/pavel/certificate/${reg.credentialId}`,
        });
      } else if (earned) {
        // Attended, but the certificate has not been issued yet. Sending now
        // would promise a link that does not exist, so wait for the next run.
        skipped += 1;
        continue;
      } else {
        emailType = "missed_you";
        email = buildPavelMissedYouEmail(submission);
      }
    } else {
      email = buildEmail(type, submission);
    }

    if (!email) {
      skipped += 1;
      continue;
    }

    const result = await dispatchPavelEmail({
      registrationId: reg.id,
      type: emailType,
      to: [{ email: reg.email, name: reg.name }],
      subject: email.subject,
      htmlContent: email.html,
      textContent: email.text,
      sender: SENDER,
      replyTo: SENDER,
    });

    if (result.status === "sent" || result.status === "mocked") sent += 1;
    else if (result.status === "skipped") skipped += 1;
    else {
      failed += 1;
      console.error(`[pavel/cron] ${type} failed for ${reg.ref}: ${result.reason}`);
    }
  }

  return { type, sent, skipped, failed };
}

/**
 * Only the cron scheduler (or an authorised manual trigger) may run this. Vercel
 * Cron sends `Authorization: Bearer <CRON_SECRET>`; locally, curl the same
 * header. If no secret is configured the route stays closed rather than open.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET || process.env.PAVEL_CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * GET is what Vercel Cron issues. A `?type=<reminder_7d|reminder_3d|reminder_1d|
 * reminder_1h|post_event>` query param forces a single type regardless of
 * schedule — used to exercise the flow locally, where the event date isn't yet
 * in a real send window. With no `type`, the schedule decides what's due.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Datastore unavailable." }, { status: 503 });
  }

  // Reminders are timed against the ACTIVE SESSION, so opening a new cohort
  // never means editing a date in code and redeploying. The session's identity
  // matters as much as its schedule: it is what scopes who gets emailed.
  const [schedule, activeSession] = await Promise.all([
    loadSchedule(),
    getActiveSession(db),
  ]);

  // No active session means no cohort to remind. Returning here rather than
  // falling through avoids the worst outcome: reminders built from the fallback
  // schedule going out to whoever happens to be in the table.
  if (!activeSession) {
    return NextResponse.json({
      ran: [],
      message: "No active session; nothing to remind.",
    });
  }

  // Self-heal first, before any early return: issue invoices for paid seats that
  // are missing one (issuance is deliberately non-fatal, so a failure at payment
  // time leaves a gap to recover here). Ordered by payment time so recovered
  // invoices are numbered in the order the payments arrived.
  const backfill = await backfillMissingInvoices(db).catch((error) => {
    console.error("[pavel/cron] invoice backfill failed", error);
    return { issued: 0, failed: 0, invoiceNos: [] as string[] };
  });
  if (backfill.issued > 0 || backfill.failed > 0) {
    console.log(
      `[pavel/cron] invoice backfill: issued ${backfill.issued}, failed ${backfill.failed}`
    );
  }

  // Grant webinar access to any paid seat still missing a join link (Zoom may
  // have been down, or no session was active when they paid).
  const access = await backfillWebinarAccess(db).catch((error) => {
    console.error("[pavel/cron] webinar access backfill failed", error);
    return { granted: 0, failed: 0, skipped: 0 };
  });

  // Reconcile attendance from Zoom's participant report, then issue
  // certificates to whoever has now cleared the threshold. Order matters:
  // certificates are gated on attendance, so the sync must run first.
  const attendance = await syncAttendance(db).catch((error) => {
    console.error("[pavel/cron] attendance sync failed", error);
    return { status: "error" as const, reason: "sync threw" };
  });
  const certificatesIssued =
    attendance.status === "synced"
      ? await issueEarnedCertificates(db).catch((error) => {
          console.error("[pavel/cron] certificate issuance failed", error);
          return { issued: 0, skipped: 0, failed: 0 };
        })
      : { issued: 0, skipped: 0, failed: 0 };

  const { searchParams } = new URL(request.url);
  const forced = searchParams.get("type");

  let types: ReminderType[];
  if (forced) {
    if (!isReminderType(forced)) {
      return NextResponse.json(
        { error: `Unknown type "${forced}".`, allowed: REMINDER_TYPES },
        { status: 400 }
      );
    }
    types = [forced];
  } else {
    types = dueReminderTypes(new Date(), schedule);
  }

  if (types.length === 0) {
    return NextResponse.json({ ran: [], message: "No reminders due.", backfill, access, attendance, certificatesIssued });
  }

  const results = [];
  for (const type of types) {
    results.push(
      await runReminderType(
        db,
        type,
        schedule,
        activeSession.id,
        activeSession.recordingUrl ?? undefined
      )
    );
  }

  return NextResponse.json({ ran: types, results, backfill, access, attendance, certificatesIssued });
}
