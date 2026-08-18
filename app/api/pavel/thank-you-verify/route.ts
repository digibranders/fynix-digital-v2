import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { getRazorpay } from "@/lib/razorpay/client";

export const runtime = "nodejs";

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
      }
    | undefined;
  try {
    [registration] = await db
      .select({
        name: registrations.name,
        ref: registrations.ref,
        status: registrations.status,
        razorpayOrderId: registrations.razorpayOrderId,
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
    return NextResponse.json({ paid: true, name: registration.name, ref: registration.ref });
  }

  // Still pending — the webhook/verify may not have landed yet. Ask Razorpay
  // directly, but only trust a payment that belongs to THIS registration's order.
  const razorpay = getRazorpay();
  if (paymentId && razorpay) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      const belongsToThisOrder =
        !registration.razorpayOrderId ||
        payment.order_id === registration.razorpayOrderId;
      if (payment.status === "captured" && belongsToThisOrder) {
        return NextResponse.json({
          paid: true,
          name: registration.name,
          ref: registration.ref,
        });
      }
    } catch (err) {
      console.error("[pavel/thank-you-verify] Razorpay payment lookup failed", err);
    }
  }

  return NextResponse.json({ paid: false, reason: "processing" });
}
