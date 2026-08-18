import {
  FALLBACK_SCHEDULE,
  type WorkshopSchedule,
} from "@/lib/pavel/workshopSchedule";

/**
 * Schedule helpers shared by the confirmation, reminder, and post-event emails.
 *
 * The countdown is a DURATION ("in 6 days"), computed at send time — it is
 * timezone-agnostic by design, so it reads correctly for a worldwide audience
 * without per-recipient localisation (which email clients can't do anyway).
 */

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/**
 * Human "in N days / in N hours" label for the time between `now` and the event
 * start. Falls back to "happening now" once the start has passed.
 */
export function countdownLabel(
  targetIso: string = FALLBACK_SCHEDULE.startUtc,
  now: Date = new Date()
): string {
  const diffMs = new Date(targetIso).getTime() - now.getTime();
  if (diffMs <= 0) return "happening now";

  const days = Math.floor(diffMs / MS_PER_DAY);
  if (days >= 1) return `in ${days} day${days === 1 ? "" : "s"}`;

  const hours = Math.max(1, Math.floor(diffMs / MS_PER_HOUR));
  return `in ${hours} hour${hours === 1 ? "" : "s"}`;
}

/**
 * Explicit dual-zone time label with the full session range, e.g.
 * "5:00 PM - 8:00 PM IST (11:30 UTC)". Shown in every email so global attendees
 * see both when it starts and how long it runs, and can convert to their zone.
 */
export function eventTimeLabel(
  schedule: WorkshopSchedule = FALLBACK_SCHEDULE
): string {
  return `${schedule.timeRange} (${schedule.timeUtcLabel})`;
}
