import { eq, isNotNull, and } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { registrations, type WebinarSession } from "@/lib/db/schema";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import { isZoomConfigured } from "@/lib/zoom/client";
import { fetchAttendance, looksUnprocessed } from "@/lib/zoom/attendance";

/**
 * Pull attendance from Zoom and record it against the paid seats.
 *
 * The participant report is the authority. Webhooks arrive live but Zoom does
 * not guarantee `participant_left` fires, so a total built only from events
 * would silently under-count. The report is reconciled over the top.
 *
 * Attendance is stored in MINUTES, rounded down: a certificate threshold of "90
 * minutes" should not be met by 89 minutes and 40 seconds.
 */

export type SyncResult =
  | { status: "synced"; matched: number; unmatched: number; absent: number }
  | { status: "not_ready"; reason: string }
  | { status: "skipped"; reason: string }
  | { status: "error"; reason: string };

export async function syncAttendance(
  db: Db,
  session?: WebinarSession
): Promise<SyncResult> {
  try {
    if (!isZoomConfigured()) {
      return { status: "skipped", reason: "Zoom is not configured on this host." };
    }

    const target = session ?? (await getActiveSession(db));
    if (!target) {
      return { status: "skipped", reason: "No active webinar session." };
    }

    // Nothing to sync until the session has finished. Zoom's participant report
    // does not exist for a webinar that has not happened, and asking for it
    // answers "Meeting does not exist" — which this reported as an ERROR on
    // every run. With the cron running every few minutes that is a steady
    // stream of false alarms, and a real failure is indistinguishable from it.
    //
    // Skipping also removes a Zoom API call from every tick in the weeks before
    // an event, where it could never have returned anything.
    if (target.endsAt && Date.now() < target.endsAt.getTime()) {
      return {
        status: "skipped",
        reason: "Session has not ended yet; no attendance report to read.",
      };
    }

    const attendance = await fetchAttendance(target.zoomWebinarId);

    // An empty or all-zero report usually means Zoom has not finished
    // processing. Writing zeros now would mark genuine attendees absent and
    // deny them a certificate, so report it as not-ready and let the caller
    // retry rather than persist a wrong answer.
    if (looksUnprocessed(attendance)) {
      return {
        status: "not_ready",
        reason: `Zoom has ${attendance.size} participant rows and no durations yet.`,
      };
    }

    // Everyone we registered into this webinar and can therefore judge.
    const seats = await db
      .select({
        id: registrations.id,
        zoomRegistrantId: registrations.zoomRegistrantId,
      })
      .from(registrations)
      .where(
        and(
          eq(registrations.status, "paid"),
          isNotNull(registrations.zoomRegistrantId)
        )
      );

    const syncedAt = new Date();
    let matched = 0;
    let absent = 0;

    for (const seat of seats) {
      const record = seat.zoomRegistrantId
        ? attendance.get(seat.zoomRegistrantId)
        : undefined;

      // No record means registered but never joined. That is a real answer, so
      // it is written as 0 rather than left null.
      const minutes = record ? Math.floor(record.totalSeconds / 60) : 0;
      if (record) matched += 1;
      else absent += 1;

      await db
        .update(registrations)
        .set({
          attendedMinutes: minutes,
          firstJoinedAt: record?.firstJoinedAt ?? null,
          attendanceSyncedAt: syncedAt,
        })
        .where(eq(registrations.id, seat.id));
    }

    // Participants Zoom reported that we cannot tie to a buyer. Usually someone
    // who joined by webinar ID instead of their own link, so worth surfacing.
    const knownIds = new Set(seats.map((s) => s.zoomRegistrantId));
    const unmatched = [...attendance.keys()].filter((id) => !knownIds.has(id)).length;

    return { status: "synced", matched, unmatched, absent };
  } catch (error) {
    return {
      status: "error",
      reason: error instanceof Error ? error.message : "attendance sync failed",
    };
  }
}
