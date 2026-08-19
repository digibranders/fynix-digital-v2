import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay/client";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { screenSubmission } from "@/lib/security/honeypot";
import {
  PRICING,
  formatUnitAmount,
  type Country,
} from "@/components/pavel/pricing";
import { evaluateReferral, referralRejectionMessage } from "@/lib/pavel/referral";
import { computeTax } from "@/lib/pavel/tax";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import {
  closedMessage,
  deriveRegistrationWindow,
} from "@/lib/pavel/registrationWindow";

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

  // Bot screen. Runs first so a flagged submission never reaches the database
  // or Razorpay.
  //
  // Answers with a plain failure, not the "payments are not configured" signal
  // it used to send: the client treats that signal as "registration complete",
  // so every submission the screen rejected — including real people with an
  // expired or freshly-issued token — was shown a confirmed seat it had not
  // paid for. See the register route for the other half of this.
  const screen = screenSubmission(body as Record<string, unknown>);
  if (!screen.human) {
    console.warn("[pavel/checkout] blocked submission:", screen.reason);
    return NextResponse.json(
      {
        error:
          "We could not verify this form. Please reload the page and try again.",
      },
      { status: 400 }
    );
  }

  const { ref } = body as Record<string, string>;
  if (!ref || typeof ref !== "string") {
    return NextResponse.json({ error: "Missing registration ref." }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    // Hard-fail rather than degrade: a null DB is a misconfiguration, not a
    // "payments off" state. Degrading here would send the buyer to a no-charge
    // holding confirmation and silently swallow the problem.
    console.error("[pavel/checkout] Database is not configured.");
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable." },
      { status: 503 }
    );
  }

  // The authoritative close gate. The landing page renders its own closed state
  // from the same source, but that is a cached read on another host and can be
  // stale or bypassed entirely by posting here directly, so the decision that
  // stops money moving has to be made against the database, now.
  const activeSession = await getActiveSession(db);
  const registrationWindow = deriveRegistrationWindow(activeSession);
  // Read the reason out before branching: inside the guard the union has been
  // widened by the extra `activeSession` test and no longer narrows on its own.
  const closedReason = registrationWindow.open ? null : registrationWindow.reason;

  // `activeSession` is redundant to test — a null session already closes the
  // window — but it narrows the type, so the query below reaches `.id` without
  // a non-null assertion.
  if (closedReason || !activeSession) {
    console.warn(
      "[pavel/checkout] refused: registrations closed",
      closedReason ?? "no_active_session",
      ref
    );
    return NextResponse.json(
      { error: closedMessage(), registrationsClosed: true },
      { status: 409 }
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
      countryName: registrations.countryName,
      state: registrations.state,
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

  // Already paid FOR THIS SESSION — not merely at some point in the past.
  //
  // Scoped deliberately. Unscoped, this blocked every returning customer: buy a
  // seat in one cohort and you could never buy another, because the check only
  // asked whether this email had ever paid. It still does the job it exists for,
  // which is stopping a double charge for the same workshop. Pending or
  // abandoned attempts are still free to retry; only a confirmed paid seat
  // blocks another.
  const [existingPaid] = await db
    .select({ ref: registrations.ref })
    .from(registrations)
    .where(
      and(
        eq(registrations.email, registration.email),
        eq(registrations.status, "paid"),
        eq(registrations.sessionId, activeSession.id)
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

  // Re-validate the stored code and derive the discount here — never trust a
  // discount from the client.
  //
  // A code can go stale between reserving a seat and paying for it: it may
  // expire, be switched off, or have its last slot taken by someone else. The
  // sale is refused rather than quietly repriced. Charging the list price to
  // someone who got this far expecting a discount is the one outcome worse than
  // an error message.
  let referral: { code: string; discountPercent: number } | null = null;
  if (registration.referralCode) {
    const result = await evaluateReferral(db, registration.referralCode);
    if (!result.ok) {
      console.warn(
        "[pavel/checkout] refused: referral no longer redeemable",
        registration.referralCode,
        result.reason
      );
      return NextResponse.json(
        {
          error: `${referralRejectionMessage(result.reason)} Please remove it and try again.`,
          referralRejected: true,
        },
        { status: result.reason === "unavailable" ? 503 : 409 }
      );
    }
    referral = { code: result.code, discountPercent: result.discountPercent };
  }

  // Derive the charge from the taxable base: discount, then GST, then total.
  // The invoice is built from this same breakdown, so the amount charged and the
  // amount invoiced are identical by construction (see lib/pavel/tax.ts).
  const tax = computeTax({
    country: resolvedCountry,
    state: registration.state,
    destinationCountry: registration.countryName,
    base: price.base,
    discountPercent: referral?.discountPercent ?? 0,
  });
  const chargeAmount = tax.total;
  const chargeDisplay = referral
    ? formatUnitAmount(price, chargeAmount)
    : price.display;

  // Without keys no order can be created. Hard-fail, exactly as an unreachable
  // database does above: this is a misconfiguration, not a "payments off" mode.
  // Reporting it to the client used to send the buyer to a no-charge holding
  // confirmation, which reads as a purchased seat and hides the outage from
  // everyone until someone tries to attend.
  const razorpay = getRazorpay();
  const keyId = getRazorpayKeyId();
  if (!razorpay || !keyId) {
    console.error("[pavel/checkout] Razorpay is not configured.");
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable." },
      { status: 503 }
    );
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
          amountCharged: chargeAmount,
          currency: price.currencyCode,
        })
        .where(eq(registrations.id, registration.id));
    } catch (updateError) {
      console.error("[pavel/checkout] failed to store order id", updateError);
      // Non-fatal: the order notes also carry `ref` as a fallback.
    }

    return NextResponse.json({
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
