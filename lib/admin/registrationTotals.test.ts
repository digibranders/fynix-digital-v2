import { describe, expect, it } from "vitest";
import { testRow as row } from "@/lib/admin/testRow";
import {
  computeTotals,
  formatMoneyByCurrency,
} from "@/lib/admin/registrationTotals";
import {
  amountMismatch,
  attendanceBand,
  attendancePercent,
  certificateEligibleUnissued,
  isAbandoned,
  minutesToPay,
  rowCommission,
} from "@/lib/admin/registrationRow";

/** A paid Indian seat: ₹7,499 list, 25% off, GST on the discounted base. */
const paidInr = row({
  status: "paid",
  currency: "INR",
  amountCharged: 663750,
  listValue: 749900,
  discountAmount: 187475,
  taxableValue: 562500,
  totalTax: 101250,
  invoiceTotal: 663750,
  invoiceNo: "FYX/26-27/0001",
  paidAt: "2026-08-18T01:00:00.000Z",
});

/** A paid export seat: $99, zero-rated. */
const paidUsd = row({
  status: "paid",
  currency: "USD",
  amountCharged: 9900,
  listValue: 9900,
  discountAmount: 0,
  taxableValue: 9900,
  totalTax: 0,
  invoiceTotal: 9900,
  invoiceNo: "FYX/26-27/0002",
  paidAt: "2026-08-18T02:00:00.000Z",
});

describe("computeTotals", () => {
  it("keeps each currency separate rather than summing them", () => {
    const t = computeTotals([paidInr, paidUsd]);
    // The whole point: ₹6,637.50 and $99 are different units and must never be
    // added into one figure.
    expect(t.collected).toEqual({ INR: 663750, USD: 9900 });
    expect(t.netExTax).toEqual({ INR: 562500, USD: 9900 });
    expect(t.taxCollected).toEqual({ INR: 101250, USD: 0 });
    expect(t.discountGiven).toEqual({ INR: 187475, USD: 0 });
  });

  it("counts seats across currencies, because a seat is a seat", () => {
    const t = computeTotals([paidInr, paidUsd, row({ status: "pending" })]);
    expect(t.total).toBe(3);
    expect(t.paid).toBe(2);
    expect(t.pending).toBe(1);
    expect(t.conversionPercent).toBe(67);
  });

  it("ignores money on unpaid rows", () => {
    // A pending seat can carry an amount from a Razorpay order nobody completed.
    const abandoned = row({ status: "pending", currency: "INR", amountCharged: 663750 });
    const t = computeTotals([abandoned]);
    expect(t.collected).toEqual({});
  });

  it("averages the order value per currency", () => {
    const t = computeTotals([paidInr, paidInr, paidUsd]);
    expect(t.averageOrder).toEqual({ INR: 663750, USD: 9900 });
  });

  it("counts commission only where a code carries one", () => {
    const withCommission = row({
      ...paidInr,
      codeCommissionPercent: 20,
      taxableValue: 562500,
    });
    const t = computeTotals([withCommission, paidUsd]);
    expect(t.commissionOwed).toEqual({ INR: 112500 });
  });

  it("surfaces the things an operator must act on", () => {
    const t = computeTotals([
      row({ status: "paid", invoiceNo: null }), // invoice never issued
      row({ status: "paid", hasJoinLink: false }), // cannot attend
      row({ status: "paid", attendedMinutes: 120, certificateEarned: true, credentialId: null }), // earned, unissued
    ]);
    expect(t.invoicesMissing).toBe(3);
    expect(t.joinLinksMissing).toBe(3);
    expect(t.certificatesUnissued).toBe(1);
  });

  it("separates no-shows from seats never synced", () => {
    const t = computeTotals([
      row({ status: "paid", attendedMinutes: 0 }),
      row({ status: "paid", attendedMinutes: null }),
      row({ status: "paid", attendedMinutes: 45 }),
    ]);
    expect(t.noShows).toBe(1);
    expect(t.attendedSynced).toBe(1);
    expect(t.attendedTotalMinutes).toBe(45);
  });

  it("reports zero conversion on an empty set rather than dividing by zero", () => {
    const t = computeTotals([]);
    expect(t.conversionPercent).toBe(0);
    expect(t.collected).toEqual({});
  });
});

describe("formatMoneyByCurrency", () => {
  it("joins currencies with a plus so they read as separate units", () => {
    // Summary figures are shown in whole units, so ₹6,637.50 rounds to ₹6,638.
    const text = formatMoneyByCurrency({ INR: 663750, USD: 9900 });
    expect(text).toContain("+");
    expect(text).toMatch(/6,638/);
    expect(text).toMatch(/99/);
  });

  it("shows a dash when there is nothing", () => {
    expect(formatMoneyByCurrency({})).toBe("—");
    expect(formatMoneyByCurrency({ INR: 0 })).toBe("—");
  });
});

describe("derived row values", () => {
  it("bands attendance, treating unsynced as unknown not zero", () => {
    expect(
      attendanceBand(row({ status: "paid", attendedMinutes: 120, certificateEarned: true }))
    ).toBe("full");
    expect(attendanceBand(row({ status: "paid", attendedMinutes: 45 }))).toBe("partial");
    expect(attendanceBand(row({ status: "paid", attendedMinutes: 0 }))).toBe("no_show");
    expect(attendanceBand(row({ status: "paid", attendedMinutes: null }))).toBe("not_synced");
    expect(attendanceBand(row({ status: "pending" }))).toBe("n/a");
  });

  it("computes attendance against the session length and caps at 100", () => {
    const base = {
      status: "paid",
      sessionStartsAt: "2026-09-01T11:30:00.000Z",
      sessionEndsAt: "2026-09-01T14:30:00.000Z", // 180 minutes
    };
    expect(attendancePercent(row({ ...base, attendedMinutes: 90 }))).toBe(50);
    // Joining early and leaving late must not report 110% and read as a bug.
    expect(attendancePercent(row({ ...base, attendedMinutes: 200 }))).toBe(100);
    expect(attendancePercent(row({ attendedMinutes: 90 }))).toBeNull();
  });

  it("flags a charged amount that does not match the invoice", () => {
    expect(amountMismatch(row({ amountCharged: 100, invoiceTotal: 100 }))).toBe(false);
    expect(amountMismatch(row({ amountCharged: 100, invoiceTotal: 90 }))).toBe(true);
    // No invoice is "missing", not "mismatched".
    expect(amountMismatch(row({ amountCharged: 100, invoiceTotal: null }))).toBe(false);
  });

  it("measures time to pay", () => {
    expect(
      minutesToPay(
        row({ createdAt: "2026-08-18T00:00:00Z", paidAt: "2026-08-18T00:08:00Z" })
      )
    ).toBe(8);
    expect(minutesToPay(row({ paidAt: null }))).toBeNull();
  });

  it("only calls a seat abandoned once it is old and unpaid", () => {
    const now = new Date("2026-08-19T10:00:00Z");
    expect(isAbandoned(row({ status: "pending", createdAt: "2026-08-01T00:00:00Z" }), now)).toBe(true);
    expect(isAbandoned(row({ status: "pending", createdAt: "2026-08-18T00:00:00Z" }), now)).toBe(false);
    expect(isAbandoned(row({ status: "paid", createdAt: "2026-01-01T00:00:00Z" }), now)).toBe(false);
  });

  it("pays commission on the ex-GST value, never the gross", () => {
    const r = row({ taxableValue: 562500, invoiceTotal: 663750, codeCommissionPercent: 20 });
    expect(rowCommission(r)).toBe(112500); // 20% of 5625.00, not of 6637.50
    expect(rowCommission(row({ taxableValue: 562500 }))).toBeNull();
  });

  it("takes the server's word on who earned a certificate", () => {
    // The threshold is configurable and lives on the server, so the console
    // reports what it was told rather than re-deciding with a stale number.
    expect(
      certificateEligibleUnissued(row({ certificateEarned: true, credentialId: null }))
    ).toBe(true);
    expect(
      certificateEligibleUnissued(row({ certificateEarned: true, credentialId: "FYX-1" }))
    ).toBe(false);
    expect(
      certificateEligibleUnissued(row({ certificateEarned: false, credentialId: null }))
    ).toBe(false);
  });
});
