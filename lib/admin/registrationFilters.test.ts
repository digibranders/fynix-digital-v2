import { describe, expect, it } from "vitest";
import { testRow as row } from "@/lib/admin/testRow";
import {
  EMPTY_FILTERS,
  NO_REFERRAL,
  filterOptions,
  hasAdvancedFilters,
  rowMatchesFilters,
  rowMatchesQuery,
  type RegistrationFilters,
} from "@/lib/admin/registrationFilters";

const NOW = new Date("2026-08-19T10:00:00Z");

/** Apply only the filters a test names; everything else stays wide open. */
function f(overrides: Partial<RegistrationFilters> = {}): RegistrationFilters {
  return { ...EMPTY_FILTERS, ...overrides };
}

describe("rowMatchesQuery", () => {
  const r = row({
    name: "Gaurav Jadhav",
    email: "gaurav@fynix.digital",
    ref: "PVL-ABC",
    phone: "+91 98765 43210",
    state: "Karnataka",
    referralCode: "STEVE10",
    razorpayPaymentId: "pay_123",
    invoiceNo: "FYX/26-27/0001",
    credentialId: "FYX-SS26-7A3F",
    sessionLabel: "Cohort 1",
    companyName: "Digibranders",
    gstin: "27AAICD9268J1Z0",
  });

  it("matches everything an operator might paste in", () => {
    for (const q of [
      "",
      "jadhav",
      "abc",
      "98765",
      "karnataka",
      "steve10",
      "pay_123",
      "26-27",
      "ss26",
      "cohort",
      "digibranders",
      "27aaicd",
    ]) {
      expect(rowMatchesQuery(r, q)).toBe(true);
    }
  });

  it("does not match something absent", () => {
    expect(rowMatchesQuery(r, "nomatch")).toBe(false);
  });
});

describe("rowMatchesFilters", () => {
  it("passes everything when nothing is set", () => {
    expect(rowMatchesFilters(row(), EMPTY_FILTERS, NOW)).toBe(true);
  });

  it("filters by status", () => {
    expect(rowMatchesFilters(row({ status: "paid" }), f({ status: "paid" }), NOW)).toBe(true);
    expect(rowMatchesFilters(row({ status: "pending" }), f({ status: "paid" }), NOW)).toBe(false);
  });

  it("treats an old unpaid seat as abandoned, and a fresh one as not", () => {
    const old = row({ status: "pending", createdAt: "2026-08-01T00:00:00Z" });
    const fresh = row({ status: "pending", createdAt: "2026-08-18T00:00:00Z" });
    expect(rowMatchesFilters(old, f({ status: "abandoned" }), NOW)).toBe(true);
    expect(rowMatchesFilters(fresh, f({ status: "abandoned" }), NOW)).toBe(false);
  });

  it("never counts a paid seat as abandoned, however old", () => {
    const old = row({ status: "paid", createdAt: "2026-01-01T00:00:00Z" });
    expect(rowMatchesFilters(old, f({ status: "abandoned" }), NOW)).toBe(false);
  });

  it("filters by cohort, currency, country and state", () => {
    const r = row({
      sessionLabel: "Cohort 2",
      currency: "USD",
      countryName: "Germany",
      state: null,
    });
    expect(rowMatchesFilters(r, f({ session: "Cohort 2" }), NOW)).toBe(true);
    expect(rowMatchesFilters(r, f({ session: "Cohort 1" }), NOW)).toBe(false);
    expect(rowMatchesFilters(r, f({ currency: "USD" }), NOW)).toBe(true);
    expect(rowMatchesFilters(r, f({ currency: "INR" }), NOW)).toBe(false);
    expect(rowMatchesFilters(r, f({ country: "Germany" }), NOW)).toBe(true);
    expect(rowMatchesFilters(r, f({ state: "Maharashtra" }), NOW)).toBe(false);
  });

  it("separates 'no code at all' from a specific code", () => {
    const none = row({ referralCode: null });
    const coded = row({ referralCode: "STEVE10" });
    expect(rowMatchesFilters(none, f({ referralCode: NO_REFERRAL }), NOW)).toBe(true);
    expect(rowMatchesFilters(coded, f({ referralCode: NO_REFERRAL }), NOW)).toBe(false);
    expect(rowMatchesFilters(coded, f({ referralCode: "STEVE10" }), NOW)).toBe(true);
  });

  it("separates a code that was applied from one recorded at full price", () => {
    const applied = row({ referralCode: "S", discountPercent: 10 });
    const fullPrice = row({ referralCode: "S", discountPercent: null });
    expect(rowMatchesFilters(applied, f({ discountApplied: "yes" }), NOW)).toBe(true);
    expect(rowMatchesFilters(fullPrice, f({ discountApplied: "yes" }), NOW)).toBe(false);
    expect(rowMatchesFilters(fullPrice, f({ discountApplied: "no" }), NOW)).toBe(true);
  });

  it("filters by attendance band", () => {
    const full = row({ status: "paid", attendedMinutes: 120 });
    const partial = row({ status: "paid", attendedMinutes: 30 });
    const noShow = row({ status: "paid", attendedMinutes: 0 });
    const unsynced = row({ status: "paid", attendedMinutes: null });
    expect(rowMatchesFilters(full, f({ attendance: "full" }), NOW)).toBe(true);
    expect(rowMatchesFilters(partial, f({ attendance: "partial" }), NOW)).toBe(true);
    expect(rowMatchesFilters(noShow, f({ attendance: "no_show" }), NOW)).toBe(true);
    expect(rowMatchesFilters(unsynced, f({ attendance: "not_synced" }), NOW)).toBe(true);
    // A no-show is not an unsynced seat, and vice versa.
    expect(rowMatchesFilters(noShow, f({ attendance: "not_synced" }), NOW)).toBe(false);
    expect(rowMatchesFilters(unsynced, f({ attendance: "no_show" }), NOW)).toBe(false);
  });

  it("finds certificates earned but not issued", () => {
    const earned = row({ status: "paid", attendedMinutes: 95, credentialId: null });
    const issued = row({ status: "paid", attendedMinutes: 95, credentialId: "FYX-1" });
    const short = row({ status: "paid", attendedMinutes: 20, credentialId: null });
    expect(rowMatchesFilters(earned, f({ certificate: "eligible_unissued" }), NOW)).toBe(true);
    expect(rowMatchesFilters(issued, f({ certificate: "eligible_unissued" }), NOW)).toBe(false);
    expect(rowMatchesFilters(short, f({ certificate: "eligible_unissued" }), NOW)).toBe(false);
  });

  it("finds paid seats with no invoice", () => {
    const missing = row({ status: "paid", invoiceNo: null });
    const ok = row({ status: "paid", invoiceNo: "FYX/26-27/0001" });
    const pending = row({ status: "pending", invoiceNo: null });
    expect(rowMatchesFilters(missing, f({ invoice: "missing" }), NOW)).toBe(true);
    expect(rowMatchesFilters(ok, f({ invoice: "missing" }), NOW)).toBe(false);
    // A pending seat has no invoice by design, so it is not "missing" one.
    expect(rowMatchesFilters(pending, f({ invoice: "missing" }), NOW)).toBe(false);
  });

  it("filters by registration date, inclusive of both end days", () => {
    const r = row({ createdAt: "2026-08-15T23:30:00Z" });
    expect(rowMatchesFilters(r, f({ registeredFrom: "2026-08-15" }), NOW)).toBe(true);
    expect(rowMatchesFilters(r, f({ registeredTo: "2026-08-15" }), NOW)).toBe(true);
    expect(rowMatchesFilters(r, f({ registeredFrom: "2026-08-16" }), NOW)).toBe(false);
    expect(rowMatchesFilters(r, f({ registeredTo: "2026-08-14" }), NOW)).toBe(false);
  });

  it("excludes an unpaid row when a paid-date range is set", () => {
    const unpaid = row({ paidAt: null });
    expect(rowMatchesFilters(unpaid, f({ paidFrom: "2026-08-01" }), NOW)).toBe(false);
  });

  it("filters on amount in major units, not minor", () => {
    const r = row({ amountCharged: 749900, currency: "INR" }); // ₹7,499
    expect(rowMatchesFilters(r, f({ amountMin: "7000" }), NOW)).toBe(true);
    expect(rowMatchesFilters(r, f({ amountMax: "7000" }), NOW)).toBe(false);
    expect(rowMatchesFilters(r, f({ amountMin: "1000", amountMax: "9000" }), NOW)).toBe(true);
  });

  it("combines filters as AND", () => {
    const r = row({ status: "paid", currency: "USD", sessionLabel: "Cohort 1" });
    expect(
      rowMatchesFilters(r, f({ status: "paid", currency: "USD", session: "Cohort 1" }), NOW)
    ).toBe(true);
    expect(
      rowMatchesFilters(r, f({ status: "paid", currency: "INR", session: "Cohort 1" }), NOW)
    ).toBe(false);
  });
});

describe("hasAdvancedFilters", () => {
  it("ignores the status tabs and the search box", () => {
    expect(hasAdvancedFilters(f({ status: "paid", query: "abc" }))).toBe(false);
  });

  it("notices anything else", () => {
    expect(hasAdvancedFilters(f({ currency: "INR" }))).toBe(true);
    expect(hasAdvancedFilters(f({ attendance: "no_show" }))).toBe(true);
    expect(hasAdvancedFilters(f({ amountMin: "10" }))).toBe(true);
  });
});

describe("filterOptions", () => {
  it("lists the distinct values actually present, sorted", () => {
    const options = filterOptions([
      row({ sessionLabel: "Cohort 2", currency: "USD", countryName: "Germany" }),
      row({ sessionLabel: "Cohort 1", currency: "INR", countryName: "India", referralCode: "B" }),
      row({ sessionLabel: "Cohort 1", currency: "INR", countryName: "India", referralCode: "A" }),
    ]);
    expect(options.sessions).toEqual(["Cohort 1", "Cohort 2"]);
    expect(options.currencies).toEqual(["INR", "USD"]);
    expect(options.countries).toEqual(["Germany", "India"]);
    expect(options.codes).toEqual(["A", "B"]);
  });
});
