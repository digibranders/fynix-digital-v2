import { NextResponse } from "next/server";
import { CalApiError, createBooking, parseBookingInput } from "@/lib/cal-booking";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const LIMIT = 5;
const WINDOW_MS = 10 * 60_000;
/** Hidden form field: humans never fill it in, form-stuffing bots usually do. */
const HONEYPOT_FIELD = "company_website";

/** Book a call on the calendar. Responds 409 when the time was just taken. */
export async function POST(request: Request) {
  const limit = rateLimit(`lp-book:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const honeypot = (body as Record<string, unknown> | null)?.[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    // Pretend it worked so a bot learns nothing, but book nothing.
    return NextResponse.json({ ok: true });
  }

  const input = parseBookingInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Please enter your name and a valid email, and pick a future time." },
      { status: 400 }
    );
  }

  try {
    await createBooking(input);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CalApiError && error.slotTaken) {
      return NextResponse.json(
        { error: "That time was just taken. Please pick another." },
        { status: 409 }
      );
    }
    console.error("[lp/book] booking failed", error instanceof CalApiError ? error.status : error);
    return NextResponse.json(
      { error: "We could not book that time. Please try again." },
      { status: 502 }
    );
  }
}
