import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Invoice } from "@/lib/db/schema";
import { amountInWords } from "@/lib/pavel/amountInWords";

/**
 * GST tax invoice, rendered server-side to a PDF buffer.
 *
 * Everything printed here comes from the stored invoice row, which snapshots the
 * buyer and seller at issue time. Nothing is looked up live, so re-rendering an
 * old invoice always reproduces the document exactly as it was issued.
 *
 * Currency is written as "INR" rather than the rupee sign: the built-in PDF fonts
 * use WinAnsi encoding, which has no glyph for U+20B9, so the symbol would render
 * blank. Spelling the code out is standard on Indian tax invoices and avoids
 * bundling a font purely for one character.
 */

const NAVY = "#0C1E2E";
const MUTED = "#5B6B7A";
const RULE = "#D8DEE4";
const SOFT = "#F4F6F8";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: NAVY,
    // Tight by default: this document is stacked short lines (addresses,
    // identifiers, totals), not flowing paragraphs, so 1.5 reads as gappy.
    lineHeight: 1.35,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 14,
  },
  logo: { width: 104, marginBottom: 8 },
  sellerLegal: {
    fontSize: 8.5,
    color: NAVY,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.4,
    marginBottom: 1,
  },
  sellerLine: { fontSize: 8, color: MUTED },
  docTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.6,
    textAlign: "right",
    marginBottom: 6,
  },
  // Tight block: the page sets lineHeight 1.5 for body copy, which is far too
  // airy for stacked 8pt metadata lines.
  docMeta: {
    fontSize: 8,
    color: MUTED,
    textAlign: "right",
    lineHeight: 1.4,
  },

  section: { marginTop: 14 },
  panels: { flexDirection: "row", gap: 12 },
  panel: {
    flex: 1,
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    padding: 10,
  },

  /* Horizontal strip carrying the document/tax attributes. These describe the
     invoice, not a party, so they sit apart from the From/Bill To cards. */
  metaStrip: {
    flexDirection: "row",
    marginTop: 12,
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    backgroundColor: SOFT,
  },
  metaCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: RULE,
  },
  metaCellLast: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  metaKey: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    color: MUTED,
    marginBottom: 2,
  },
  metaValue: { fontSize: 8.5, lineHeight: 1.3 },
  panelLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: MUTED,
    marginBottom: 5,
  },
  strong: { fontFamily: "Helvetica-Bold" },
  muted: { color: MUTED },
  /** Address and identifier lines inside a party card. */
  partyLine: {},

  tableHead: {
    flexDirection: "row",
    backgroundColor: NAVY,
    color: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 18,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  thText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 0.6 },
  colDesc: { flex: 1 },
  colSac: { width: 58 },
  colAmt: { width: 84, textAlign: "right" },

  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totals: { width: 250 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: NAVY,
    color: "#FFFFFF",
  },
  grandText: { fontSize: 10, fontFamily: "Helvetica-Bold" },

  words: {
    marginTop: 14,
    backgroundColor: SOFT,
    padding: 9,
    borderRadius: 3,
  },
  paidPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    padding: 10,
  },
  paidStamp: {
    borderWidth: 1.5,
    borderColor: "#1B7F5A",
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  paidStampText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    color: "#1B7F5A",
  },

  declaration: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: NAVY,
    padding: 9,
    borderRadius: 3,
  },

  footer: {
    position: "absolute",
    bottom: 26,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingTop: 8,
    fontSize: 7.5,
    color: MUTED,
    textAlign: "center",
  },
});

/** Group digits Indian-style for INR (1,23,456.78), Western for USD. */
function formatMoney(minor: number, currency: string): string {
  const major = minor / 100;
  return major.toLocaleString(currency === "INR" ? "en-IN" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function money(minor: number, currency: string): string {
  return `${currency} ${formatMoney(minor, currency)}`;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

interface InvoiceDocumentProps {
  invoice: Invoice;
  /** Contact details for the footer, from the live seller profile. */
  contact: { supportEmail: string; phone: string; website: string };
  /** Line item wording: the service on one line, its details beneath. */
  description: { title: string; detail: string };
  /**
   * Absolute path or data URI for the logo. Falls back to the trade name as
   * text when absent, so a missing asset never breaks invoice generation.
   */
  logoSrc?: string;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  contact,
  description,
  logoSrc,
}) => {
  const currency = invoice.currency;
  const isIntraState = invoice.supplyType === "intra";
  const isExport = invoice.supplyType === "export";
  // On a domestic supply `placeOfSupply` is the buyer's state; on an export it
  // is the destination country, which the address already names.
  const isDomestic = !isExport;
  const halfRate = invoice.ratePercent / 2;

  return (
    <Document
      title={`Tax Invoice ${invoice.invoiceNo}`}
      author={invoice.sellerLegalName}
      subject={`Tax invoice for ${invoice.buyerName}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Brand and document title. Kept to a single compact band so the two
            parties below get the visual weight. */}
        <View style={styles.headerRow}>
          {logoSrc ? (
            // react-pdf's Image is a PDF drawing primitive, not an HTML <img>:
            // it takes no alt prop, and the PDF carries its own document title
            // for assistive technology.
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 15, fontFamily: "Helvetica-Bold" }}>
              {invoice.sellerTradeName ?? invoice.sellerLegalName}
            </Text>
          )}

          <View>
            <Text style={styles.docTitle}>TAX INVOICE</Text>
            <Text style={styles.docMeta}>
              Invoice No: <Text style={styles.strong}>{invoice.invoiceNo}</Text>
            </Text>
          </View>
        </View>

        {/* The two parties, given equal visual weight because they are the two
            sides of the same transaction. */}
        <View style={styles.section}>
          <View style={styles.panels}>
            <View style={styles.panel}>
              <Text style={styles.panelLabel}>FROM</Text>
              <Text style={styles.strong}>{invoice.sellerLegalName}</Text>
              {invoice.sellerTradeName ? (
                <Text style={styles.muted}>
                  trading as {invoice.sellerTradeName}
                </Text>
              ) : null}
              {invoice.sellerAddress.split("\n").map((line, i) => (
                <Text key={i} style={styles.partyLine}>
                  {line}
                </Text>
              ))}
              <Text style={{ marginTop: 3 }}>GSTIN: {invoice.sellerGstin}</Text>
              <Text style={styles.partyLine}>
                {invoice.sellerPan ? `PAN: ${invoice.sellerPan}` : ""}
                {invoice.sellerPan && invoice.sellerCin ? "   " : ""}
                {invoice.sellerCin ? `CIN: ${invoice.sellerCin}` : ""}
              </Text>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelLabel}>BILL TO</Text>
              <Text style={styles.strong}>{invoice.buyerName}</Text>
              {invoice.buyerCompany ? (
                <Text style={styles.partyLine}>{invoice.buyerCompany}</Text>
              ) : null}
              {invoice.buyerAddress
                ? invoice.buyerAddress.split("\n").map((line, i) => (
                    <Text key={i} style={styles.partyLine}>
                      {line}
                    </Text>
                  ))
                : null}
              {/* State belongs in the recipient's address, not only in the
                  place-of-supply strip. Rule 46 wants the recipient's address
                  with the state named on it, and it is collected as a mandatory
                  field anyway. Domestic supplies only: on an export
                  `placeOfSupply` holds the destination country, which the line
                  below already prints. */}
              {isDomestic && invoice.placeOfSupply ? (
                <Text style={styles.partyLine}>{invoice.placeOfSupply}</Text>
              ) : null}
              {invoice.buyerCountry ? (
                <Text style={styles.partyLine}>{invoice.buyerCountry}</Text>
              ) : null}
              <Text style={[styles.muted, styles.partyLine]}>
                {invoice.buyerEmail}
              </Text>
              {invoice.buyerGstin ? (
                <Text style={{ marginTop: 3 }}>GSTIN: {invoice.buyerGstin}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Document and tax attributes. These describe the invoice rather than a
            party, so they read as one horizontal band instead of masquerading as
            a third party card. */}
        <View style={styles.metaStrip}>
          <View style={styles.metaCell}>
            <Text style={styles.metaKey}>INVOICE DATE</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.issuedAt)}</Text>
          </View>
          <View style={styles.metaCell}>
            {/* On an export the place of supply IS the destination country, so
                label it as such rather than leaving a country name under a
                domestic-sounding heading. */}
            <Text style={styles.metaKey}>
              {isExport ? "DESTINATION" : "PLACE OF SUPPLY"}
            </Text>
            <Text style={styles.metaValue}>
              {invoice.placeOfSupply} ({invoice.placeOfSupplyCode})
            </Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaKey}>SUPPLY TYPE</Text>
            <Text style={styles.metaValue}>
              {isExport
                ? "Export of service"
                : isIntraState
                  ? "Intra-state"
                  : "Inter-state"}
            </Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaKey}>CURRENCY</Text>
            <Text style={styles.metaValue}>{currency}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaKey}>REVERSE CHARGE</Text>
            <Text style={styles.metaValue}>No</Text>
          </View>
        </View>

        {/* Line items */}
        <View style={styles.tableHead}>
          <Text style={[styles.thText, styles.colDesc]}>DESCRIPTION</Text>
          <Text style={[styles.thText, styles.colSac]}>SAC</Text>
          <Text style={[styles.thText, styles.colAmt]}>TAXABLE VALUE</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.colDesc}>
            <Text>{description.title}</Text>
            <Text style={[styles.muted, { fontSize: 8, marginTop: 2 }]}>
              {description.detail}
            </Text>
          </View>
          <Text style={styles.colSac}>{invoice.sacCode}</Text>
          <Text style={styles.colAmt}>
            {money(invoice.taxableValue, currency)}
          </Text>
        </View>

        {/* Tax summary */}
        <View style={styles.totalsWrap}>
          <View style={styles.totals}>
            {/* Show how the taxable value was reached, but only when a discount
                was actually applied. At list price the extra rows are noise. */}
            {invoice.discountAmount > 0 ? (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.muted}>Subtotal</Text>
                  <Text>{money(invoice.listValue, currency)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.muted}>
                    Discount ({invoice.discountPercent}%
                    {invoice.referralCode ? `, ${invoice.referralCode}` : ""})
                  </Text>
                  <Text>-{money(invoice.discountAmount, currency)}</Text>
                </View>
              </>
            ) : null}

            <View style={styles.totalsRow}>
              <Text style={styles.muted}>Taxable value</Text>
              <Text>{money(invoice.taxableValue, currency)}</Text>
            </View>

            {isIntraState ? (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.muted}>CGST @ {halfRate}%</Text>
                  <Text>{money(invoice.cgst, currency)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.muted}>SGST @ {halfRate}%</Text>
                  <Text>{money(invoice.sgst, currency)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.totalsRow}>
                <Text style={styles.muted}>
                  IGST @ {invoice.ratePercent}%
                  {invoice.zeroRatedUnderLut ? " (zero-rated)" : ""}
                </Text>
                <Text>{money(invoice.igst, currency)}</Text>
              </View>
            )}

            <View style={styles.grandRow}>
              <Text style={styles.grandText}>TOTAL</Text>
              <Text style={styles.grandText}>
                {money(invoice.total, currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Total in words */}
        <View style={styles.words}>
          <Text>
            <Text style={styles.muted}>Amount in words: </Text>
            <Text style={styles.strong}>
              {amountInWords(invoice.total, currency === "INR" ? "INR" : "USD")}
            </Text>
          </Text>
        </View>

        {/* Payment evidence: the invoice doubles as the buyer's receipt. */}
        <View style={styles.paidPanel}>
          <View style={{ flex: 1 }}>
            <Text style={styles.panelLabel}>PAYMENT</Text>
            <Text>
              <Text style={styles.muted}>Status: </Text>
              <Text style={styles.strong}>Paid in full</Text>
            </Text>
            {invoice.paidAt ? (
              <Text>
                <Text style={styles.muted}>Received: </Text>
                {formatDate(invoice.paidAt)}
              </Text>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.panelLabel}>REFERENCE</Text>
            <Text>
              <Text style={styles.muted}>Method: </Text>
              Razorpay
            </Text>
            {invoice.paymentReference ? (
              <Text>
                <Text style={styles.muted}>Payment ID: </Text>
                {invoice.paymentReference}
              </Text>
            ) : null}
          </View>
          <View style={styles.paidStamp}>
            <Text style={styles.paidStampText}>PAID</Text>
          </View>
        </View>

        {/* Export declaration, printed only when zero-rated under a LUT */}
        {invoice.zeroRatedUnderLut ? (
          <View style={styles.declaration}>
            <Text style={styles.strong}>
              SUPPLY MEANT FOR EXPORT UNDER LUT WITHOUT PAYMENT OF IGST
            </Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>
            {invoice.sellerTradeName
              ? `${invoice.sellerTradeName} is a brand of ${invoice.sellerLegalName}.`
              : invoice.sellerLegalName}
          </Text>
          <Text>
            {contact.supportEmail} · {contact.phone} · {contact.website}
          </Text>
          <Text style={{ marginTop: 3 }}>
            This is a computer-generated invoice and does not require a signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
