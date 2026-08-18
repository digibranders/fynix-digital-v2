/**
 * Resolves the origin the Pavel checkout calls for its API.
 *
 * The marketing site (including the Pavel landing page) is served from Vercel at
 * fynix.digital, while the API + database run on the DigitalOcean droplet behind
 * api.fynix.digital. Client-side fetches therefore go cross-origin in production.
 *
 * `NEXT_PUBLIC_API_BASE_URL` is inlined at build time:
 *   - Vercel build  → "https://api.fynix.digital" (absolute, cross-origin)
 *   - Local / droplet build → "" (same-origin; the app serves its own API)
 *
 * Keeping the fallback empty means dev and the droplet's own copy of the app keep
 * working against relative paths with no extra configuration.
 */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * Build an absolute (or same-origin) URL for an internal API path.
 * Pass a root-relative path, e.g. `apiUrl("/api/pavel/checkout")`.
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
