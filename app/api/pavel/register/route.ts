import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { screenSubmission } from "@/lib/security/honeypot";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { countryFromParam, PRICING } from "@/components/pavel/pricing";
import {
  COUNTRIES,
  countPhoneDigits,
  phoneLengthError,
} from "@/components/pavel/countries";
import { validTimeZone } from "@/lib/pavel/landingVariant";
import { isValidGstin, normalizeGstin } from "@/lib/pavel/gst";
import { isValidIndianState } from "@/lib/pavel/indianStates";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import { evaluateReferral, referralRejectionMessage } from "@/lib/pavel/referral";
import {
  closedMessage,
  deriveRegistrationWindow,
} from "@/lib/pavel/registrationWindow";

export const runtime = "nodejs";

/**
 * Capture a workshop registration as a `pending` record.
 *
 * This route no longer sends any email — it only records the lead. Payment is
 * confirmed by the Razorpay webhook (`/api/pavel/webhook`) and the signed
 * client-return (`/api/pavel/verify`), which flip the row to `paid` and
 * dispatch the confirmation + admin emails. Keeping capture and
 * payment-confirmation separate lets us see abandoned checkouts and guarantees
 * no email is ever tied to an unpaid seat.
 */

/**
 * Public reference id, e.g. "PVL-8F3K2A1B9C0D2E3F". Unguessable and printable.
 * 8 random bytes (64 bits): the ref doubles as the capability that unlocks the
 * thank-you page, so the space must be far beyond online enumeration. Older,
 * shorter refs remain valid — this only widens new ones.
 */
function generateRef(): string {
  return `PVL-${randomBytes(8).toString("hex").toUpperCase()}`;
}

/** Shape check for the address the confirmation will be sent to. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Registrations allowed per client per window — a replayed form token must
 *  not translate into unlimited pending rows. */
const LIMIT = 5;
const WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const limit = rateLimit(`pavel-register:${clientKey(request)}`, LIMIT, WINDOW_MS);
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

  // Bot screen (honeypot + signed form token). Runs first so a flagged
  // submission costs no database work.
  //
  // A rejection must never look like a success. This used to answer with a
  // decoy `success: true` and a throwaway ref so bots learned nothing — but the
  // checkout modal reads that as "seat reserved", and the screen also rejects
  // real people (an expired token, a stale tab, autofill in a decoy field).
  // Those buyers were shown a confirmation for a seat that was never recorded
  // and never charged. A generic failure tells a bot just as little and tells a
  // real person what to do.
  const screen = screenSubmission(body as Record<string, unknown>);
  if (!screen.human) {
    console.warn("[pavel/register] blocked submission:", screen.reason);
    return NextResponse.json(
      {
        error:
          "We could not verify this form. Please reload the page and try again.",
      },
      { status: 400 }
    );
  }

  const db = getDb();
  if (!db) {
    console.error("[pavel/register] Database is not configured.");
    return NextResponse.json(
      { error: "Registration is temporarily unavailable." },
      { status: 503 }
    );
  }

  // Refuse before recording anything. Checkout is the gate that protects the
  // money, but a closed event should not be quietly collecting names and email
  // addresses it has no intention of selling to.
  const registrationWindow = deriveRegistrationWindow(await getActiveSession(db));
  if (!registrationWindow.open) {
    return NextResponse.json(
      { error: closedMessage(), registrationsClosed: true },
      { status: 409 }
    );
  }

  const {
    name,
    email,
    phone,
    country,
    companyName,
    gstin,
    companyAddress,
    state,
    referralCode,
    timeZone,
  } = body as Record<string, string>;

  // Name and email are required and validated, never defaulted. The old
  // fallbacks ("Guest", guest@example.com) let a row with no deliverable
  // address become a PAID seat whose confirmation, invoice and join link all
  // silently went nowhere. Length caps keep a stray paste out of the invoices,
  // emails and Zoom records these fields flow into.
  const attendeeName =
    typeof name === "string" ? name.trim().slice(0, 120) : "";
  if (!attendeeName) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }
  const attendeeEmail =
    typeof email === "string" ? email.trim().toLowerCase().slice(0, 320) : "";
  if (!attendeeEmail || !EMAIL_REGEX.test(attendeeEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  const attendeePhone =
    (phone && typeof phone === "string" && phone.trim().slice(0, 32)) || null;
  // Optional referral code. Nothing is stored unless it validates — see below.
  const typedReferral =
    typeof referralCode === "string" && referralCode.trim() ? referralCode : null;
  const resolvedCountry = countryFromParam(country) ?? "REST";
  // Keep the buyer's ACTUAL country alongside the pricing region: an export
  // invoice must name the country of destination, which 'REST' cannot express.
  const buyerCountry = COUNTRIES.find((c) => c.name === country);

  // Phone is mandatory and must match the selected country's expected length.
  // The client sends the full number ("+91 98765 43210"), so strip the dial
  // code's digits before counting the national part — this mirrors the check
  // the checkout modal already ran (defence-in-depth, never client-trusted).
  if (!attendeePhone) {
    return NextResponse.json(
      { error: "Please enter your phone number." },
      { status: 400 }
    );
  }
  const selectedCountry = COUNTRIES.find((c) => c.name === country);
  if (selectedCountry) {
    const dialDigits = countPhoneDigits(selectedCountry.dialCode);
    const nationalDigits = Math.max(
      0,
      countPhoneDigits(attendeePhone) - dialDigits
    );
    const phoneError = phoneLengthError(nationalDigits, selectedCountry);
    if (phoneError) {
      return NextResponse.json({ error: phoneError }, { status: 400 });
    }
  }

  // Optional GST details (India only). Validate only when a GSTIN is supplied —
  // a malformed one is rejected so we never store junk on a tax invoice, and a
  // GSTIN without a company name is incomplete.
  let attendeeCompany: string | null = null;
  let attendeeGstin: string | null = null;
  let attendeeCompanyAddress: string | null = null;
  if (gstin && typeof gstin === "string" && gstin.trim()) {
    if (!isValidGstin(gstin)) {
      return NextResponse.json(
        { error: "Please enter a valid 15-character GSTIN." },
        { status: 400 }
      );
    }
    const companyTrimmed =
      typeof companyName === "string" ? companyName.trim().slice(0, 200) : "";
    if (!companyTrimmed) {
      return NextResponse.json(
        { error: "Please enter the company name registered under the GSTIN." },
        { status: 400 }
      );
    }
    attendeeCompany = companyTrimmed;
    attendeeGstin = normalizeGstin(gstin);
    // Optional billing address for the tax invoice — capped so a stray paste
    // can't bloat the row.
    attendeeCompanyAddress =
      typeof companyAddress === "string" && companyAddress.trim()
        ? companyAddress.trim().slice(0, 300)
        : null;
  }

  // State is captured for Indian registrations only (place of supply). Required
  // and validated against the known states/UTs for India; ignored otherwise.
  let attendeeState: string | null = null;
  if (resolvedCountry === "IN") {
    const stateTrimmed = typeof state === "string" ? state.trim() : "";
    if (!stateTrimmed || !isValidIndianState(stateTrimmed)) {
      return NextResponse.json(
        { error: "Please select your state." },
        { status: 400 }
      );
    }
    attendeeState = stateTrimmed;
  }

  // Validate the code here, not only at checkout.
  //
  // Storing whatever was typed is how a typo ('STEVE 10', 'steve1O') became a
  // row that looks like partner attribution, grants no discount, and reconciles
  // against nothing. A code now either earns its place on the row or the
  // registration is refused, so this column can be counted on for money. The
  // stored value is the NORMALISED code, so a report can group on it.
  let attendeeReferral: string | null = null;
  if (typedReferral) {
    const result = await evaluateReferral(db, typedReferral);
    if (!result.ok) {
      return NextResponse.json(
        { error: referralRejectionMessage(result.reason), referralRejected: true },
        { status: result.reason === "unavailable" ? 503 : 400 }
      );
    }
    attendeeReferral = result.code;
  }

  const ref = generateRef();

  try {
    await db.insert(registrations).values({
      ref,
      name: attendeeName,
      email: attendeeEmail,
      phone: attendeePhone,
      companyName: attendeeCompany,
      gstin: attendeeGstin,
      companyAddress: attendeeCompanyAddress,
      state: attendeeState,
      referralCode: attendeeReferral,
      country: resolvedCountry,
      countryName: buyerCountry?.name ?? null,
      countryCode: buyerCountry?.code ?? null,
      // Validated, never trusted: this string is fed to Intl.DateTimeFormat at
      // send time, and an unrecognised zone there throws inside the mail
      // pipeline. `validTimeZone` answers "" for anything Intl rejects, which
      // stores null and puts the emails back on the IST + UTC line.
      timeZone: validTimeZone(timeZone) || null,
      // The list price for the resolved region — derived here, never read from
      // the client, so a tampered request can't plant its own text in the admin
      // table. Checkout overwrites it with the real charged amount (discount
      // and GST included) when the order is created.
      amountDisplay: PRICING[resolvedCountry].display,
      status: "pending",
    });
  } catch (insertError) {
    console.error("[pavel/register] failed to insert registration", insertError);
    return NextResponse.json(
      { error: "Could not record your registration. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    ref,
    email: attendeeEmail,
    name: attendeeName,
    message: "Seat reserved! Continue to payment.",
  });
}
