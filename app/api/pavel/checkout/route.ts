import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay/client";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { screenSubmission } from "@/lib/security/honeypot";
import {
  PRICING,
  applyDiscount,
  formatUnitAmount,
  type Country,
} from "@/components/pavel/pricing";
import { lookupReferral } from "@/lib/pavel/referral";

export const runtime = "nodejs";

const WORKSHOP_NAME = "Semantic SEO Workshop with Pavel Klimakov";

/**
 * Create a Razorpay Order for an already-recorded `pending` registration
 * (created by /api/pavel/register). The registration's `ref` links this order,
 * the webhook that confirms payment, and the thank-you page that verifies it.
 *
 * Price and country are read from the stored registration — never from the
 * client — so the amount charged can't be tampered with. The order id is
 * returned to the browser, which opens the Razorpay Checkout overlay against it;
 * payment is later confirmed by the signed handler (/api/pavel/verify) and the
 * webhook (/api/pavel/webhook).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body format." }, { status: 400 });
  }

  // Bot screen. On failure, silently report "not configured" so bots learn
  // nothing and no Razorpay order is ever created for them.
  const screen = screenSubmission(body as Record<string, unknown>);
  if (!screen.human) {
    console.warn("[pavel/checkout] blocked bot submission:", screen.reason);
    return NextResponse.json({ razorpayConfigured: false });
  }

  const { ref } = body as Record<string, string>;
  if (!ref || typeof ref !== "string") {
    return NextResponse.json({ error: "Missing registration ref." }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    // Hard-fail rather than degrade: a null DB is a misconfiguration, not a
    // "payments off" state. Returning `razorpayConfigured:false` here would send
    // the buyer to the no-charge holding flow and silently swallow the problem.
    console.error("[pavel/checkout] Database is not configured.");
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable." },
      { status: 503 }
    );
  }

  // Load the registration this checkout belongs to. Must exist and be unpaid.
  const [registration] = await db
    .select({
      id: registrations.id,
      ref: registrations.ref,
      name: registrations.name,
      email: registrations.email,
      country: registrations.country,
      companyName: registrations.companyName,
      gstin: registrations.gstin,
      referralCode: registrations.referralCode,
      status: registrations.status,
    })
    .from(registrations)
    .where(eq(registrations.ref, ref))
    .limit(1);

  if (!registration) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }
  if (registration.status === "paid") {
    return NextResponse.json({ error: "This seat is already paid." }, { status: 409 });
  }

  // Block a second payment if this email already holds a paid seat (under any
  // ref). Pending/abandoned attempts are still free to retry — only a confirmed
  // paid seat stops a duplicate charge.
  const [existingPaid] = await db
    .select({ ref: registrations.ref })
    .from(registrations)
    .where(
      and(
        eq(registrations.email, registration.email),
        eq(registrations.status, "paid")
      )
    )
    .limit(1);

  if (existingPaid) {
    return NextResponse.json({
      alreadyRegistered: true,
      email: registration.email,
    });
  }

  const resolvedCountry: Country = registration.country === "IN" ? "IN" : "REST";
  const price = PRICING[resolvedCountry];

  // Re-validate the stored referral code server-side and derive the discount
  // here — never trust a discount from the client. Falls back to full price for
  // an empty, unknown, or inactive code.
  const referral = await lookupReferral(db, registration.referralCode);
  const chargeAmount = referral
    ? applyDiscount(price.unitAmount, referral.discountPercent)
    : price.unitAmount;
  const chargeDisplay = referral
    ? formatUnitAmount(price, chargeAmount)
    : price.display;

  // Without keys we can't create an order — tell the client so it can fall back
  // to the no-payment holding flow, keeping the funnel testable.
  const razorpay = getRazorpay();
  const keyId = getRazorpayKeyId();
  if (!razorpay || !keyId) {
    return NextResponse.json({ razorpayConfigured: false });
  }

  try {
    const order = await razorpay.orders.create({
      amount: chargeAmount, // smallest currency unit (paise / cents), discount applied
      currency: price.currencyCode, // 'INR' | 'USD'
      receipt: registration.ref,
      notes: {
        ref: registration.ref,
        name: registration.name,
        email: registration.email,
        country: resolvedCountry,
        workshop: WORKSHOP_NAME,
        // Referral discount (when a valid code was stored) — recorded on the
        // payment so the applied code and percentage are auditable.
        ...(referral
          ? {
              referralCode: referral.code,
              discountPercent: String(referral.discountPercent),
            }
          : {}),
        // GST details (India only) — included so the payment/invoice carries the
        // buyer's tax id. Omitted entirely when the buyer didn't provide one.
        ...(registration.gstin ? { gstin: registration.gstin } : {}),
        ...(registration.companyName
          ? { companyName: registration.companyName }
          : {}),
      },
    });

    // Record the order id (and the applied discount + charged amount) so the
    // webhook + verify can map payment → registration and emails show the real
    // amount paid.
    try {
      await db
        .update(registrations)
        .set({
          razorpayOrderId: order.id,
          discountPercent: referral?.discountPercent ?? null,
          amountDisplay: chargeDisplay,
        })
        .where(eq(registrations.id, registration.id));
    } catch (updateError) {
      console.error("[pavel/checkout] failed to store order id", updateError);
      // Non-fatal: the order notes also carry `ref` as a fallback.
    }

    return NextResponse.json({
      razorpayConfigured: true,
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: registration.name,
      email: registration.email,
      ref: registration.ref,
    });
  } catch (error) {
    console.error("[pavel/checkout] failed to create Razorpay order", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 }
    );
  }
}
