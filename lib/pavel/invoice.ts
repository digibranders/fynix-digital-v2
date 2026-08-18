import { eq } from "drizzle-orm";
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
    const invoice = await db.transaction(async (tx) => {
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

          sellerLegalName: seller.legalName,
          sellerTradeName: seller.tradeName,
          sellerGstin: seller.gstin,
          sellerAddress: seller.address,
          sellerCin: seller.cin,
          sacCode: seller.sacCode,
        })
        .returning();

      return row;
    });

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
