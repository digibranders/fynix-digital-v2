import { COUNTRIES } from "@/components/pavel/countries";

/**
 * Identity of one cacheable rendering of the workshop landing page.
 *
 * `/pavel` is the only route on the site that cannot be served from the edge,
 * because it personalises on the visitor's country (price) and timezone (the
 * session times). Reading either at render time forces a dynamic render, and
 * measured from Singapore that costs ~1s: the static pages answer in ~90ms from
 * the local edge while `/pavel` round-trips to the function region.
 *
 * So the personalisation moves into the URL. Middleware resolves it at the edge
 * and rewrites to `/pavel/v/<country>/<zone>`, which is prerendered and cached
 * per combination. The visitor's URL never changes.
 *
 * Both parts must be in the key. Country alone cannot express the timezone —
 * geo resolves one zone per country, which is three hours wrong for anyone in
 * California — and the zone alone cannot name the country the checkout
 * pre-selects or the currency to charge in.
 */

export type LandingVariant = {
  /** ISO 3166-1 alpha-2, uppercase. Empty when geo could not name a country. */
  countryCode: string;
  /** IANA zone, e.g. "America/Los_Angeles". Empty when unknown. */
  timeZone: string;
};

/** Stands in for "no country detected", so the path segment is never empty. */
const NO_COUNTRY = "zz";
/** Stands in for "no timezone known". */
const NO_ZONE = "auto";

/**
 * IANA zones contain "/", which would split into extra path segments, so it is
 * swapped for a character that is legal in a segment and appears in no zone
 * name. Round-trips exactly.
 */
export function zoneToSlug(zone: string): string {
  return zone ? zone.replace(/\//g, "~") : NO_ZONE;
}

export function slugToZone(slug: string): string {
  return !slug || slug === NO_ZONE ? "" : slug.replace(/~/g, "/");
}

export function countryToSlug(code: string): string {
  return code ? code.toLowerCase() : NO_COUNTRY;
}

export function slugToCountry(slug: string): string {
  return !slug || slug === NO_COUNTRY ? "" : slug.toUpperCase();
}

/**
 * Accept a timezone only if this runtime can actually format with it.
 *
 * The value arrives from a cookie or a URL segment, so it is attacker
 * controlled and it reaches Intl.DateTimeFormat and the rendered page.
 * Validating against the runtime's own zone database rejects both junk and
 * injection outright, rather than trusting a pattern to be exhaustive. It also
 * bounds how many distinct pages can ever be cached: only real zones qualify.
 */
export function validTimeZone(value: string | null | undefined): string {
  if (!value) return "";
  const zone = value.trim();
  if (zone.length > 64) return "";
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: zone });
    return zone;
  } catch {
    return "";
  }
}

/** Accept a country code only if it is one we actually know. */
export function validCountryCode(value: string | null | undefined): string {
  if (!value) return "";
  const code = value.trim().toUpperCase();
  return COUNTRIES.some((c) => c.code === code) ? code : "";
}

/** The representative timezone for a country, used until the browser reports its own. */
export function timeZoneForCountry(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.tz ?? "";
}

export function variantToPath(variant: LandingVariant): string {
  return `/pavel/v/${countryToSlug(variant.countryCode)}/${zoneToSlug(variant.timeZone)}`;
}

/**
 * Combinations prerendered at build time: the ones worth having warm on the
 * first request. Everything else is generated on first hit and cached from then
 * on, so this list is an optimisation and never a limit.
 */
export const SEED_VARIANTS: LandingVariant[] = [
  { countryCode: "IN", timeZone: "Asia/Kolkata" },
  { countryCode: "US", timeZone: "America/New_York" },
  { countryCode: "US", timeZone: "America/Los_Angeles" },
  { countryCode: "US", timeZone: "America/Chicago" },
  { countryCode: "GB", timeZone: "Europe/London" },
  { countryCode: "AE", timeZone: "Asia/Dubai" },
  { countryCode: "SG", timeZone: "Asia/Singapore" },
  { countryCode: "AU", timeZone: "Australia/Sydney" },
  { countryCode: "DE", timeZone: "Europe/Berlin" },
  { countryCode: "CA", timeZone: "America/Toronto" },
  // No geo and no cookie: local dev, and any request the edge cannot place.
  { countryCode: "", timeZone: "" },
];
