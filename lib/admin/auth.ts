import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Password-protected session for the admin console at `/admin`.
 *
 * Deliberately dependency-free: a single admin credential lives in env vars and
 * a short-lived, HMAC-signed cookie carries the session. There is no user table
 * and no external auth provider — this guards internal reporting pages, not a
 * multi-tenant product. All checks run server-side only.
 *
 * One session covers every event dashboard under `/admin`, so signing in once
 * at `/admin` is enough.
 */

/**
 * Admin credential.
 *
 * The `PAVEL_`-prefixed names are the originals, from when this guarded one
 * workshop's reporting page. It now guards the whole Fynix console, so the
 * unprefixed names are canonical and the old ones are read as a fallback. That
 * lets an environment adopt the new names on its own schedule instead of every
 * host having to change in the same instant. Drop the fallbacks once no
 * deployment sets the old names.
 *
 * NO defaults, deliberately. A credential in source code is a credential in
 * every clone of the repository, so with either value unset the console fails
 * closed: no login can succeed until the environment provides both.
 */
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.PAVEL_ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || process.env.PAVEL_ADMIN_PASSWORD || "";

/**
 * Secret that signs the session cookie.
 *
 * When unset, a random per-process secret is used instead of any well-known
 * constant: sessions still work within one process, cannot be forged from
 * outside, and simply expire on restart. The form-token secret is deliberately
 * NOT reused here — the bot screen and the admin session must never share a
 * key, or compromising the low-value one forges the high-value one.
 */
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.PAVEL_ADMIN_SESSION_SECRET ||
  ephemeralSessionSecret();

function ephemeralSessionSecret(): string {
  console.warn(
    "[admin/auth] ADMIN_SESSION_SECRET is not set; using a random per-process secret. " +
      "Sessions will not survive restarts or span instances — set it in production."
  );
  return crypto.randomBytes(32).toString("base64url");
}

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
  // Fail closed when the environment provides no credential: nothing can match.
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "[admin/auth] ADMIN_EMAIL / ADMIN_PASSWORD are not configured; refusing all logins."
    );
    return false;
  }
  // Both comparisons are evaluated before combining, so the credential check
  // costs the same time whichever half is wrong.
  const emailOk = safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL);
  const passwordOk = safeEqual(password, ADMIN_PASSWORD);
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
