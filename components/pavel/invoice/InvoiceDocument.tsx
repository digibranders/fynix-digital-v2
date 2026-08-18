import React from "react";
import {
  Document,
  Page,
  Text,
  View,
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
    lineHeight: 1.5,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 14,
  },
  sellerName: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  sellerLegal: { fontSize: 8, color: MUTED, marginTop: 2 },
  sellerLine: { fontSize: 8, color: MUTED },
  docTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.6,
    textAlign: "right",
  },
  docMeta: { fontSize: 8, color: MUTED, textAlign: "right", marginTop: 4 },

  section: { marginTop: 18 },
  panels: { flexDirection: "row", gap: 14 },
  panel: {
    flex: 1,
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    padding: 10,
  },
  panelLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: MUTED,
    marginBottom: 5,
  },
  strong: { fontFamily: "Helvetica-Bold" },
  muted: { color: MUTED },

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
  /** Service description printed on the single line item. */
  description: string;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  contact,
  description,
}) => {
  const currency = invoice.currency;
  const isIntraState = invoice.supplyType === "intra";
  const isExport = invoice.supplyType === "export";
  const halfRate = invoice.ratePercent / 2;

  return (
    <Document
      title={`Tax Invoice ${invoice.invoiceNo}`}
      author={invoice.sellerLegalName}
      subject={`Tax invoice for ${invoice.buyerName}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Seller identity and document title */}
        <View style={styles.headerRow}>
          <View style={{ maxWidth: 280 }}>
            <Text style={styles.sellerName}>
              {invoice.sellerTradeName ?? invoice.sellerLegalName}
            </Text>
            <Text style={styles.sellerLegal}>{invoice.sellerLegalName}</Text>
            {invoice.sellerAddress.split("\n").map((line, i) => (
              <Text key={i} style={styles.sellerLine}>
                {line}
              </Text>
            ))}
            <Text style={[styles.sellerLine, { marginTop: 3 }]}>
              GSTIN: {invoice.sellerGstin}
            </Text>
            {invoice.sellerCin ? (
              <Text style={styles.sellerLine}>CIN: {invoice.sellerCin}</Text>
            ) : null}
          </View>

          <View>
            <Text style={styles.docTitle}>TAX INVOICE</Text>
            <Text style={styles.docMeta}>
              Invoice No: <Text style={styles.strong}>{invoice.invoiceNo}</Text>
            </Text>
            <Text style={styles.docMeta}>
              Date: {formatDate(invoice.issuedAt)}
            </Text>
            <Text style={styles.docMeta}>
              Reverse charge: No
            </Text>
          </View>
        </View>

        {/* Buyer and supply details */}
        <View style={styles.section}>
          <View style={styles.panels}>
            <View style={styles.panel}>
              <Text style={styles.panelLabel}>BILL TO</Text>
              <Text style={styles.strong}>{invoice.buyerName}</Text>
              {invoice.buyerCompany ? (
                <Text>{invoice.buyerCompany}</Text>
              ) : null}
              {invoice.buyerAddress
                ? invoice.buyerAddress
                    .split("\n")
                    .map((line, i) => <Text key={i}>{line}</Text>)
                : null}
              <Text style={styles.muted}>{invoice.buyerEmail}</Text>
              {invoice.buyerGstin ? (
                <Text style={{ marginTop: 3 }}>GSTIN: {invoice.buyerGstin}</Text>
              ) : null}
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelLabel}>SUPPLY DETAILS</Text>
              <Text>
                <Text style={styles.muted}>Place of supply: </Text>
                {invoice.placeOfSupply} ({invoice.placeOfSupplyCode})
              </Text>
              <Text>
                <Text style={styles.muted}>Supply type: </Text>
                {isExport
                  ? "Export of service"
                  : isIntraState
                    ? "Intra-state"
                    : "Inter-state"}
              </Text>
              <Text>
                <Text style={styles.muted}>Currency: </Text>
                {currency}
              </Text>
            </View>
          </View>
        </View>

        {/* Line items */}
        <View style={styles.tableHead}>
          <Text style={[styles.thText, styles.colDesc]}>DESCRIPTION</Text>
          <Text style={[styles.thText, styles.colSac]}>SAC</Text>
          <Text style={[styles.thText, styles.colAmt]}>TAXABLE VALUE</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>{description}</Text>
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
