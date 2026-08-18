import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { lookupReferral } from "@/lib/pavel/referral";
import { normalizeReferralCode } from "@/components/pavel/pricing";

export const runtime = "nodejs";

/**
 * Validate a referral code for the checkout modal so the buyer sees the
 * discount before paying. This only reports whether a code is valid and its
 * percentage — the authoritative discount is re-derived server-side when the
 * Razorpay order is created (/api/pavel/checkout), so a tampered response here
 * can never change what is actually charged.
 */
export async function POST(request: Request) {
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
      { valid: false, error: "Referral codes are unavailable right now." },
      { status: 503 }
    );
  }

  const referral = await lookupReferral(db, code);
  if (!referral) {
    return NextResponse.json({ valid: false, error: "That code isn’t valid." });
  }

  return NextResponse.json({
    valid: true,
    code: referral.code,
    discountPercent: referral.discountPercent,
  });
}
