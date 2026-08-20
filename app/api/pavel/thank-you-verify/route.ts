import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { getRazorpay } from "@/lib/razorpay/client";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

/** Lookups per client per window. The ref is the capability here, so bulk
 *  probing for valid refs must stay impractical; a buyer's page polls this a
 *  handful of times at most. */
const LIMIT = 30;
const WINDOW_MS = 60_000;

/**
 * Server-side gate for the thank-you page. The page passes the `ref` (and the
 * Razorpay `payment_id`) from its URL; this route confirms the seat is actually
 * paid before the client reveals the Zoom access. Query params alone are never
 * trusted — payment is verified against the datastore, with a live Razorpay
 * payment lookup as a fallback for the brief window before the webhook lands.
 *
 * Read-only by design: it never flips a seat to paid (that's the webhook and
 * /api/pavel/verify). It only reports whether the seat is already confirmed.
 */
export async function GET(request: Request) {
  const limit = rateLimit(`pavel-thank-you:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { paid: false, reason: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");
  const paymentId = searchParams.get("payment_id");

  if (!ref) {
    return NextResponse.json({ paid: false, reason: "missing_ref" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ paid: false, reason: "unavailable" }, { status: 503 });
  }

  let registration:
    | {
        name: string;
        ref: string;
        status: string;
        razorpayOrderId: string | null;
        zoomJoinUrl: string | null;
        countryCode: string | null;
      }
    | undefined;
  try {
    [registration] = await db
      .select({
        name: registrations.name,
        ref: registrations.ref,
        status: registrations.status,
        razorpayOrderId: registrations.razorpayOrderId,
        zoomJoinUrl: registrations.zoomJoinUrl,
        countryCode: registrations.countryCode,
      })
      .from(registrations)
      .where(eq(registrations.ref, ref))
      .limit(1);
  } catch {
    return NextResponse.json({ paid: false, reason: "error" }, { status: 500 });
  }

  if (!registration) {
    return NextResponse.json({ paid: false, reason: "not_found" }, { status: 404 });
  }

  if (registration.status === "paid") {
    return NextResponse.json({
      paid: true,
      name: registration.name,
      ref: registration.ref,
      // The buyer's OWN tokenised link. Absent only if Zoom registration has
      // not landed yet, in which case the page says so rather than showing a
      // shared link that would not admit them.
      joinUrl: registration.zoomJoinUrl,
      // Lets the page show the session in the buyer's own time rather than a
      // UTC offset they have to convert themselves.
      countryCode: registration.countryCode,
    });
  }

  // Still pending — the webhook/verify may not have landed yet. Ask Razorpay
  // directly, but only trust a payment that belongs to THIS registration's
  // order. A registration with no stored order id cannot have been paid, so it
  // gets no fallback at all: treating "no order" as a match let any captured
  // payment on the account vouch for someone else's registration.
  const razorpay = getRazorpay();
  if (paymentId && razorpay && registration.razorpayOrderId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      const belongsToThisOrder =
        payment.order_id === registration.razorpayOrderId;
      if (payment.status === "captured" && belongsToThisOrder) {
        return NextResponse.json({
          paid: true,
          name: registration.name,
          ref: registration.ref,
          joinUrl: registration.zoomJoinUrl,
          countryCode: registration.countryCode,
        });
      }
    } catch (err) {
      console.error("[pavel/thank-you-verify] Razorpay payment lookup failed", err);
    }
  }

  return NextResponse.json({ paid: false, reason: "processing" });
}
