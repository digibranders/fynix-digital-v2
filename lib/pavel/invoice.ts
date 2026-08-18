import { and, asc, eq, isNull } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { invoices, registrations, type Invoice } from "@/lib/db/schema";
import { PRICING, type Country } from "@/components/pavel/pricing";
import { computeTax } from "@/lib/pavel/tax";
import { allocateInvoiceNumber } from "@/lib/pavel/invoiceNumber";
import { getSellerProfile } from "@/lib/pavel/sellerProfile";

/**
 * Issue the tax invoice for a paid registration.
 *
 * Called from the paid transition (see confirm.ts). Two properties matter:
 *
 * 1. **Idempotent.** `invoices.registration_id` is unique, so a retried webhook
 *    or an overlapping verify cannot burn a second invoice number. A repeat call
 *    returns the invoice that already exists.
 * 2. **Non-fatal.** This never throws at the caller. A buyer who has paid must
 *    still get their confirmation and access even if invoicing fails; a failed
 *    invoice can be re-issued afterwards, a missed confirmation cannot be undone.
 *
 * The amounts are recomputed from the taxable base rather than trusted from the
 * request, then reconciled against the amount actually charged. A mismatch means
 * the buyer would be invoiced for something other than what they paid, so it
 * refuses to issue and reports instead of papering over it.
 */

/** Attempts, and the pause between them, for a transient issuance failure. */
const ISSUE_ATTEMPTS = 3;
const RETRY_DELAY_MS = 250;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry a transaction that failed for a transient reason (lock contention, a
 * dropped connection). The last error is rethrown so the caller still reports a
 * real failure rather than a silent one.
 */
async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= ISSUE_ATTEMPTS; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      // A duplicate key means a concurrent caller already issued this invoice.
      // Retrying cannot help, and the caller resolves it by returning theirs.
      if (isUniqueViolation(error)) throw error;
      if (attempt < ISSUE_ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ((error as { code?: unknown }).code === "23505") return true;
  const message = (error as { message?: unknown }).message;
  return (
    typeof message === "string" &&
    /duplicate key|unique constraint/i.test(message)
  );
}

export type IssueInvoiceResult =
  | { status: "issued"; invoice: Invoice }
  | { status: "exists"; invoice: Invoice }
  | { status: "error"; reason: string };

export async function issueInvoiceForRegistration(
  db: Db,
  registrationId: string
): Promise<IssueInvoiceResult> {
  try {
    const existing = await findInvoice(db, registrationId);
    if (existing) return { status: "exists", invoice: existing };

    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (!registration) {
      return { status: "error", reason: `Registration ${registrationId} not found.` };
    }
    if (registration.status !== "paid") {
      return {
        status: "error",
        reason: `Refusing to invoice registration ${registration.ref}: status is ${registration.status}, not paid.`,
      };
    }

    const seller = getSellerProfile();
    const country: Country = registration.country === "IN" ? "IN" : "REST";
    const price = PRICING[country];

    const tax = computeTax({
      country,
      state: registration.state,
      destinationCountry: registration.countryName,
      base: price.base,
      discountPercent: registration.discountPercent,
      lutActive: seller.lutActive,
    });

    // Reconcile against what Razorpay actually charged. Older rows predate the
    // amount_charged column, so only check when it is present.
    if (
      typeof registration.amountCharged === "number" &&
      registration.amountCharged !== tax.total
    ) {
      return {
        status: "error",
        reason:
          `Amount mismatch for ${registration.ref}: charged ${registration.amountCharged} ` +
          `but computed ${tax.total}. Not issuing an invoice that disagrees with the payment.`,
      };
    }

    const issuedAt = registration.paidAt ?? new Date();

    // One transaction: reserve the number and write the row together, so a
    // rollback releases the number instead of leaving a gap in the series.
    //
    // Retried in-process on a transient failure. Invoice numbers are allocated
    // in issuance order, so an invoice that fails now and succeeds an hour later
    // would carry a number issued after payments that landed in between, leaving
    // it out of date order. Reserving the number up front would fix the ordering
    // but leave a permanent gap whenever issuance never succeeds, and GST wants
    // the series consecutive rather than date-ordered. Retrying immediately
    // keeps both properties in every realistic case.
    const invoice = await withRetry(() =>
      db.transaction(async (tx) => {
        const { invoiceNo, fy } = await allocateInvoiceNumber(tx as Db, issuedAt);

      const [row] = await (tx as Db)
        .insert(invoices)
        .values({
          registrationId: registration.id,
          invoiceNo,
          fy,
          issuedAt,

          supplyType: tax.supplyType,
          placeOfSupply: tax.placeOfSupply,
          placeOfSupplyCode: tax.placeOfSupplyCode,
          currency: registration.currency ?? price.currencyCode,

          listValue: price.base,
          discountPercent: registration.discountPercent ?? 0,
          discountAmount: price.base - tax.taxable,
          referralCode: registration.referralCode,

          taxableValue: tax.taxable,
          cgst: tax.cgst,
          sgst: tax.sgst,
          igst: tax.igst,
          totalTax: tax.totalTax,
          total: tax.total,
          ratePercent: tax.ratePercent,
          zeroRatedUnderLut: tax.zeroRatedUnderLut,

          buyerName: registration.name,
          buyerEmail: registration.email,
          buyerGstin: registration.gstin,
          buyerCompany: registration.companyName,
          buyerAddress: registration.companyAddress,
          buyerCountry: registration.countryName,

          sellerLegalName: seller.legalName,
          sellerTradeName: seller.tradeName,
          sellerGstin: seller.gstin,
          sellerAddress: seller.address,
          sellerCin: seller.cin,
          sellerPan: seller.pan,
          sacCode: seller.sacCode,

            paymentReference: registration.razorpayPaymentId,
            paidAt: registration.paidAt,
          })
          .returning();

        return row;
      })
    );

    return { status: "issued", invoice };
  } catch (error) {
    // A concurrent caller may have won the race between our existence check and
    // the insert. The unique constraint is the real guarantee, so treat that as
    // success and return the invoice they created.
    const existing = await findInvoice(db, registrationId).catch(() => undefined);
    if (existing) return { status: "exists", invoice: existing };

    return {
      status: "error",
      reason: error instanceof Error ? error.message : "invoice issuance failed",
    };
  }
}

async function findInvoice(
  db: Db,
  registrationId: string
): Promise<Invoice | undefined> {
  const [row] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.registrationId, registrationId))
    .limit(1);
  return row;
}

/**
 * Issue invoices for any paid registration that is missing one.
 *
 * Processed strictly in payment order, so a batch of recovered invoices is
 * numbered in the same order the payments were received rather than in whatever
 * order the rows happen to come back. That keeps the series date-ordered in the
 * one case where ordering could otherwise slip: several issuances failing and
 * being recovered together.
 *
 * Safe to run repeatedly. Registrations that already have an invoice are
 * skipped by the idempotency check, so this can sit on a schedule as a
 * self-healing step.
 */
export async function backfillMissingInvoices(
  db: Db,
  limit = 100
): Promise<{ issued: number; failed: number; invoiceNos: string[] }> {
  const missing = await db
    .select({ id: registrations.id })
    .from(registrations)
    .leftJoin(invoices, eq(invoices.registrationId, registrations.id))
    .where(and(eq(registrations.status, "paid"), isNull(invoices.id)))
    .orderBy(asc(registrations.paidAt))
    .limit(limit);

  const invoiceNos: string[] = [];
  let failed = 0;

  // Sequential on purpose: issuing in parallel would hand out numbers in
  // completion order rather than payment order.
  for (const row of missing) {
    const result = await issueInvoiceForRegistration(db, row.id);
    if (result.status === "error") {
      console.error("[pavel/invoice] backfill failed", result.reason);
      failed += 1;
    } else if (result.status === "issued") {
      invoiceNos.push(result.invoice.invoiceNo);
    }
  }

  return { issued: invoiceNos.length, failed, invoiceNos };
}

/** Look up an issued invoice by the registration's public ref. */
export async function getInvoiceByRef(
  db: Db,
  ref: string
): Promise<Invoice | undefined> {
  const [registration] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.ref, ref))
    .limit(1);

  if (!registration) return undefined;
  return findInvoice(db, registration.id);
}
