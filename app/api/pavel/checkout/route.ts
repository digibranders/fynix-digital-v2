import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay/client";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { screenSubmission } from "@/lib/security/honeypot";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";
import {
  MIN_CHARGE_UNITS,
  PRICING,
  effectiveDiscountPercent,
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
/** Order-creation attempts allowed per client per window. Every call below
 *  costs a Razorpay API round-trip, so a replayed form token must not be able
 *  to mint orders in bulk. Generous enough for genuine retries. */
const LIMIT = 10;
const WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const limit = rateLimit(`pavel-checkout:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

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

  // Without keys no order can be created. Checked BEFORE the reservation below
  // so a misconfigured host fails without holding a cap slot. Hard-fail,
  // exactly as an unreachable database does above: this is a misconfiguration,
  // not a "payments off" mode.
  const razorpay = getRazorpay();
  const keyId = getRazorpayKeyId();
  if (!razorpay || !keyId) {
    console.error("[pavel/checkout] Razorpay is not configured.");
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable." },
      { status: 503 }
    );
  }

  // Re-validate the stored code and RESERVE this checkout, in one transaction.
  //
  // A code can go stale between reserving a seat and paying for it: it may
  // expire, be switched off, or have its last slot taken by someone else. The
  // sale is refused rather than quietly repriced. Charging the list price to
  // someone who got this far expecting a discount is the one outcome worse than
  // an error message.
  //
  // Two things make the cap race-proof where a bare re-check was not:
  //
  //   - The advisory lock serialises checkouts per code, so two concurrent
  //     requests cannot both read the same redemption count and both pass.
  //   - Stamping `checkout_started_at` (with the discount) makes this checkout
  //     a RESERVATION that `countRedemptions` counts for the next half hour, so
  //     checkouts that are open but unpaid hold their slot instead of letting
  //     the cap re-sell it. See lib/pavel/referral.ts.
  //
  // The session id is stamped here too: the row is sold into THIS session from
  // the moment money can move, not only once Zoom registration succeeds — which
  // is what lets the paid-confirmation flag a duplicate payment for the same
  // cohort (see lib/pavel/confirm.ts).
  let referral: { code: string; discountPercent: number } | null = null;
  try {
    const reservation = await db.transaction(async (tx) => {
      let txReferral: { code: string; discountPercent: number } | null = null;
      if (registration.referralCode) {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${
            "pavel-referral:" + registration.referralCode
          }, 0))`
        );
        const result = await evaluateReferral(tx, registration.referralCode);
        if (!result.ok) return { ok: false as const, reason: result.reason };
        // Cap the discount at whatever still clears Razorpay's minimum charge,
        // and store the capped figure: the invoice is rebuilt from this column,
        // so the stored percent has to be the one the order was priced with.
        const discountPercent = effectiveDiscountPercent(
          price,
          result.discountPercent
        );
        if (discountPercent !== result.discountPercent) {
          console.warn(
            "[pavel/checkout] discount capped to clear the gateway minimum",
            result.code,
            `${result.discountPercent}% -> ${discountPercent}%`
          );
        }
        txReferral = { code: result.code, discountPercent };
      }
      await tx
        .update(registrations)
        .set({
          sessionId: activeSession.id,
          discountPercent: txReferral?.discountPercent ?? null,
          checkoutStartedAt: new Date(),
        })
        .where(eq(registrations.id, registration.id));
      return { ok: true as const, referral: txReferral };
    });

    if (!reservation.ok) {
      console.warn(
        "[pavel/checkout] refused: referral no longer redeemable",
        registration.referralCode,
        reservation.reason
      );
      return NextResponse.json(
        {
          error: `${referralRejectionMessage(reservation.reason)} Please remove it and try again.`,
          referralRejected: true,
        },
        { status: reservation.reason === "unavailable" ? 503 : 409 }
      );
    }
    referral = reservation.referral;
  } catch (reservationError) {
    console.error("[pavel/checkout] reservation failed", reservationError);
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable." },
      { status: 503 }
    );
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

  // Backstop for the cap above. Razorpay accepts an order under one whole
  // currency unit and then refuses the payment against it, so the failure has
  // to surface here, where it can be logged and explained, rather than as an
  // "amount is different from your order amount" overlay the buyer cannot act
  // on.
  if (chargeAmount < MIN_CHARGE_UNITS) {
    console.error(
      "[pavel/checkout] refused: charge below the gateway minimum",
      chargeAmount,
      price.currencyCode
    );
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable." },
      { status: 503 }
    );
  }

  const chargeDisplay = referral
    ? formatUnitAmount(price, chargeAmount)
    : price.display;

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

    // Record the order id (and the charged amount) so the webhook + verify can
    // map payment → registration and emails show the real amount paid. The
    // discount and session were already stamped by the reservation above.
    try {
      await db
        .update(registrations)
        .set({
          razorpayOrderId: order.id,
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
    // No order exists, so the reservation is holding a cap slot for nothing.
    // Release it best-effort; if this also fails, the slot simply ages out of
    // the reservation window on its own.
    try {
      await db
        .update(registrations)
        .set({ checkoutStartedAt: null, discountPercent: null })
        .where(eq(registrations.id, registration.id));
    } catch (releaseError) {
      console.error("[pavel/checkout] failed to release reservation", releaseError);
    }
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 }
    );
  }
}
