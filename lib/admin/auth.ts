import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Password-protected session for the Pavel admin dashboard (`/admin/pavel`).
 *
 * Deliberately dependency-free: a single admin credential lives in env vars and
 * a short-lived, HMAC-signed cookie carries the session. There is no user table
 * and no external auth provider — this guards one internal reporting page, not a
 * multi-tenant product. All checks run server-side only.
 */

/** Admin credential. Defaults match the values the operator was given; override
 *  in every deployed environment via env vars. */
const ADMIN_EMAIL = (process.env.PAVEL_ADMIN_EMAIL || "admin@fynix.digital")
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD = process.env.PAVEL_ADMIN_PASSWORD || "1234567q";

/** Secret that signs the session cookie. Falls back to the form secret, then an
 *  insecure dev default — set a dedicated value in production. */
const SESSION_SECRET =
  process.env.PAVEL_ADMIN_SESSION_SECRET ||
  process.env.PAVEL_FORM_SECRET ||
  "dev-insecure-pavel-admin-secret-change-me";

/** Cookie name + lifetime for the signed admin session. */
export const ADMIN_SESSION_COOKIE = "pavel_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1_000; // 12 hours
/** Bumps the payload so an old cookie can never be reinterpreted as a new one. */
const SESSION_SUBJECT = "pavel-admin-v1";

export const ADMIN_SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1_000);

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

/** Constant-time string compare that never short-circuits on length. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run a comparison to keep timing uniform, then fail.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Validate a submitted email + password against the configured admin credential. */
export function verifyCredentials(email: unknown, password: unknown): boolean {
  if (typeof email !== "string" || typeof password !== "string") return false;
  const emailOk = safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL);
  const passwordOk = safeEqual(password, ADMIN_PASSWORD);
  // Bitwise AND (not &&) so both comparisons always run — no early-exit timing leak.
  return emailOk && passwordOk;
}

/** Mint a fresh signed session token stamped with the current time. */
export function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  const payload = `${SESSION_SUBJECT}.${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

/** Verify a session token's structure, signature, and age. */
export function verifySessionToken(token: unknown): boolean {
  if (typeof token !== "string") return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return false;

  const payload = token.slice(0, lastDot);
  const providedSig = token.slice(lastDot + 1);
  if (!safeEqual(providedSig, sign(payload))) return false;

  const [subject, issuedAtRaw] = payload.split(".");
  if (subject !== SESSION_SUBJECT) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;

  const age = Date.now() - issuedAt;
  if (age < 0 || age > SESSION_TTL_MS) return false;

  return true;
}

/** Read the admin session cookie and confirm the caller is authenticated. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}
