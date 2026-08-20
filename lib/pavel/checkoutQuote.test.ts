import { describe, expect, it } from "vitest";
import {
  MIN_CHARGE_UNITS,
  PRICING,
  applyDiscount,
  effectiveDiscountPercent,
} from "@/components/pavel/pricing";
import { computeTax } from "@/lib/pavel/tax";

/**
 * The checkout quote must agree with the invoice.
 *
 * The confirm button quotes a pre-tax figure next to a "+ GST" suffix, and the
 * referral line quotes the tax-inclusive amount Razorpay collects. Those come
 * from `applyDiscount` over `price.base` and `price.unitAmount`, while the
 * invoice derives its own taxable value and total from `computeTax`. Two
 * independent roundings of the same discount is the bug waiting to happen: a
 * buyer who is quoted one figure and charged another, or an invoice whose
 * taxable line does not match what the page promised.
 *
 * These tests pin both amounts across every whole-percent discount, so a change
 * to either rounding rule fails here rather than in someone's invoice.
 */

const DISCOUNTS = Array.from({ length: 101 }, (_, i) => i);

describe("checkout quote matches the invoice", () => {
  describe.each([
    { label: "intra-state (Maharashtra)", state: "Maharashtra" },
    { label: "inter-state (Karnataka)", state: "Karnataka" },
  ])("India, $label", ({ state }) => {
    it.each(DISCOUNTS)("agrees at %i%% off", (discountPercent) => {
      const price = PRICING.IN;
      const tax = computeTax({
        country: "IN",
        state,
        base: price.base,
        discountPercent,
        lutActive: true,
      });

      // The figure on the button is the invoice's taxable value.
      expect(applyDiscount(price.base, discountPercent)).toBe(tax.taxable);
      // The figure in the referral line is what is actually charged.
      expect(applyDiscount(price.unitAmount, discountPercent)).toBe(tax.total);
    });
  });

  describe("export (zero-rated under LUT)", () => {
    it.each(DISCOUNTS)("agrees at %i%% off", (discountPercent) => {
      const price = PRICING.REST;
      const tax = computeTax({
        country: "REST",
        destinationCountry: "United States",
        base: price.base,
        discountPercent,
        lutActive: true,
      });

      expect(applyDiscount(price.base, discountPercent)).toBe(tax.taxable);
      expect(applyDiscount(price.unitAmount, discountPercent)).toBe(tax.total);
      // No tax is added, so the two quoted figures are the same number and the
      // button correctly shows no suffix.
      expect(tax.total).toBe(tax.taxable);
      expect(price.taxNote).toBe("");
    });
  });

  describe("the charge clears Razorpay's minimum", () => {
    it("caps a USD discount that would charge less than $1.00", () => {
      const price = PRICING.REST;
      // 99% off $99 is $0.99. Razorpay creates that order and then refuses the
      // payment, so the discount steps down to the deepest one that still
      // collects a whole dollar.
      expect(applyDiscount(price.unitAmount, 99)).toBeLessThan(MIN_CHARGE_UNITS);
      expect(effectiveDiscountPercent(price, 99)).toBe(98);
      expect(effectiveDiscountPercent(price, 100)).toBe(98);
      expect(applyDiscount(price.unitAmount, 98)).toBe(198);
    });

    it("leaves discounts that already clear the minimum alone", () => {
      expect(effectiveDiscountPercent(PRICING.REST, 90)).toBe(90);
      // ₹8,848.82 is deep enough that even 99% off collects ₹88.49.
      expect(effectiveDiscountPercent(PRICING.IN, 99)).toBe(99);
      expect(effectiveDiscountPercent(PRICING.IN, 100)).toBe(99);
    });

    it.each([PRICING.IN, PRICING.REST])(
      "never quotes a sub-minimum charge for $currencyCode",
      (price) => {
        for (const discountPercent of DISCOUNTS) {
          const charged = applyDiscount(
            price.unitAmount,
            effectiveDiscountPercent(price, discountPercent)
          );
          expect(charged).toBeGreaterThanOrEqual(MIN_CHARGE_UNITS);
        }
      }
    );
  });

  it("quotes the pre-tax base, not the tax-inclusive total", () => {
    // The regression this file exists for: at 10% off the button must read
    // ₹6,749.10 (base), not ₹7,963.94 (base + GST).
    const price = PRICING.IN;
    expect(applyDiscount(price.base, 10)).toBe(674910);
    expect(applyDiscount(price.unitAmount, 10)).toBe(796394);
  });
});
