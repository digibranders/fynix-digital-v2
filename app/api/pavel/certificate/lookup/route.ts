import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { lookupCertificate } from "@/lib/pavel/certificateLookup";
import { screenSubmission } from "@/lib/security/honeypot";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public lookup for the certificate verification page.
 *
 * Takes a credential id OR the email the seat was bought with, and answers with
 * the credential id so the page can open the certificate.
 *
 * The email route is the sensitive one. Everywhere else this system treats the
 * credential id as the capability precisely so the set cannot be enumerated,
 * and accepting an email makes attendance answerable by anyone who can type an
 * address. That is a product decision taken knowingly; what this route can do
 * is make bulk abuse impractical rather than free:
 *
 *   - the same signed form token + honeypot the registration form uses, so a
 *     script has to load a real page and wait before every attempt;
 *   - a rate limit per address;
 *   - one identical answer for "not found", "wrong field" and "malformed", so
 *     nothing can be inferred from the difference.
 *
 * Only the credential id leaves here. Names, emails, attendance and payment
 * stay behind the certificate page.
 */

/** Attempts allowed per client, per window. */
const LIMIT = 8;
const WINDOW_MS = 60_000;

/** One answer for every failure, so nothing is learned from which one it was. */
const NOT_FOUND = "We couldn’t find a certificate for that. Check the credential ID or email and try again.";

export async function POST(request: Request) {
  const limit = rateLimit(`cert-lookup:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: NOT_FOUND }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: NOT_FOUND }, { status: 400 });
  }

  // Bot screen first, so a scripted probe costs no database work.
  const screen = screenSubmission(body as Record<string, unknown>);
  if (!screen.human) {
    console.warn("[pavel/certificate/lookup] blocked submission:", screen.reason);
    return NextResponse.json(
      { ok: false, error: "We could not verify this form. Please reload the page and try again." },
      { status: 400 }
    );
  }

  const { credentialId, email } = body as Record<string, unknown>;

  const db = getDb();
  if (!db) {
    // No database on this host (Vercel). The page calls the droplet, so this is
    // a misconfiguration rather than a normal path.
    console.error("[pavel/certificate/lookup] database is not configured.");
    return NextResponse.json(
      { ok: false, error: "Verification is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  try {
    const found = await lookupCertificate(db, {
      credentialId: typeof credentialId === "string" ? credentialId.slice(0, 80) : null,
      email: typeof email === "string" ? email.slice(0, 320) : null,
    });

    if (!found) {
      return NextResponse.json({ ok: false, error: NOT_FOUND });
    }
    return NextResponse.json({ ok: true, credentialId: found.credentialId });
  } catch (error) {
    console.error("[pavel/certificate/lookup] lookup failed", error);
    return NextResponse.json(
      { ok: false, error: "Verification is temporarily unavailable. Please try again shortly." },
      { status: 500 }
    );
  }
}
