import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { getInvoiceByRef } from "@/lib/pavel/invoice";
import { renderInvoicePdf, invoiceFileName } from "@/lib/pavel/invoicePdf";

/**
 * Shared pieces of "download the tax invoice for a registration".
 *
 * Two routes serve the same PDF to different callers: `/api/pavel/invoice/[ref]`
 * for the buyer (who proves access with their Razorpay payment id) and
 * `/api/admin/data/invoice/[ref]` for the admin console. They differ only in how
 * they authorise, so the lookup and the render live here.
 */

export type InvoiceRegistration = {
  status: string;
  razorpayPaymentId: string | null;
};

/** Fetch the fields needed to authorise and gate an invoice download. */
export async function findInvoiceRegistration(
  db: Db,
  ref: string
): Promise<InvoiceRegistration | null> {
  const [registration] = await db
    .select({
      status: registrations.status,
      razorpayPaymentId: registrations.razorpayPaymentId,
    })
    .from(registrations)
    .where(eq(registrations.ref, ref))
    .limit(1);

  return registration ?? null;
}

/**
 * Render the stored invoice for `ref` as a PDF response.
 *
 * Call only after authorising the request. The PDF is built on demand from the
 * invoice row rather than kept on disk: the row snapshots every value the
 * document prints, so the output is identical every time.
 */
export async function renderInvoiceDownload(
  db: Db,
  ref: string,
  registration: InvoiceRegistration
): Promise<NextResponse> {
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
