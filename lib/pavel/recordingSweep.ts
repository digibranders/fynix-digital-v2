import { and, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { emailLog, registrations } from "@/lib/db/schema";
import { listSessionsWithRecording } from "@/lib/pavel/webinarSession";
import { deliverRecording } from "@/lib/admin/operations";

/**
 * Deliver every published recording to the cohort it belongs to.
 *
 * Deliberately not scoped to the active session. A recording only ever exists
 * for a cohort that has finished, and the finished cohort stops being the
 * active one the moment the operator opens the next: that happens straight
 * after a workshop, while Zoom is still processing. Everything that looked for
 * "the active session's recording" was therefore looking at a cohort that had
 * not run yet, and the people who had just sat through three hours were never
 * sent anything.
 *
 * Dedupe is the `email_log` unique (registration_id, type). This adds no second
 * mechanism: it only avoids walking cohorts that have nothing left to send, so
 * a season's worth of finished sessions does not turn every cron tick into a
 * write attempt per seat that has already been served.
 */

export type RecordingSweepResult = {
  /** Cohorts that still had somebody to send to. */
  sessions: number;
  sent: number;
  skipped: number;
  failed: number;
};

export const EMPTY_SWEEP: RecordingSweepResult = {
  sessions: 0,
  sent: 0,
  skipped: 0,
  failed: 0,
};

/**
 * Paid seats in a session with no `recording_ready` row yet.
 *
 * A left join rather than a NOT IN: the same seat can hold rows for several
 * email types, and NOT IN over an unfiltered `email_log` would exclude anyone
 * who had ever received any email at all.
 */
export async function countSeatsAwaitingRecording(
  db: Db,
  sessionId: string
): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(registrations)
    .leftJoin(
      emailLog,
      and(
        eq(emailLog.registrationId, registrations.id),
        eq(emailLog.type, "recording_ready")
      )
    )
    .where(
      and(
        eq(registrations.status, "paid"),
        eq(registrations.sessionId, sessionId),
        isNull(emailLog.id)
      )
    );

  return Number(row?.count ?? 0);
}

export async function sweepRecordings(
  db: Db
): Promise<RecordingSweepResult> {
  const sessions = await listSessionsWithRecording(db);
  const result: RecordingSweepResult = { ...EMPTY_SWEEP };

  for (const session of sessions) {
    const waiting = await countSeatsAwaitingRecording(db, session.id);
    if (waiting === 0) continue;

    const tally = await deliverRecording(db, session);
    result.sessions += 1;
    result.sent += tally.sent;
    result.skipped += tally.skipped;
    result.failed += tally.failed;

    if (tally.failed > 0) {
      console.error(
        `[pavel/cron] recording sweep: ${tally.failed} failed for ${session.label}`
      );
    }
  }

  return result;
}
