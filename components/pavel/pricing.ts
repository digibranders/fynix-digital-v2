/**
 * Location-aware pricing for the Semantic SEO workshop.
 *
 * The /pavel page auto-detects the visitor's country from the Vercel edge geo
 * header and renders the matching price server-side — Indian visitors see
 * ₹7,499, everyone else sees $79 — on the SAME URL (no redirect). A manual
 * $/₹ toggle in the pricing card lets users override a wrong geo guess
 * (NRIs, VPNs, office IPs).
 *
 * ⚠️ Drop the real hosted-checkout URLs into `checkoutUrl` once the payment
 * provider (Razorpay / Stripe / Gumroad) is chosen. The price shown here MUST
 * match the amount the checkout charges.
 */
export type Region = "IN" | "REST";

export type PriceInfo = {
  region: Region;
  /** Currency symbol, e.g. "₹" or "$". */
  symbol: string;
  /** Formatted amount without the symbol, e.g. "7,499" or "79". */
  amount: string;
  /** ISO currency code shown next to the amount, e.g. "INR" or "USD". */
  currencyCode: string;
  /** Symbol + amount, e.g. "₹7,499" or "$79". */
  display: string;
  /** Hosted checkout URL for this region. Empty until a provider is wired up. */
  checkoutUrl: string;
};

export const PRICING: Record<Region, PriceInfo> = {
  IN: {
    region: "IN",
    symbol: "₹",
    amount: "7,499",
    currencyCode: "INR",
    display: "₹7,499",
    checkoutUrl: "",
  },
  REST: {
    region: "REST",
    symbol: "$",
    amount: "79",
    currencyCode: "USD",
    display: "$79",
    checkoutUrl: "",
  },
};

/** Map an ISO country code (from the edge geo header) to a pricing region. */
export function regionFromCountry(country?: string | null): Region {
  return country?.toUpperCase() === "IN" ? "IN" : "REST";
}

/**
 * Allow ?region=in / ?region=rest to override detection. Useful for local dev
 * (where the geo header is absent) and for QA of both price variants.
 */
export function regionFromParam(param?: string | null): Region | null {
  if (!param) return null;
  const value = param.toLowerCase();
  if (value === "in" || value === "india") return "IN";
  if (value === "rest" || value === "us" || value === "global") return "REST";
  return null;
}
