import crypto from "crypto";

/**
 * Layered honeypot / bot-screening for the Pavel workshop forms.
 *
 * Defense in depth — a submission must clear ALL of these to look human:
 *   1. Decoy fields (`HONEYPOT_FIELDS`) must be empty. They are rendered
 *      off-screen and hidden from assistive tech, so a real user never fills
 *      them, but naive bots that populate every field trip the trap.
 *   2. A server-issued, HMAC-signed form token must be present and valid.
 *      Bots that POST straight to the API (skipping the page) have no token.
 *   3. The token's age must sit inside a plausible window: submitting faster
 *      than a human can type (`MIN_FILL_MS`) or on a stale/replayed token
 *      (older than `MAX_TOKEN_AGE_MS`) is rejected.
 *
 * Enforced server-side only — client checks are trivially bypassed by bots.
 */

/**
 * Signs form tokens for the workshop checkout and the admin login alike, so the
 * name is deliberately unprefixed. `PAVEL_FORM_SECRET` is the original name,
 * still read as a fallback so environments can migrate independently.
 *
 * A token must be issued and verified by the SAME host, since each host signs
 * with its own copy of this value.
 *
 * When unset, a random per-process secret stands in rather than any well-known
 * constant a bot author could sign with. Single-process hosts (the droplet,
 * local dev) keep working unchanged; serverless hosts, where issue and verify
 * can land on different instances, need the env var set — which production
 * must do anyway.
 */
const SECRET =
  process.env.FORM_SECRET ||
  process.env.PAVEL_FORM_SECRET ||
  ephemeralFormSecret();

function ephemeralFormSecret(): string {
  console.warn(
    "[security/honeypot] FORM_SECRET is not set; using a random per-process secret. " +
      "Tokens will not verify across instances or restarts — set it in production."
  );
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Minimum time between the form loading and submitting. Faster ⇒ bot. Kept low
 * enough that browser autofill users aren't false-flagged; the signed token and
 * decoy fields are the primary defenses.
 */
const MIN_FILL_MS = 1_500;
/** Token lifetime. Older ⇒ stale/replayed; re-open the form to get a fresh one. */
const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1_000; // 2 hours

/** Hidden decoy field names. Any non-empty value flags a bot. */
export const HONEYPOT_FIELDS = ["company_website", "fax_number"] as const;

/** Body key carrying the signed form token. */
export const FORM_TOKEN_FIELD = "formToken";

export type ScreenResult =
  | { human: true }
  | { human: false; reason: string };

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/** Issue a fresh signed token stamped with the current time. */
export function issueFormToken(): string {
  const ts = Date.now().toString();
  return `${ts}.${sign(ts)}`;
}

function verifyToken(token: unknown): ScreenResult {
  if (typeof token !== "string" || !token.includes(".")) {
    return { human: false, reason: "missing-token" };
  }

  const separator = token.indexOf(".");
  const ts = token.slice(0, separator);
  const providedSig = token.slice(separator + 1);
  const expectedSig = sign(ts);

  const provided = Buffer.from(providedSig);
  const expected = Buffer.from(expectedSig);
  if (
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(provided, expected)
  ) {
    return { human: false, reason: "bad-signature" };
  }

  const issuedAt = Number(ts);
  if (!Number.isFinite(issuedAt)) {
    return { human: false, reason: "bad-timestamp" };
  }

  const age = Date.now() - issuedAt;
  if (age < MIN_FILL_MS) return { human: false, reason: "too-fast" };
  if (age > MAX_TOKEN_AGE_MS) return { human: false, reason: "expired" };

  return { human: true };
}

function honeypotTripped(body: Record<string, unknown>): boolean {
  return HONEYPOT_FIELDS.some((field) => {
    const value = body[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

/**
 * Run the full screen. Returns `{ human: true }` only when the decoy fields are
 * empty AND the token is present, correctly signed, and freshly aged.
 */
export function screenSubmission(body: Record<string, unknown>): ScreenResult {
  if (honeypotTripped(body)) return { human: false, reason: "honeypot" };
  return verifyToken(body[FORM_TOKEN_FIELD]);
}
