import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import { deriveSchedule, FALLBACK_SCHEDULE } from "@/lib/pavel/workshopSchedule";
import {
  deriveRegistrationWindow,
  FALLBACK_WINDOW,
} from "@/lib/pavel/registrationWindow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public read for the active session's schedule.
 *
 * The landing page is served by the marketing site, which has no database, so
 * it reads the workshop date and time through here rather than from a constant.
 * Public and unauthenticated: this is the same information already printed on
 * the page for anyone to see.
 *
 * Falls back to the constant rather than erroring, so a Zoom or database blip
 * shows a slightly stale date instead of taking the landing page down.
 */
export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({
      ...FALLBACK_SCHEDULE,
      registration: FALLBACK_WINDOW,
    });
  }

  try {
    const session = await getActiveSession(db);
    return NextResponse.json({
      ...deriveSchedule(session?.startsAt, session?.endsAt),
      // Whether seats are on sale, so the landing page can render a closed
      // state instead of a price. Advisory only: the checkout route re-derives
      // this from the database before charging anyone.
      registration: deriveRegistrationWindow(session),
    });
  } catch (error) {
    console.error("[pavel/schedule] lookup failed", error);
    return NextResponse.json({
      ...FALLBACK_SCHEDULE,
      registration: FALLBACK_WINDOW,
    });
  }
}
