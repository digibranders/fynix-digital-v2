import React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

/** Line-item wording: the service, with its format and date on a second line. */
function describeService(): { title: string; detail: string } {
  return {
    title: "Semantic SEO Masterclass with Pavel Klimakov",
    detail: `${WORKSHOP.format}, ${WORKSHOP.dateLabel}`,
  };
}

/**
 * Logo for the invoice header, read from disk once and cached as a data URI.
 *
 * react-pdf cannot rasterise SVG through <Image>, so this is the PNG export of
 * the brand mark. Read at module scope rather than per render, and resolved
 * from the bundled public directory so it works the same on the droplet as it
 * does locally. A missing file is not fatal: the template falls back to the
 * trade name as text rather than failing to produce an invoice.
 */
let cachedLogo: string | null | undefined;

function getLogoDataUri(): string | undefined {
  if (cachedLogo !== undefined) return cachedLogo ?? undefined;
  try {
    const file = join(process.cwd(), "public", "invoice", "fynix-logo.png");
    cachedLogo = `data:image/png;base64,${readFileSync(file).toString("base64")}`;
  } catch (error) {
    console.error("[pavel/invoicePdf] logo unavailable, falling back to text", error);
    cachedLogo = null;
  }
  return cachedLogo ?? undefined;
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
    logoSrc: getLogoDataUri(),
  }) as React.ReactElement<DocumentProps>;

  return renderToBuffer(element);
}

/** Filename used for downloads and email attachments, e.g. "FYX-26-27-0001.pdf". */
export function invoiceFileName(invoice: Invoice): string {
  return `${invoice.invoiceNo.replace(/\//g, "-")}.pdf`;
}
