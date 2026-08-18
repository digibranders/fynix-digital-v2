import crypto from "crypto";
import { getDb } from "@/lib/db/client";

/**
 * Bridge between the admin UI and the data that backs it.
 *
 * The admin console is served from one place only — fynix.digital, on Vercel —
 * but Postgres lives on the DigitalOcean droplet and is bound to localhost, so
 * Vercel cannot query it. The droplet therefore exposes a small internal API
 * under `/api/admin/data/*`, and the Vercel copy of the app calls it
 * server-to-server with a shared secret.
 *
 * Two consequences worth keeping in mind:
 *
 *   - These calls never leave the server, so no CORS grant and no cross-origin
 *     cookie are involved. The operator's session cookie stays first-party on
 *     fynix.digital; the droplet only ever sees the shared secret.
 *   - Where the database IS reachable (the droplet itself, and local dev), the
 *     same pages query it directly and the gateway is not used at all. Callers
 *     branch on `hasLocalDb()`.
 */

/** Header carrying the shared secret on internal admin API calls. */
export const ADMIN_PROXY_HEADER = "x-admin-proxy-secret";

/** Shared secret. Must be identical on Vercel and on the droplet. */
const PROXY_SECRET = process.env.ADMIN_PROXY_SECRET ?? "";

/**
 * Origin serving the admin data API. Falls back to the public API base so a
 * standard deployment needs only the secret; set it explicitly to point the
 * console at a different backend.
 */
const API_ORIGIN = (
  process.env.ADMIN_API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  ""
).replace(/\/+$/, "");

/** True where this instance can query Postgres itself (droplet, local dev). */
export function hasLocalDb(): boolean {
  return getDb() !== null;
}

/** Constant-time compare that never short-circuits on length. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Authorise an inbound call to `/api/admin/data/*`.
 *
 * Fails closed: with no secret configured nothing can pass, so a misconfigured
 * droplet serves no data rather than serving it to anyone.
 */
export function verifyProxySecret(request: Request): boolean {
  if (!PROXY_SECRET) return false;
  const provided = request.headers.get(ADMIN_PROXY_HEADER);
  if (!provided) return false;
  return safeEqual(provided, PROXY_SECRET);
}

/** Raised when the console has no database and no gateway to fall back on. */
export class AdminGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminGatewayError";
  }
}

/**
 * Call the droplet's internal admin API. `path` is root-relative, e.g.
 * `/api/admin/data/registrations`. Returns the raw response so callers can
 * stream a PDF or parse JSON as needed.
 */
export async function adminGatewayFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  if (!API_ORIGIN) {
    throw new AdminGatewayError(
      "ADMIN_API_ORIGIN (or NEXT_PUBLIC_API_BASE_URL) is not set."
    );
  }
  if (!PROXY_SECRET) {
    throw new AdminGatewayError("ADMIN_PROXY_SECRET is not set.");
  }

  const headers = new Headers(init?.headers);
  headers.set(ADMIN_PROXY_HEADER, PROXY_SECRET);

  return fetch(`${API_ORIGIN}${path}`, {
    ...init,
    headers,
    // Operator-facing data: always live, never served from a build-time cache.
    cache: "no-store",
  });
}
