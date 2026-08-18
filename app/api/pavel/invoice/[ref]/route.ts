import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { getInvoiceByRef } from "@/lib/pavel/invoice";
import { renderInvoicePdf, invoiceFileName } from "@/lib/pavel/invoicePdf";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export const runtime = "nodejs";
// Streams a per-buyer document; must never be cached or statically rendered.
export const dynamic = "force-dynamic";

/**
 * Download the tax invoice for a paid registration as a PDF.
 *
 * An invoice carries more personal data than the thank-you page (company name,
 * GSTIN, billing address), so a valid `ref` alone is not enough to see it.
 * Access requires either:
 *
 *   - an authenticated admin session, or
 *   - the Razorpay `payment_id`, which only the buyer has (it comes back on
 *     their redirect and appears in their confirmation email).
 *
 * The payment id is compared against the one stored for THIS registration, so a
 * payment id from some other order does not unlock it. Nothing personal is put
 * in the query string.
 *
 * The PDF is rendered on demand from the stored invoice row rather than kept on
 * disk: the row snapshots every value the document prints, so the output is
 * identical every time.
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

  const [registration] = await db
    .select({
      status: registrations.status,
      razorpayPaymentId: registrations.razorpayPaymentId,
    })
    .from(registrations)
    .where(eq(registrations.ref, ref))
    .limit(1);

  if (!registration) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const isAdmin = await isAdminAuthenticated();
  const hasMatchingPayment = Boolean(
    paymentId &&
      registration.razorpayPaymentId &&
      paymentId === registration.razorpayPaymentId
  );

  if (!isAdmin && !hasMatchingPayment) {
    // Same response whether the ref is wrong or the caller simply is not
    // authorised, so this cannot be used to probe which refs exist.
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (registration.status !== "paid") {
    return NextResponse.json(
      { error: "No invoice: this seat is not paid." },
      { status: 409 }
    );
  }

  const invoice = await getInvoiceByRef(db, ref);
  if (!invoice) {
    return NextResponse.json(
      { error: "Invoice has not been issued yet. Please try again shortly." },
      { status: 404 }
    );
  }

  try {
    const pdf = await renderInvoicePdf(invoice);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoiceFileName(invoice)}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[pavel/invoice] PDF render failed", error);
    return NextResponse.json(
      { error: "Could not generate the invoice." },
      { status: 500 }
    );
  }
}
