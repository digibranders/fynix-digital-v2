import { describe, expect, it } from "vitest";
import {
  decideReferral,
  referralRejectionMessage,
  type ReferralRejection,
  type ReferralRules,
} from "@/lib/pavel/referral";

const NOW = new Date("2026-08-19T10:00:00Z");

/** A healthy, unlimited code. Each test overrides only what it is about. */
function rules(overrides: Partial<ReferralRules> = {}): ReferralRules {
  return {
    code: "STEVE10",
    discountPercent: 10,
    active: true,
    expiresAt: null,
    maxUses: null,
    ...overrides,
  };
}

describe("decideReferral", () => {
  it("accepts an active, unlimited code", () => {
    expect(decideReferral(rules(), 0, NOW)).toEqual({
      ok: true,
      code: "STEVE10",
      discountPercent: 10,
    });
  });

  it("rejects a code that does not exist", () => {
    expect(decideReferral(null, 0, NOW)).toEqual({ ok: false, reason: "unknown" });
  });

  it("rejects a switched-off code", () => {
    expect(decideReferral(rules({ active: false }), 0, NOW)).toEqual({
      ok: false,
      reason: "inactive",
    });
  });

  it("rejects a code past its expiry", () => {
    const expired = rules({ expiresAt: new Date("2026-08-18T23:59:59Z") });
    expect(decideReferral(expired, 0, NOW)).toEqual({ ok: false, reason: "expired" });
  });

  it("treats the expiry instant itself as expired", () => {
    expect(decideReferral(rules({ expiresAt: NOW }), 0, NOW)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("accepts a code whose expiry is still in the future", () => {
    const live = rules({ expiresAt: new Date("2026-08-20T00:00:00Z") });
    expect(decideReferral(live, 0, NOW).ok).toBe(true);
  });

  it("rejects a code that has hit its cap", () => {
    expect(decideReferral(rules({ maxUses: 5 }), 5, NOW)).toEqual({
      ok: false,
      reason: "exhausted",
    });
  });

  it("rejects a code that has overshot its cap", () => {
    expect(decideReferral(rules({ maxUses: 5 }), 6, NOW)).toEqual({
      ok: false,
      reason: "exhausted",
    });
  });

  it("accepts a code with one slot left", () => {
    expect(decideReferral(rules({ maxUses: 5 }), 4, NOW).ok).toBe(true);
  });

  it("reports the operator's own switch before an expiry they may have forgotten", () => {
    const both = rules({ active: false, expiresAt: new Date("2026-08-18T00:00:00Z") });
    expect(decideReferral(both, 0, NOW)).toEqual({ ok: false, reason: "inactive" });
  });

  it("rejects a nonsensical discount rather than charging a wrong price", () => {
    expect(decideReferral(rules({ discountPercent: 0 }), 0, NOW)).toEqual({
      ok: false,
      reason: "unknown",
    });
    expect(decideReferral(rules({ discountPercent: 101 }), 0, NOW)).toEqual({
      ok: false,
      reason: "unknown",
    });
    expect(decideReferral(rules({ discountPercent: Number.NaN }), 0, NOW)).toEqual({
      ok: false,
      reason: "unknown",
    });
  });

  it("allows a full-price comp code at exactly 100%", () => {
    expect(decideReferral(rules({ discountPercent: 100 }), 0, NOW).ok).toBe(true);
  });
});

describe("referralRejectionMessage", () => {
  it("gives every rejection a buyer-readable message", () => {
    const reasons: ReferralRejection[] = [
      "unknown",
      "inactive",
      "expired",
      "exhausted",
      "unavailable",
    ];
    for (const reason of reasons) {
      expect(referralRejectionMessage(reason).length).toBeGreaterThan(0);
    }
  });

  it("does not blame the buyer for our own outage", () => {
    expect(referralRejectionMessage("unavailable")).not.toMatch(/invalid/i);
  });
});
