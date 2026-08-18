import { describe, it, expect } from "vitest";
import { computeTax, SELLER_STATE } from "./tax";
import { PRICING, applyDiscount } from "@/components/pavel/pricing";

/**
 * The tax engine decides what appears on a legal tax invoice, so these tests
 * pin down the exact rupee/paise outcomes rather than asserting loosely.
 *
 * Seller is registered in Maharashtra (GSTIN 27...), so:
 *   Maharashtra buyer  -> CGST 9% + SGST 9%
 *   other Indian state -> IGST 18%
 *   outside India      -> export, zero-rated while the LUT is active
 */

const IN_BASE = 749900; // ₹7,499 in paise, taxable
const USD_BASE = 9900; // $99 in cents

describe("intra-state supply (buyer in Maharashtra)", () => {
  it("splits 18% into equal CGST and SGST at full price", () => {
    const t = computeTax({ country: "IN", state: SELLER_STATE, base: IN_BASE });

    expect(t.supplyType).toBe("intra");
    expect(t.taxable).toBe(749900);
    expect(t.cgst).toBe(67491); // ₹674.91
    expect(t.sgst).toBe(67491);
    expect(t.igst).toBe(0);
    expect(t.totalTax).toBe(134982); // ₹1,349.82
    expect(t.total).toBe(884882); // ₹8,848.82
  });

  it("puts the odd paise on SGST so the two lines still sum exactly", () => {
    // 15% discount produces a tax of ₹1,147.35, which cannot split evenly.
    const t = computeTax({
      country: "IN",
      state: SELLER_STATE,
      base: IN_BASE,
      discountPercent: 15,
    });

    expect(t.taxable).toBe(637415);
    expect(t.cgst).toBe(57367); // ₹573.67
    expect(t.sgst).toBe(57368); // ₹573.68
    expect(t.cgst + t.sgst).toBe(t.totalTax);
    expect(t.totalTax).toBe(114735);
  });
});

describe("inter-state supply (buyer elsewhere in India)", () => {
  it("charges IGST at 18% with no CGST/SGST", () => {
    const t = computeTax({ country: "IN", state: "Karnataka", base: IN_BASE });

    expect(t.supplyType).toBe("inter");
    expect(t.igst).toBe(134982);
    expect(t.cgst).toBe(0);
    expect(t.sgst).toBe(0);
    expect(t.total).toBe(884882);
  });

  it("collects the same total tax as the intra-state split", () => {
    const intra = computeTax({ country: "IN", state: SELLER_STATE, base: IN_BASE });
    const inter = computeTax({ country: "IN", state: "Kerala", base: IN_BASE });

    expect(inter.totalTax).toBe(intra.totalTax);
    expect(inter.total).toBe(intra.total);
  });
});

describe("export of service (buyer outside India)", () => {
  it("is zero-rated while the LUT is active", () => {
    const t = computeTax({ country: "REST", base: USD_BASE, lutActive: true });

    expect(t.supplyType).toBe("export");
    expect(t.ratePercent).toBe(0);
    expect(t.cgst).toBe(0);
    expect(t.sgst).toBe(0);
    expect(t.igst).toBe(0);
    expect(t.totalTax).toBe(0);
    expect(t.taxable).toBe(9900);
    expect(t.total).toBe(9900); // buyer pays exactly $99
  });

  it("falls back to IGST 18% when no LUT is in force", () => {
    const t = computeTax({ country: "REST", base: USD_BASE, lutActive: false });

    expect(t.supplyType).toBe("export");
    expect(t.ratePercent).toBe(18);
    expect(t.igst).toBe(1782);
    expect(t.total).toBe(11682);
  });

  it("ignores any state supplied for a non-Indian buyer", () => {
    const t = computeTax({ country: "REST", state: "Maharashtra", base: USD_BASE });
    expect(t.supplyType).toBe("export");
  });
});

describe("discounts", () => {
  it("taxes the discounted value, not the list price", () => {
    const t = computeTax({
      country: "IN",
      state: "Karnataka",
      base: IN_BASE,
      discountPercent: 10,
    });

    expect(t.taxable).toBe(674910); // ₹6,749.10
    expect(t.igst).toBe(121484); // ₹1,214.84
    expect(t.total).toBe(796394); // ₹7,963.94
  });

  it("handles a 100% discount without producing negative tax", () => {
    const t = computeTax({
      country: "IN",
      state: SELLER_STATE,
      base: IN_BASE,
      discountPercent: 100,
    });

    expect(t.taxable).toBe(0);
    expect(t.totalTax).toBe(0);
    expect(t.total).toBe(0);
  });

  it("clamps out-of-range discounts", () => {
    const over = computeTax({
      country: "IN",
      state: SELLER_STATE,
      base: IN_BASE,
      discountPercent: 150,
    });
    const under = computeTax({
      country: "IN",
      state: SELLER_STATE,
      base: IN_BASE,
      discountPercent: -20,
    });

    expect(over.total).toBe(0);
    expect(under.total).toBe(884882);
  });
});

describe("invariants across every discount value", () => {
  const states = [SELLER_STATE, "Karnataka"];

  it("keeps total equal to taxable plus tax, and the CGST/SGST split exact", () => {
    for (const state of states) {
      for (let d = 0; d <= 100; d++) {
        const t = computeTax({
          country: "IN",
          state,
          base: IN_BASE,
          discountPercent: d,
        });

        expect(t.total).toBe(t.taxable + t.totalTax);
        expect(t.cgst + t.sgst + t.igst).toBe(t.totalTax);
        expect(t.taxable).toBeGreaterThanOrEqual(0);
        expect(t.totalTax).toBeGreaterThanOrEqual(0);
      }
    }
  });

  /**
   * Regression guard for the pricing refactor: the invoice total must equal what
   * the checkout actually charges. If these ever diverge, a buyer is charged one
   * amount and invoiced another.
   */
  it("matches the amount the existing checkout charges, at every discount", () => {
    for (let d = 0; d <= 100; d++) {
      const t = computeTax({
        country: "IN",
        state: SELLER_STATE,
        base: IN_BASE,
        discountPercent: d,
      });
      const charged = applyDiscount(PRICING.IN.unitAmount, d);

      expect(t.total).toBe(charged);
    }
  });

  it("matches the charged amount for USD too", () => {
    for (let d = 0; d <= 100; d++) {
      const t = computeTax({ country: "REST", base: USD_BASE, discountPercent: d });
      const charged = applyDiscount(PRICING.REST.unitAmount, d);

      expect(t.total).toBe(charged);
    }
  });
});

describe("PRICING stays consistent with the tax engine", () => {
  it("derives PRICING.IN.unitAmount exactly from its taxable base", () => {
    const t = computeTax({
      country: "IN",
      state: SELLER_STATE,
      base: PRICING.IN.base,
    });

    expect(PRICING.IN.base).toBe(IN_BASE);
    expect(t.total).toBe(PRICING.IN.unitAmount);
  });

  it("leaves the USD price untaxed, so base equals the charge", () => {
    const t = computeTax({ country: "REST", base: PRICING.REST.base });

    expect(PRICING.REST.base).toBe(PRICING.REST.unitAmount);
    expect(t.total).toBe(PRICING.REST.unitAmount);
  });
});

describe("place of supply", () => {
  it("reports the buyer state and its GST code for Indian supplies", () => {
    const t = computeTax({ country: "IN", state: "Karnataka", base: IN_BASE });

    expect(t.placeOfSupply).toBe("Karnataka");
    expect(t.placeOfSupplyCode).toBe("29");
  });

  it("reports the export place of supply for foreign buyers", () => {
    const t = computeTax({ country: "REST", base: USD_BASE });

    expect(t.placeOfSupply).toBe("Outside India");
    expect(t.placeOfSupplyCode).toBe("96"); // 'Other Country' under GST
  });
});

describe("data integrity", () => {
  it("refuses to guess the place of supply for an Indian buyer", () => {
    expect(() =>
      computeTax({ country: "IN", state: null, base: IN_BASE })
    ).toThrow(/place of supply/i);
  });

  it("rejects a state that is not a known Indian state or UT", () => {
    expect(() =>
      computeTax({ country: "IN", state: "Atlantis", base: IN_BASE })
    ).toThrow(/Atlantis/);
  });

  it("rejects a non-integer base amount", () => {
    expect(() =>
      computeTax({ country: "IN", state: SELLER_STATE, base: 7499.5 })
    ).toThrow(/integer/i);
  });
});
