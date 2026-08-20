import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";
import { evaluateReferral, referralRejectionMessage } from "@/lib/pavel/referral";
import { normalizeReferralCode } from "@/components/pavel/pricing";

export const runtime = "nodejs";

/** Validation attempts per client per window — enough for typos, far too few
 *  for brute-forcing the code space. */
const LIMIT = 10;
const WINDOW_MS = 60_000;

/**
 * Validate a referral code for the checkout modal so the buyer sees the
 * discount — or the reason it was refused — before paying. The authoritative
 * discount is re-derived server-side when the Razorpay order is created
 * (/api/pavel/checkout), so a tampered response here can never change what is
 * actually charged.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`pavel-referral:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { valid: false, error: "Too many attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
  }

  const raw =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).code === "string"
      ? (body as Record<string, string>).code
      : "";
  const code = normalizeReferralCode(raw);
  if (!code) {
    return NextResponse.json({ valid: false, error: "Enter a referral code." }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { valid: false, reason: "unavailable", error: referralRejectionMessage("unavailable") },
      { status: 503 }
    );
  }

  const result = await evaluateReferral(db, code);
  if (!result.ok) {
    // A transient failure is a 503, not a verdict on the code. Answering 200
    // here would tell the buyer their perfectly good code is bad.
    const status = result.reason === "unavailable" ? 503 : 200;
    return NextResponse.json(
      {
        valid: false,
        reason: result.reason,
        error: referralRejectionMessage(result.reason),
      },
      { status }
    );
  }

  return NextResponse.json({
    valid: true,
    code: result.code,
    discountPercent: result.discountPercent,
  });
}
