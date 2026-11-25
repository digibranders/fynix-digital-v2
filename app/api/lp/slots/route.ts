import { NextResponse } from "next/server";
import { CalApiError, fetchSlots, parseSlotsQuery } from "@/lib/cal-booking";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const LIMIT = 60;
const WINDOW_MS = 60_000;

/** Available call times for a date range, proxied from Cal.com. */
export async function GET(request: Request) {
  const limit = rateLimit(`lp-slots:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const query = parseSlotsQuery(new URL(request.url).searchParams);
  if (!query) {
    return NextResponse.json({ error: "Invalid date range or time zone." }, { status: 400 });
  }

  try {
    const days = await fetchSlots(query);
    return NextResponse.json({ days });
  } catch (error) {
    console.error("[lp/slots] availability lookup failed", error instanceof CalApiError ? error.status : error);
    return NextResponse.json({ error: "Could not load availability." }, { status: 502 });
  }
}
