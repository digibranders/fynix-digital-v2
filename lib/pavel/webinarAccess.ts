import { and, asc, eq, isNull, lt, or } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { registrations, type Registration } from "@/lib/db/schema";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import { isZoomConfigured } from "@/lib/zoom/client";
import {
  registerAttendee,
  isPermanentRegistrationFailure,
} from "@/lib/zoom/registrants";

/**
 * Granting webinar access to a paid seat.
 *
 * A buyer receives their own Zoom join link, and only after their payment has
 * been confirmed. That is the whole point: the webinar approves registrants
 * manually, so the API is the only route in, and the API is only ever called
 * from here, on a `paid` registration.
 *
 * Two properties matter, and they are in tension with how invoicing works:
 *
 *  - **Non-fatal.** Zoom being down must not cost a paying buyer their seat or
 *    their invoice. Failures are reported, not thrown.
 *  - **Sparing.** Zoom allows only THREE registration attempts per person per
 *    webinar per day, so unlike invoicing this must NOT retry aggressively. One
 *    attempt per call, and the hourly backfill picks up what failed.
 */

export type GrantAccessResult =
  | { status: "granted"; joinUrl: string }
  | { status: "already_granted"; joinUrl: string }
  | { status: "skipped"; reason: string }
  | { status: "error"; reason: string };

export async function grantWebinarAccess(
  db: Db,
  registrationId: string
): Promise<GrantAccessResult> {
  try {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (!registration) {
      return { status: "error", reason: `Registration ${registrationId} not found.` };
    }
    if (registration.status !== "paid") {
      return {
        status: "skipped",
        reason: `${registration.ref} is ${registration.status}, not paid.`,
      };
    }
    // Already has a link: nothing to do, and re-registering would spend one of
    // the three daily attempts for no reason.
    if (registration.zoomJoinUrl) {
      return { status: "already_granted", joinUrl: registration.zoomJoinUrl };
    }
    if (!isZoomConfigured()) {
      return { status: "skipped", reason: "Zoom is not configured on this host." };
    }

    const session = await getActiveSession(db);
    if (!session) {
      return {
        status: "skipped",
        reason: "No active webinar session; set one in the admin console.",
      };
    }

    // Count the attempt BEFORE calling Zoom. Zoom has already spent one of the
    // three daily slots by the time it answers, so recording it afterwards would
    // lose the count on any crash or timeout and let the retry loop spend the
    // rest.
    await db
      .update(registrations)
      .set({
        zoomAccessAttempts: (registration.zoomAccessAttempts ?? 0) + 1,
        zoomAccessLastAttemptAt: new Date(),
      })
      .where(eq(registrations.id, registration.id));

    const registrant = await registerAttendee(session.zoomWebinarId, {
      name: registration.name,
      email: registration.email,
    });

    await db
      .update(registrations)
      .set({
        sessionId: session.id,
        zoomRegistrantId: registrant.registrantId,
        zoomJoinUrl: registrant.joinUrl,
        zoomRegisteredAt: new Date(),
      })
      .where(eq(registrations.id, registration.id));

    return { status: "granted", joinUrl: registrant.joinUrl };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "zoom registration failed";
    // A permanent failure (webinar over, full, registration disabled) should be
    // loud, because no amount of retrying fixes it and a buyer is left without
    // access.
    if (isPermanentRegistrationFailure(error)) {
      console.error("[pavel/webinar] permanent registration failure:", reason);
    }
    return { status: "error", reason };
  }
}

/**
 * Grant access to any paid seat that still has no join link.
 *
 * Runs from the hourly timer, so a buyer whose registration failed at payment
 * time (Zoom down, no active session yet) is picked up automatically. Ordered
 * by payment time and run sequentially: Zoom's registrant endpoint is rate
 * limited, and there is no benefit to racing it.
 */
/**
 * Attempts to spend before giving up for the day. Zoom's own limit is three;
 * stopping at two keeps one in hand for a deliberate manual retry.
 */
const MAX_ACCESS_ATTEMPTS = 2;

/** Minimum gap between automatic retries for the same seat. */
const ACCESS_RETRY_COOLDOWN_MS = 30 * 60 * 1000;

export async function backfillWebinarAccess(
  db: Db,
  limit = 50
): Promise<{ granted: number; failed: number; skipped: number }> {
  if (!isZoomConfigured()) return { granted: 0, failed: 0, skipped: 0 };

  // Zoom allows THREE registration attempts per person per webinar per day, and
  // this runs every few minutes, so an unqualified retry spends the whole budget
  // within the hour and locks the buyer out until 00:00 GMT. Two guards:
  //
  //   attempts < MAX   leave a slot in reserve for a manual fix
  //   cooldown         space retries out, so a transient Zoom fault gets a
  //                    second chance later rather than three in five minutes
  //
  // A seat that exhausts its attempts stops being retried and stays visible in
  // the admin table with no join link, which is the state an operator needs to
  // see rather than a silent loop.
  const cooldownSince = new Date(Date.now() - ACCESS_RETRY_COOLDOWN_MS);

  const pending: Pick<Registration, "id">[] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(
        eq(registrations.status, "paid"),
        isNull(registrations.zoomJoinUrl),
        lt(registrations.zoomAccessAttempts, MAX_ACCESS_ATTEMPTS),
        or(
          isNull(registrations.zoomAccessLastAttemptAt),
          lt(registrations.zoomAccessLastAttemptAt, cooldownSince)
        )
      )
    )
    .orderBy(asc(registrations.paidAt))
    .limit(limit);

  let granted = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of pending) {
    const result = await grantWebinarAccess(db, row.id);
    if (result.status === "granted") granted += 1;
    else if (result.status === "error") {
      console.error("[pavel/webinar] backfill failed:", result.reason);
      failed += 1;
    } else skipped += 1;
  }

  return { granted, failed, skipped };
}
