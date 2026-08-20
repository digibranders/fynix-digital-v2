/**
 * Location-aware pricing for the Semantic SEO workshop.
 *
 * The /pavel page auto-detects the visitor's country from the Vercel edge geo
 * header and renders the matching price server-side (Indian visitors see
 * ₹7,499, everyone else sees $99) on the SAME URL (no redirect). A manual
 * $/₹ toggle in the pricing card lets users override a wrong geo guess
 * (NRIs, VPNs, office IPs).
 *
 * Payment runs through Razorpay: /api/pavel/checkout creates an order for the
 * stored country's amount (`unitAmount` + `currencyCode`) and the browser opens
 * the Razorpay Checkout overlay against it. The price shown here MUST match the
 * amount the order charges.
 */
export type Country = "IN" | "REST";

export type PriceInfo = {
  country: Country;
  /** Currency symbol, e.g. "₹" or "$". */
  symbol: string;
  /** Formatted amount without the symbol, e.g. "7,499" or "79". */
  amount: string;
  /** ISO currency code shown next to the amount, e.g. "INR" or "USD". */
  currencyCode: string;
  /** Symbol + amount as shown to the buyer, e.g. "₹7,499 + GST" or "$99". */
  display: string;
  /**
   * Tax suffix shown next to the base price, e.g. "+ GST" for India, "" for the
   * rest of the world. Indian prices are GST-exclusive; GST is added at charge.
   */
  taxNote: string;
  /**
   * Taxable value before GST, in the currency's smallest unit. This is the
   * figure a tax invoice is built from: discount is applied here, then GST is
   * computed on the result (see lib/pavel/tax.ts). Deriving the charge from this
   * base is what keeps the invoice total and the amount charged identical.
   */
  base: number;
  /**
   * Amount actually charged at list price, in the currency's smallest unit
   * (paise for INR, cents for USD), as required by Razorpay's order `amount`.
   * For India this is `base` plus 18% GST; elsewhere it equals `base`.
   */
  unitAmount: number;
};

export const PRICING: Record<Country, PriceInfo> = {
  IN: {
    country: "IN",
    symbol: "₹",
    amount: "7,499",
    currencyCode: "INR",
    display: "₹7,499 + GST",
    taxNote: "+ GST",
    base: 749900, // ₹7,499 taxable value
    unitAmount: 884882, // ₹7,499 + 18% GST = ₹8,848.82
  },
  REST: {
    country: "REST",
    symbol: "$",
    amount: "99",
    currencyCode: "USD",
    display: "$99",
    taxNote: "",
    // Export of service, zero-rated under the LUT, so no tax is added.
    base: 9900,
    unitAmount: 9900,
  },
};

/**
 * Normalise a referral code the same way on the client and the server: trim,
 * uppercase, drop internal whitespace, and cap the length. Kept here (a pure,
 * client-safe module) so the checkout modal and the API agree byte-for-byte.
 */
export function normalizeReferralCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "").slice(0, 40);
}

/**
 * Apply a whole-percent discount to a smallest-unit amount (paise / cents),
 * clamped to 0–100% and rounded to an integer unit as Razorpay requires.
 */
export function applyDiscount(unitAmount: number, discountPercent: number): number {
  const pct = Math.max(0, Math.min(100, Math.round(discountPercent)));
  return Math.max(0, Math.round(unitAmount * (1 - pct / 100)));
}

/**
 * Smallest order Razorpay will settle, in the currency's minor unit: 100, i.e.
 * ₹1.00 or $1.00. An order below this is created without complaint but the
 * Checkout overlay rounds the collection up to one whole unit, and the payment
 * is then refused with "Your payment amount is different from your order
 * amount". Deep referral codes are the only way to land under it.
 */
export const MIN_CHARGE_UNITS = 100;

/**
 * Reduce a referral discount until the amount charged clears the gateway
 * minimum, and return the whole-percent discount that survives.
 *
 * Charging a floored amount instead would break the rule the checkout is built
 * on: the invoice is derived from the discount, so a total that no longer
 * matches the discount is a tax document that disagrees with the card
 * statement. Capping the percentage keeps one number driving the quote, the
 * order and the invoice. Both the modal and the checkout route call this, so
 * the buyer is quoted the discount that is actually applied.
 *
 * Steps down a percent at a time: whole percentages are the only ones the
 * system stores, and 100 iterations is nothing next to the round-trip that
 * follows.
 */
export function effectiveDiscountPercent(
  price: PriceInfo,
  discountPercent: number
): number {
  let pct = Math.max(0, Math.min(100, Math.round(discountPercent)));
  while (pct > 0 && applyDiscount(price.unitAmount, pct) < MIN_CHARGE_UNITS) {
    pct -= 1;
  }
  return pct;
}

/**
 * Format a smallest-unit amount back to a display string in the price's
 * currency, e.g. 796394 → "₹7,963.94", 8910 → "$89.10". Shows decimals only
 * when the amount isn't whole, so "$99" stays "$99".
 */
export function formatUnitAmount(price: PriceInfo, unitAmount: number): string {
  const major = unitAmount / 100;
  const hasFraction = Math.round(major * 100) % 100 !== 0;
  const formatted = major.toLocaleString(
    price.country === "IN" ? "en-IN" : "en-US",
    {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    }
  );
  return `${price.symbol}${formatted}`;
}

/** Map an ISO country code (from the edge geo header) to a pricing country. */
export function countryFromGeo(country?: string | null): Country {
  return country?.toUpperCase() === "IN" ? "IN" : "REST";
}

/**
 * Allow ?country=in / ?country=rest to override detection. Useful for local dev
 * (where the geo header is absent) and for QA of both price variants.
 */
export function countryFromParam(param?: string | null): Country | null {
  if (!param) return null;
  const value = param.toLowerCase();
  if (value === "in" || value === "india") return "IN";
  if (value === "rest" || value === "us" || value === "global") return "REST";
  return null;
}
