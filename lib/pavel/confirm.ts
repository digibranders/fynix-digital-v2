import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { dispatchPavelEmail } from "@/lib/email/dispatch";
import { issueInvoiceForRegistration } from "@/lib/pavel/invoice";
import {
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
        amountDisplay: string | null;
        status: string;
      }
    | undefined;

  const baseSelect = {
    id: registrations.id,
    ref: registrations.ref,
    name: registrations.name,
    email: registrations.email,
    country: registrations.country,
    amountDisplay: registrations.amountDisplay,
    status: registrations.status,
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
  }

  // Issue the tax invoice before the emails so the confirmation can carry it.
  // Idempotent (unique registration_id) and deliberately non-fatal: a buyer who
  // has paid must still be confirmed even if invoicing fails, and an invoice can
  // be re-issued afterwards where a missed confirmation cannot be undone.
  const invoiceResult = await issueInvoiceForRegistration(db, registration.id);
  if (invoiceResult.status === "error") {
    console.error("[pavel/confirm] invoice issuance failed", invoiceResult.reason);
  }

  // Fire confirmation + admin emails. Deduped per (registration, type) in
  // email_log, so a webhook retry or an overlapping verify never double-sends.
  const submission: PavelRegistrationSubmission = {
    name: registration.name,
    email: registration.email,
    country: registration.country,
    amountDisplay: registration.amountDisplay ?? undefined,
    ref: registration.ref,
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
