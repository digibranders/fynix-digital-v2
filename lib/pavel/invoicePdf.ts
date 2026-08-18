import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/db/schema";
import { InvoiceDocument } from "@/components/pavel/invoice/InvoiceDocument";
import { getSellerProfile } from "@/lib/pavel/sellerProfile";
import { WORKSHOP } from "@/components/pavel/workshopDetails";

/**
 * Render an issued invoice to a PDF buffer.
 *
 * Server-only: `renderToBuffer` needs Node APIs, so this module must never reach
 * client code. The buffer is generated on demand rather than stored, since the
 * invoice row already holds every value the document prints and re-rendering is
 * cheap and deterministic.
 */

/** Line-item wording for the single service supplied. */
function describeService(): string {
  return `Semantic SEO Masterclass with Pavel Klimakov (${WORKSHOP.format}, ${WORKSHOP.dateLabel})`;
}

export async function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  const seller = getSellerProfile();

  // InvoiceDocument renders a <Document> at its root, but TypeScript cannot see
  // through the component boundary to know that, so renderToBuffer's element
  // type has to be asserted here.
  const element = React.createElement(InvoiceDocument, {
    invoice,
    contact: {
      supportEmail: seller.supportEmail,
      phone: seller.phone,
      website: seller.website,
    },
    description: describeService(),
  }) as React.ReactElement<DocumentProps>;

  return renderToBuffer(element);
}

/** Filename used for downloads and email attachments, e.g. "FYX-26-27-0001.pdf". */
export function invoiceFileName(invoice: Invoice): string {
  return `${invoice.invoiceNo.replace(/\//g, "-")}.pdf`;
}
