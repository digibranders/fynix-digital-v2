import { INDIAN_STATES } from "@/lib/pavel/indianStates";
import type { Country } from "@/components/pavel/pricing";

/**
 * GST engine for workshop invoices.
 *
 * The seller (Digibranders Private Limited, GSTIN 27AAICD9268J1Z0) is registered
 * in Maharashtra as a Regular taxpayer, so:
 *
 *   buyer in Maharashtra   -> intra-state -> CGST 9% + SGST 9%
 *   buyer elsewhere in IN  -> inter-state -> IGST 18%
 *   buyer outside India    -> export      -> zero-rated while the LUT is active
 *
 * Every amount is an integer in the currency's minor unit (paise, cents). No
 * floats are stored or compared, and rounding happens at exactly the points
 * defined here so an invoice total can never drift from the amount charged.
 */

/** The seller's state of registration. Drives the intra vs inter decision. */
export const SELLER_STATE = "Maharashtra";
export const SELLER_STATE_CODE = "27";

/** Combined GST rate applied to taxable supplies, as a percentage. */
export const GST_RATE_PERCENT = 18;

/** GST place-of-supply code for a recipient outside India. */
const EXPORT_PLACE_OF_SUPPLY = "Outside India";
const EXPORT_PLACE_OF_SUPPLY_CODE = "96";

export type SupplyType = "intra" | "inter" | "export";

export interface TaxBreakdown {
  supplyType: SupplyType;
  /** Value the tax is charged on, after any discount. Minor units. */
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  /** cgst + sgst + igst. Minor units. */
  totalTax: number;
  /** taxable + totalTax. Must equal the amount charged. Minor units. */
  total: number;
  /** Rate actually applied: 18 for taxable supplies, 0 for zero-rated exports. */
  ratePercent: number;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  /** True when this is an export invoiced without IGST under a LUT. */
  zeroRatedUnderLut: boolean;
}

export interface TaxInput {
  country: Country;
  /** Indian state or UT of the buyer. Required when country is "IN". */
  state?: string | null;
  /**
   * The buyer's actual country, e.g. "United States". An export invoice must
   * name the country of destination, so this becomes the place of supply for
   * exports. Ignored for Indian buyers, where the state governs.
   */
  destinationCountry?: string | null;
  /** List price before discount, in minor units. */
  base: number;
  /** Whole-percent referral discount, if any. */
  discountPercent?: number | null;
  /**
   * Whether a Letter of Undertaking is in force, allowing exports to be invoiced
   * without IGST. Defaults to true, matching current pricing where USD buyers
   * are charged the list price with no tax added.
   */
  lutActive?: boolean;
}

/** Clamp a discount to a whole percentage in 0..100. */
function normalizeDiscount(discountPercent?: number | null): number {
  if (typeof discountPercent !== "number" || !Number.isFinite(discountPercent)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(discountPercent)));
}

function lookupState(name: string) {
  const target = name.trim().toLowerCase();
  return INDIAN_STATES.find((s) => s.name.toLowerCase() === target);
}

/**
 * Compute the tax breakdown for one workshop seat.
 *
 * Throws rather than guessing when the place of supply is missing or unknown for
 * an Indian buyer: an invoice carrying the wrong place of supply is a compliance
 * defect, so this must surface loudly instead of degrading silently.
 */
export function computeTax(input: TaxInput): TaxBreakdown {
  const { country, state, destinationCountry, base, lutActive = true } = input;

  if (!Number.isInteger(base) || base < 0) {
    throw new Error(
      `Taxable base must be a non-negative integer in minor units, received ${base}.`
    );
  }

  const discount = normalizeDiscount(input.discountPercent);
  const taxable = Math.round(base * (1 - discount / 100));

  // Export of service. Zero-rated under a LUT; otherwise IGST is payable and
  // reclaimed later, so the buyer is charged the tax.
  if (country !== "IN") {
    const ratePercent = lutActive ? 0 : GST_RATE_PERCENT;
    const igst = Math.round((taxable * ratePercent) / 100);

    return {
      supplyType: "export",
      taxable,
      cgst: 0,
      sgst: 0,
      igst,
      totalTax: igst,
      total: taxable + igst,
      ratePercent,
      // An export invoice must name the country of destination. Fall back to the
      // generic label only when the specific country is genuinely unknown.
      placeOfSupply: destinationCountry?.trim() || EXPORT_PLACE_OF_SUPPLY,
      placeOfSupplyCode: EXPORT_PLACE_OF_SUPPLY_CODE,
      zeroRatedUnderLut: lutActive,
    };
  }

  if (!state || !state.trim()) {
    throw new Error(
      "Cannot determine the place of supply: an Indian buyer must have a state."
    );
  }

  const matched = lookupState(state);
  if (!matched) {
    throw new Error(`Unknown Indian state or union territory: ${state}.`);
  }

  // Round the combined tax once, then split it, so the two lines always sum to
  // the total. Rounding each line separately can drift by a paise.
  const totalTax = Math.round((taxable * GST_RATE_PERCENT) / 100);
  const isIntraState = matched.code === SELLER_STATE_CODE;

  const cgst = isIntraState ? Math.floor(totalTax / 2) : 0;
  const sgst = isIntraState ? totalTax - cgst : 0;
  const igst = isIntraState ? 0 : totalTax;

  return {
    supplyType: isIntraState ? "intra" : "inter",
    taxable,
    cgst,
    sgst,
    igst,
    totalTax,
    total: taxable + totalTax,
    ratePercent: GST_RATE_PERCENT,
    placeOfSupply: matched.name,
    placeOfSupplyCode: matched.code,
    zeroRatedUnderLut: false,
  };
}
