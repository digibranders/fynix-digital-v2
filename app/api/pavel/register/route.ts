import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { screenSubmission } from "@/lib/security/honeypot";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { countryFromParam } from "@/components/pavel/pricing";
import {
  COUNTRIES,
  countPhoneDigits,
  phoneLengthError,
} from "@/components/pavel/countries";
import { isValidGstin, normalizeGstin } from "@/lib/pavel/gst";
import { isValidIndianState } from "@/lib/pavel/indianStates";

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

/** Public reference id, e.g. "PVL-8F3K2A". Unguessable, printable, short. */
function generateRef(): string {
  return `PVL-${randomBytes(4).toString("hex").toUpperCase()}`;
}

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

  // Bot screen (honeypot + signed form token). On failure, return a decoy
  // success (with a throwaway ref) so bots see no difference — nothing is
  // ever written to the datastore for a flagged submission.
  const screen = screenSubmission(body as Record<string, unknown>);
  if (!screen.human) {
    console.warn("[pavel/register] blocked bot submission:", screen.reason);
    return NextResponse.json({
      success: true,
      ref: "PVL-0000",
      email: "guest@example.com",
      name: "Guest",
      message: "Seat reserved! Continue to payment.",
    });
  }

  const db = getDb();
  if (!db) {
    console.error("[pavel/register] Database is not configured.");
    return NextResponse.json(
      { error: "Registration is temporarily unavailable." },
      { status: 503 }
    );
  }

  const {
    name,
    email,
    phone,
    country,
    amountDisplay,
    companyName,
    gstin,
    companyAddress,
    state,
    referralCode,
  } = body as Record<string, string>;

  const attendeeName =
    (name && typeof name === "string" && name.trim()) || "Guest";
  const attendeeEmail =
    (email && typeof email === "string" && email.trim().toLowerCase()) ||
    "guest@example.com";
  const attendeePhone =
    (phone && typeof phone === "string" && phone.trim()) || null;
  // Optional referral code — trimmed and length-capped so a stray value can't
  // bloat the row; attribution only, no discount is applied here.
  const attendeeReferral =
    (referralCode && typeof referralCode === "string" && referralCode.trim().slice(0, 60)) ||
    null;
  const resolvedCountry = countryFromParam(country) ?? "REST";

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
      typeof companyName === "string" ? companyName.trim() : "";
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
      amountDisplay: amountDisplay || null,
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
