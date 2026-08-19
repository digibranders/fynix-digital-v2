import {
  attendanceBand,
  certificateEligibleUnissued,
  invoiceMissing,
  joinLinkMissing,
  rowCommission,
  type AdminRegistrationRow,
} from "@/lib/admin/registrationRow";

/**
 * Summary figures for whatever is currently on screen.
 *
 * Money is kept PER CURRENCY and never added across them. The workshop sells in
 * rupees and dollars, and a single "total collected" would be the sum of two
 * different units: a number that looks authoritative and means nothing. Every
 * money field here is therefore a map keyed by currency code, and the UI prints
 * each one separately.
 */

/** Money in minor units, keyed by ISO currency code. */
export type MoneyByCurrency = Record<string, number>;

export type RegistrationTotals = {
  /** Seats, not money: safe to add across currencies. */
  total: number;
  paid: number;
  pending: number;
  /** Paid as a share of all rows, 0 to 100. */
  conversionPercent: number;

  collected: MoneyByCurrency;
  listValue: MoneyByCurrency;
  discountGiven: MoneyByCurrency;
  netExTax: MoneyByCurrency;
  taxCollected: MoneyByCurrency;
  commissionOwed: MoneyByCurrency;
  /** collected / paid seats, per currency. */
  averageOrder: MoneyByCurrency;

  attendedSynced: number;
  attendedTotalMinutes: number;
  noShows: number;
  certificatesIssued: number;

  /** Things an operator should act on. */
  invoicesMissing: number;
  joinLinksMissing: number;
  certificatesUnissued: number;
};

function add(target: MoneyByCurrency, currency: string | null, amount: number | null) {
  if (!currency || amount === null || !Number.isFinite(amount)) return;
  target[currency] = (target[currency] ?? 0) + amount;
}

/**
 * Fold rows into the summary bar.
 *
 * Deliberately takes the rows the operator can currently see rather than all of
 * them: a filtered view that reported unfiltered totals would answer a question
 * nobody asked.
 */
export function computeTotals(rows: AdminRegistrationRow[]): RegistrationTotals {
  const totals: RegistrationTotals = {
    total: rows.length,
    paid: 0,
    pending: 0,
    conversionPercent: 0,
    collected: {},
    listValue: {},
    discountGiven: {},
    netExTax: {},
    taxCollected: {},
    commissionOwed: {},
    averageOrder: {},
    attendedSynced: 0,
    attendedTotalMinutes: 0,
    noShows: 0,
    certificatesIssued: 0,
    invoicesMissing: 0,
    joinLinksMissing: 0,
    certificatesUnissued: 0,
  };

  const paidByCurrency: Record<string, number> = {};

  for (const row of rows) {
    if (row.status === "paid") {
      totals.paid += 1;
      // Only paid seats carry money. A pending row can hold an amount from a
      // Razorpay order that was never completed, and counting it would report
      // revenue nobody received.
      add(totals.collected, row.currency, row.amountCharged);
      add(totals.listValue, row.currency, row.listValue);
      add(totals.discountGiven, row.currency, row.discountAmount);
      add(totals.netExTax, row.currency, row.taxableValue);
      add(totals.taxCollected, row.currency, row.totalTax);
      add(totals.commissionOwed, row.currency, rowCommission(row));
      if (row.currency && row.amountCharged !== null) {
        paidByCurrency[row.currency] = (paidByCurrency[row.currency] ?? 0) + 1;
      }
    } else {
      totals.pending += 1;
    }

    const band = attendanceBand(row);
    if (band === "no_show") totals.noShows += 1;
    if (band === "full" || band === "partial") {
      totals.attendedSynced += 1;
      totals.attendedTotalMinutes += row.attendedMinutes ?? 0;
    }

    if (row.credentialId) totals.certificatesIssued += 1;
    if (invoiceMissing(row)) totals.invoicesMissing += 1;
    if (joinLinkMissing(row)) totals.joinLinksMissing += 1;
    if (certificateEligibleUnissued(row)) totals.certificatesUnissued += 1;
  }

  totals.conversionPercent =
    totals.total > 0 ? Math.round((totals.paid / totals.total) * 100) : 0;

  for (const [currency, amount] of Object.entries(totals.collected)) {
    const count = paidByCurrency[currency] ?? 0;
    if (count > 0) totals.averageOrder[currency] = Math.round(amount / count);
  }

  return totals;
}

/** Format minor units for display, e.g. 749900 INR -> "₹7,499". */
export function formatMoney(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    // An unknown currency code must not take the dashboard down with it.
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}

/**
 * Render a per-currency total as one string, e.g. "₹4,12,000 + $594".
 *
 * Joined with a plus rather than summed: they are different units, and the plus
 * is what keeps that visible to whoever reads the number.
 */
export function formatMoneyByCurrency(money: MoneyByCurrency): string {
  const parts = Object.entries(money)
    .filter(([, amount]) => amount !== 0)
    // Stable order so the figure does not reshuffle between renders.
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, amount]) => formatMoney(amount, currency));
  return parts.length > 0 ? parts.join(" + ") : "—";
}
