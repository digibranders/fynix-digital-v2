import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";

/**
 * A complete registration row for tests to vary one field at a time.
 *
 * Lives beside the type rather than inside a single test file because three
 * suites need it (grouping, filters, totals), and a partial literal in each
 * would break every one of them whenever a column is added.
 */
export function testRow(
  overrides: Partial<AdminRegistrationRow> = {}
): AdminRegistrationRow {
  return {
    ref: "PVL-0000",
    name: "Guest",
    email: "guest@example.com",
    phone: null,
    companyName: null,
    gstin: null,
    companyAddress: null,
    country: "IN",
    countryName: "India",
    countryCode: "IN",
    state: "Maharashtra",

    referralCode: null,
    discountPercent: null,
    codeOwnerName: null,
    codeOwnerEmail: null,
    codeCommissionPercent: null,

    status: "pending",
    amountDisplay: null,
    amountCharged: null,
    currency: null,
    razorpayOrderId: null,
    razorpayPaymentId: null,
    createdAt: "2026-08-18T00:00:00.000Z",
    paidAt: null,

    invoiceNo: null,
    invoiceIssuedAt: null,
    invoiceFy: null,
    listValue: null,
    discountAmount: null,
    taxableValue: null,
    cgst: null,
    sgst: null,
    igst: null,
    totalTax: null,
    invoiceTotal: null,
    taxRatePercent: null,
    supplyType: null,
    placeOfSupply: null,
    zeroRatedUnderLut: null,

    sessionLabel: null,
    sessionStartsAt: null,
    sessionEndsAt: null,
    zoomWebinarId: null,
    zoomRegistrantId: null,
    zoomRegisteredAt: null,
    zoomAccessAttempts: 0,
    zoomAccessLastAttemptAt: null,
    hasJoinLink: false,

    attendedMinutes: null,
    firstJoinedAt: null,
    attendanceSyncedAt: null,
    credentialId: null,
    certificateIssuedAt: null,

    emailTypes: [],
    lastEmailAt: null,
    ...overrides,
  };
}
