import { normalizeReferralCode } from "@/components/pavel/pricing";

/**
 * Referral share links: `/pavel?ref=GAURAV20`.
 *
 * A partner shares one URL, and the code is already applied by the time the
 * buyer reaches the price. Nothing about trust changes: the link only
 * pre-fills the field, and the discount is still re-derived server-side when
 * the Razorpay order is created, so a code invented in a URL buys nothing.
 *
 * Kept in one module because three places have to agree on the parameter name —
 * the admin panel that builds the link, the modal that reads it, and anyone
 * debugging why a link did not apply.
 */

/** Query parameter carrying the code. */
export const REFERRAL_PARAM = "ref";

/**
 * Where the code is held between landing and opening the modal.
 *
 * sessionStorage rather than a React prop: the landing page is prerendered per
 * country and timezone, and a visitor can move between those variants before
 * they ever open checkout. Session scope means it dies with the tab, so a
 * shared computer does not hand the next person somebody else's discount.
 */
export const REFERRAL_STORAGE_KEY = "pavel.referral";

/** Build the shareable link for a code. `origin` should have no trailing slash. */
export function buildReferralLink(origin: string, code: string): string {
  const normalised = normalizeReferralCode(code);
  return `${origin}/pavel?${REFERRAL_PARAM}=${encodeURIComponent(normalised)}`;
}

/**
 * Read the code from a query string, normalised.
 *
 * Returns "" for anything unusable, so callers can treat "no code" and "junk in
 * the URL" identically rather than trying to apply nonsense and showing the
 * buyer an error they did not cause.
 */
export function readReferralParam(search: string): string {
  try {
    const value = new URLSearchParams(search).get(REFERRAL_PARAM);
    return value ? normalizeReferralCode(value) : "";
  } catch {
    return "";
  }
}

/**
 * The code to pre-fill, preferring one just arrived in the URL over one already
 * remembered. Browser-only; returns "" anywhere without a window.
 */
export function currentReferral(): string {
  if (typeof window === "undefined") return "";

  const fromUrl = readReferralParam(window.location.search);
  if (fromUrl) {
    try {
      window.sessionStorage.setItem(REFERRAL_STORAGE_KEY, fromUrl);
    } catch {
      /* storage blocked: the code still applies for this page view */
    }
    return fromUrl;
  }

  try {
    const stored = window.sessionStorage.getItem(REFERRAL_STORAGE_KEY);
    return stored ? normalizeReferralCode(stored) : "";
  } catch {
    return "";
  }
}

/** Forget the remembered code, once a seat carrying it has been bought. */
export function clearReferral(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    /* nothing to clean up if storage was never available */
  }
}
