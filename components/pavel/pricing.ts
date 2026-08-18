/**
 * Location-aware pricing for the Semantic SEO workshop.
 *
 * The /pavel page auto-detects the visitor's country from the Vercel edge geo
 * header and renders the matching price server-side — Indian visitors see
 * ₹7,499, everyone else sees $79 — on the SAME URL (no redirect). A manual
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
   * Amount actually charged, in the currency's smallest unit (paise for INR,
   * cents for USD), as required by Razorpay's order `amount`. For India this is
   * the base plus 18% GST; elsewhere it equals the displayed price.
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
    unitAmount: 884882, // ₹7,499 + 18% GST = ₹8,848.82
  },
  REST: {
    country: "REST",
    symbol: "$",
    amount: "99",
    currencyCode: "USD",
    display: "$99",
    taxNote: "",
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
