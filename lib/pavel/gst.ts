/**
 * GSTIN helpers shared by the checkout modal (client-side UX) and the register
 * route (authoritative), so both validate a GST number the same way.
 *
 * A GSTIN is 15 characters: a 2-digit state code, the 10-character PAN, a
 * 1-digit entity number, the fixed letter 'Z', and a 1-character checksum.
 */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

/** Canonical form we validate and store: trimmed and upper-cased. */
export function normalizeGstin(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidGstin(value: string): boolean {
  return GSTIN_REGEX.test(normalizeGstin(value));
}
