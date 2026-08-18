import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db/client";
import { confirmRegistrationPaid } from "@/lib/pavel/confirm";

/**
 * Verify a Razorpay Checkout handler signature: HMAC-SHA256 of
 * `order_id|payment_id` keyed with the account secret must equal the returned
 * `razorpay_signature`. Constant-time compared to avoid a timing oracle.
 */
function isValidPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}

export const runtime = "nodejs";

/**
 * Client-return verification for the Razorpay Checkout overlay.
 *
 * When the overlay reports success it hands the browser three values —
 * `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` — which the
 * modal POSTs here. The signature is an HMAC-SHA256 of `order_id|payment_id`
 * keyed with the Razorpay secret, so a forged success can't confirm a seat.
 *
 * This is the FAST PATH that lets the thank-you page reveal access immediately;
 * the webhook (/api/pavel/webhook) is the authoritative confirmation. Both call
 * the same idempotent `confirmRegistrationPaid`, so whichever lands first wins
 * and the other no-ops.
 */
export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error("[pavel/verify] Razorpay secret not configured.");
    return NextResponse.json({ paid: false, reason: "not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ paid: false, reason: "invalid_json" }, { status: 400 });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return NextResponse.json({ paid: false, reason: "missing_fields" }, { status: 400 });
  }

  // Verify the handler signature (HMAC over `order_id|payment_id`).
  const valid = isValidPaymentSignature(orderId, paymentId, signature, keySecret);
  if (!valid) {
    console.warn("[pavel/verify] signature verification failed", { orderId });
    return NextResponse.json({ paid: false, reason: "invalid_signature" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    console.error("[pavel/verify] Database not configured.");
    return NextResponse.json({ paid: false, reason: "unavailable" }, { status: 503 });
  }

  const result = await confirmRegistrationPaid(db, { orderId, paymentId });

  if (result.status === "not_found") {
    console.warn(`[pavel/verify] no registration for order=${orderId}`);
    return NextResponse.json({ paid: false, reason: "not_found" }, { status: 404 });
  }
  if (result.status === "error") {
    console.error("[pavel/verify] confirmation failed", result.reason);
    return NextResponse.json({ paid: false, reason: "error" }, { status: 500 });
  }

  return NextResponse.json({ paid: true, ref: result.ref, name: result.name });
}
