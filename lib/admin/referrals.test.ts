import { describe, expect, it } from "vitest";
import { parseReferralInput } from "@/lib/admin/referrals";
import {
  commissionOwed,
  referralStatus,
  type AdminReferralRow,
} from "@/lib/admin/referralStats";

const NOW = new Date("2026-08-19T10:00:00Z");

function row(overrides: Partial<AdminReferralRow> = {}): AdminReferralRow {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    code: "STEVE10",
    discountPercent: 10,
    active: true,
    label: null,
    ownerName: null,
    ownerEmail: null,
    commissionPercent: null,
    maxUses: null,
    expiresAt: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    redeemed: 0,
    attributed: 0,
    pending: 0,
    netRevenueInr: 0,
    netRevenueUsd: 0,
    ...overrides,
  };
}

describe("referralStatus", () => {
  it("reports a healthy code as active", () => {
    expect(referralStatus(row(), NOW)).toBe("active");
  });

  it("reports a switched-off code as inactive", () => {
    expect(referralStatus(row({ active: false }), NOW)).toBe("inactive");
  });

  it("reports a past expiry as expired", () => {
    expect(referralStatus(row({ expiresAt: "2026-08-18T00:00:00.000Z" }), NOW)).toBe(
      "expired"
    );
  });

  it("keeps a future expiry active", () => {
    expect(referralStatus(row({ expiresAt: "2026-09-01T00:00:00.000Z" }), NOW)).toBe(
      "active"
    );
  });

  it("reports a reached cap as exhausted", () => {
    expect(referralStatus(row({ maxUses: 3, redeemed: 3 }), NOW)).toBe("exhausted");
  });

  it("reports an overshot cap as exhausted", () => {
    expect(referralStatus(row({ maxUses: 3, redeemed: 4 }), NOW)).toBe("exhausted");
  });

  it("keeps a code with slots left active", () => {
    expect(referralStatus(row({ maxUses: 3, redeemed: 2 }), NOW)).toBe("active");
  });

  it("prefers inactive over expired, because that is the operator's own doing", () => {
    const both = row({ active: false, expiresAt: "2026-08-18T00:00:00.000Z" });
    expect(referralStatus(both, NOW)).toBe("inactive");
  });
});

describe("commissionOwed", () => {
  it("is zero when no commission is set", () => {
    expect(commissionOwed(row({ netRevenueInr: 100_000 }))).toEqual({ inr: 0, usd: 0 });
  });

  it("takes a whole percent of ex-GST revenue in each currency", () => {
    const owed = commissionOwed(
      row({ commissionPercent: 20, netRevenueInr: 100_000, netRevenueUsd: 9_900 })
    );
    expect(owed).toEqual({ inr: 20_000, usd: 1_980 });
  });

  it("rounds to a whole minor unit", () => {
    expect(commissionOwed(row({ commissionPercent: 33, netRevenueInr: 101 }))).toEqual({
      inr: 33,
      usd: 0,
    });
  });
});

describe("parseReferralInput", () => {
  /** The minimum a valid create needs. */
  const base = { code: "pavel20", discountPercent: "20" };

  it("normalises the code", () => {
    const parsed = parseReferralInput(base);
    expect("values" in parsed && parsed.values.code).toBe("PAVEL20");
  });

  it("requires a code", () => {
    expect(parseReferralInput({ discountPercent: "10" })).toEqual({
      error: "A code is required.",
    });
  });

  it("rejects a code with punctuation that would not survive normalising", () => {
    const parsed = parseReferralInput({ ...base, code: "PAVEL$20" });
    expect("error" in parsed).toBe(true);
  });

  it("rejects a discount outside 1 to 100", () => {
    expect("error" in parseReferralInput({ ...base, discountPercent: "0" })).toBe(true);
    expect("error" in parseReferralInput({ ...base, discountPercent: "101" })).toBe(true);
    expect("error" in parseReferralInput({ ...base, discountPercent: "7.5" })).toBe(true);
  });

  it("treats blank limits as no limit rather than zero", () => {
    const parsed = parseReferralInput({
      ...base,
      maxUses: "",
      expiresAt: "",
      commissionPercent: "",
    });
    expect("values" in parsed && parsed.values.maxUses).toBeNull();
    expect("values" in parsed && parsed.values.expiresAt).toBeNull();
    expect("values" in parsed && parsed.values.commissionPercent).toBeNull();
  });

  it("rejects a cap below one, which would make a code dead on arrival", () => {
    expect("error" in parseReferralInput({ ...base, maxUses: "0" })).toBe(true);
  });

  it("accepts a zero commission as a real value", () => {
    const parsed = parseReferralInput({ ...base, commissionPercent: "0" });
    expect("values" in parsed && parsed.values.commissionPercent).toBe(0);
  });

  it("parses an expiry into a Date", () => {
    const parsed = parseReferralInput({ ...base, expiresAt: "2026-09-01T10:00" });
    expect("values" in parsed && parsed.values.expiresAt).toBeInstanceOf(Date);
  });

  it("rejects an unparseable expiry", () => {
    expect("error" in parseReferralInput({ ...base, expiresAt: "not a date" })).toBe(true);
  });

  it("stores blank optional text as null, not an empty string", () => {
    const parsed = parseReferralInput({ ...base, label: "   ", ownerName: "" });
    expect("values" in parsed && parsed.values.label).toBeNull();
    expect("values" in parsed && parsed.values.ownerName).toBeNull();
  });
});
