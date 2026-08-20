import { and, eq, ne } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { dispatchPavelEmail } from "@/lib/email/dispatch";
import type { EmailAttachment } from "@/lib/email/brevo";
import { issueInvoiceForRegistration } from "@/lib/pavel/invoice";
import { renderInvoicePdf, invoiceFileName } from "@/lib/pavel/invoicePdf";
import { grantWebinarAccess } from "@/lib/pavel/webinarAccess";
import { getSessionById } from "@/lib/pavel/webinarSession";
import { loadSchedule } from "@/lib/pavel/loadSchedule";
import {
  buildPavelDuplicatePaymentAdminEmail,
  buildPavelPaidConfirmationEmail,
  buildPavelPaidRegistrationAdminEmail,
  type PavelRegistrationSubmission,
} from "@/lib/email/pavelTemplates";

const SENDER = { email: "hello@fynix.digital", name: "Pavel Klimakov Workshop" };
const ADMIN_RECIPIENT = { email: "hello@fynix.digital", name: "Fynix Digital" };

export type ConfirmResult =
  | { status: "confirmed"; name: string; ref: string }
  | { status: "not_found" }
  | { status: "error"; reason: string };

/**
 * Mark a registration `paid` and fire the confirmation + admin emails — the one
 * place a seat is confirmed, shared by the Razorpay webhook (authoritative) and
 * the client-return verify route (fast path). Both are safe to call for the same
 * payment: the DB flip is idempotent and `dispatchPavelEmail` dedupes via
 * `email_log`, so whichever lands second is a harmless no-op.
 *
 * Look up by `orderId` when available (the webhook + verify both carry it);
 * `ref` is the fallback used before the order id is stamped.
 */
export async function confirmRegistrationPaid(
  db: Db,
  lookup: { orderId?: string | null; ref?: string | null; paymentId?: string | null }
): Promise<ConfirmResult> {
  const { orderId, ref, paymentId } = lookup;

  let registration:
    | {
        id: string;
        ref: string;
        name: string;
        email: string;
        country: string;
        timeZone: string | null;
        amountDisplay: string | null;
        status: string;
        sessionId: string | null;
      }
    | undefined;

  const baseSelect = {
    id: registrations.id,
    ref: registrations.ref,
    name: registrations.name,
    email: registrations.email,
    country: registrations.country,
    timeZone: registrations.timeZone,
    amountDisplay: registrations.amountDisplay,
    status: registrations.status,
    sessionId: registrations.sessionId,
  };

  try {
    if (orderId) {
      [registration] = await db
        .select(baseSelect)
        .from(registrations)
        .where(eq(registrations.razorpayOrderId, orderId))
        .limit(1);
    }
    if (!registration && ref) {
      [registration] = await db
        .select(baseSelect)
        .from(registrations)
        .where(eq(registrations.ref, ref))
        .limit(1);
    }
  } catch (lookupError) {
    return {
      status: "error",
      reason: lookupError instanceof Error ? lookupError.message : "lookup failed",
    };
  }

  if (!registration) {
    return { status: "not_found" };
  }

  // Flip to paid (idempotent: re-running just re-sets the same values). Record
  // the payment id + order id so later verifies/lookups can match either.
  if (registration.status !== "paid") {
    try {
      await db
        .update(registrations)
        .set({
          status: "paid",
          paidAt: new Date(),
          ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
          ...(orderId ? { razorpayOrderId: orderId } : {}),
        })
        .where(eq(registrations.id, registration.id));
    } catch (updateError) {
      return {
        status: "error",
        reason: updateError instanceof Error ? updateError.message : "update failed",
      };
    }

    // Double-payment watch. Razorpay captures before we hear about it, so a
    // buyer who opened two checkouts and paid both CANNOT be refused here —
    // the only wrong response would be silence. If this email already holds
    // another paid seat in the same session, alert the operator to refund the
    // duplicate. Deduped per registration in email_log like every other send,
    // so a webhook retry never re-alerts; non-fatal, so a failed alert can
    // never cost the buyer their confirmation.
    if (registration.sessionId) {
      try {
        const [duplicate] = await db
          .select({ ref: registrations.ref })
          .from(registrations)
          .where(
            and(
              eq(registrations.email, registration.email),
              eq(registrations.sessionId, registration.sessionId),
              eq(registrations.status, "paid"),
              ne(registrations.id, registration.id)
            )
          )
          .limit(1);

        if (duplicate) {
          const alert = buildPavelDuplicatePaymentAdminEmail({
            name: registration.name,
            email: registration.email,
            ref: registration.ref,
            existingRef: duplicate.ref,
            amountDisplay: registration.amountDisplay ?? undefined,
          });
          const alertResult = await dispatchPavelEmail({
            registrationId: registration.id,
            type: "duplicate_payment",
            to: [ADMIN_RECIPIENT],
            subject: alert.subject,
            htmlContent: alert.html,
            textContent: alert.text,
            sender: SENDER,
          });
          if (alertResult.status === "error") {
            console.error(
              "[pavel/confirm] duplicate-payment alert failed",
              alertResult.reason
            );
          }
        }
      } catch (duplicateError) {
        console.error(
          "[pavel/confirm] duplicate-payment check failed",
          duplicateError
        );
      }
    }
  }

  // Issue the tax invoice before the emails so the confirmation can carry it.
  // Idempotent (unique registration_id) and deliberately non-fatal: a buyer who
  // has paid must still be confirmed even if invoicing fails, and an invoice can
  // be re-issued afterwards where a missed confirmation cannot be undone.
  const invoiceResult = await issueInvoiceForRegistration(db, registration.id);
  if (invoiceResult.status === "error") {
    console.error("[pavel/confirm] invoice issuance failed", invoiceResult.reason);
  }

  // Grant webinar access: register the buyer with Zoom and get their own join
  // link. Non-fatal for the same reason invoicing is, and deliberately a single
  // attempt, because Zoom allows only three per person per webinar per day. The
  // hourly timer backfills anything that fails here.
  const accessResult = await grantWebinarAccess(db, registration.id);
  if (accessResult.status === "error") {
    console.error("[pavel/confirm] zoom registration failed", accessResult.reason);
  } else if (accessResult.status === "skipped") {
    console.warn("[pavel/confirm] zoom registration skipped:", accessResult.reason);
  }

  // Re-read the join link: grantWebinarAccess wrote it moments ago, and the
  // confirmation must carry the buyer's OWN link rather than the shared one.
  const joinUrl =
    accessResult.status === "granted" || accessResult.status === "already_granted"
      ? accessResult.joinUrl
      : undefined;

  // Render the invoice for the confirmation email. Failing to render must not
  // cost the buyer their confirmation, so this degrades to sending without the
  // attachment; the invoice stays downloadable from its permalink either way.
  let invoiceAttachments: EmailAttachment[] | undefined;
  if (invoiceResult.status !== "error") {
    try {
      const pdf = await renderInvoicePdf(invoiceResult.invoice);
      invoiceAttachments = [
        {
          name: invoiceFileName(invoiceResult.invoice),
          contentBase64: pdf.toString("base64"),
        },
      ];
    } catch (pdfError) {
      console.error("[pavel/confirm] invoice PDF render failed", pdfError);
    }
  }

  // The community invite belongs to the cohort this seat was sold into, not to
  // whichever session happens to be active when the webhook lands: the next
  // cohort is activated the moment a workshop ends, and a payment retried after
  // that would otherwise send a buyer into the wrong group. Absent (or a
  // session with no link of its own) falls back to the built-in one.
  let whatsappGroupUrl: string | undefined;
  if (registration.sessionId) {
    try {
      const session = await getSessionById(db, registration.sessionId);
      whatsappGroupUrl = session?.whatsappGroupUrl ?? undefined;
    } catch (sessionError) {
      // Non-fatal, like everything else between the payment and the send: the
      // template falls back to the constant rather than losing the panel.
      console.error("[pavel/confirm] session lookup failed", sessionError);
    }
  }

  // Fire confirmation + admin emails. Deduped per (registration, type) in
  // email_log, so a webhook retry or an overlapping verify never double-sends.
  const submission: PavelRegistrationSubmission = {
    name: registration.name,
    email: registration.email,
    country: registration.country,
    // The buyer's own zone, so the confirmation states the session in their
    // wall-clock time. Null on every seat taken before the column existed, and
    // the templates fall back to IST + UTC for those.
    timeZone: registration.timeZone ?? undefined,
    amountDisplay: registration.amountDisplay ?? undefined,
    ref: registration.ref,
    joinUrl,
    // Emails carry THIS session's date and time, not a hardcoded one.
    schedule: await loadSchedule(),
    whatsappGroupUrl,
  };

  const confirmation = buildPavelPaidConfirmationEmail(submission);
  const confirmationResult = await dispatchPavelEmail({
    registrationId: registration.id,
    type: "confirmation",
    to: [{ email: registration.email, name: registration.name }],
    subject: confirmation.subject,
    htmlContent: confirmation.html,
    textContent: confirmation.text,
    sender: SENDER,
    replyTo: SENDER,
    attachments: invoiceAttachments,
  });
  if (confirmationResult.status === "error") {
    console.error("[pavel/confirm] confirmation email failed", confirmationResult.reason);
  }

  const admin = buildPavelPaidRegistrationAdminEmail(submission);
  const adminResult = await dispatchPavelEmail({
    registrationId: registration.id,
    type: "admin",
    to: [ADMIN_RECIPIENT],
    subject: admin.subject,
    htmlContent: admin.html,
    textContent: admin.text,
    sender: SENDER,
  });
  if (adminResult.status === "error") {
    console.error("[pavel/confirm] admin email failed", adminResult.reason);
  }

  return { status: "confirmed", name: registration.name, ref: registration.ref };
}
