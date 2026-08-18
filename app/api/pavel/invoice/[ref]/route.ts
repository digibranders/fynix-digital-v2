import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import {
  findInvoiceRegistration,
  renderInvoiceDownload,
} from "@/lib/pavel/invoiceDownload";

export const runtime = "nodejs";
// Streams a per-buyer document; must never be cached or statically rendered.
export const dynamic = "force-dynamic";

/**
 * Download the tax invoice for a paid registration as a PDF — buyer route.
 *
 * An invoice carries more personal data than the thank-you page (company name,
 * GSTIN, billing address), so a valid `ref` alone is not enough to see it.
 * Access requires the Razorpay `payment_id`, which only the buyer has: it comes
 * back on their redirect and appears in their confirmation email.
 *
 * The payment id is compared against the one stored for THIS registration, so a
 * payment id from some other order does not unlock it. Nothing personal is put
 * in the query string.
 *
 * Operators do not use this route; the admin console downloads through
 * `/api/admin/invoice/[ref]`, which authorises with the admin session.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const paymentId = new URL(request.url).searchParams.get("payment_id");

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  const registration = await findInvoiceRegistration(db, ref);

  // Same response whether the ref is wrong or the caller simply is not
  // authorised, so this cannot be used to probe which refs exist.
  const authorised = Boolean(
    registration &&
      paymentId &&
      registration.razorpayPaymentId &&
      paymentId === registration.razorpayPaymentId
  );

  if (!registration || !authorised) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return renderInvoiceDownload(db, ref, registration);
}
