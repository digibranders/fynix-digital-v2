import { type WorkshopSchedule } from "@/lib/pavel/workshopSchedule";



/**
 * Schedule helpers shared by the confirmation, reminder, and post-event emails.
 *
 * The countdown is a DURATION ("in 6 days"), computed at send time — it is
 * timezone-agnostic by design, so it reads correctly for a worldwide audience
 * without per-recipient localisation (which email clients can't do anyway).
 *
 * Neither helper defaults to the fallback schedule any more. They used to, and
 * the templates called them bare, so an email printed the real session's DATE
 * beside the constant's TIME and counted down to the wrong event entirely.
 * Requiring the argument makes that a compile error rather than a wrong email.
 */

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/**
 * Human "in N days / in N hours" label for the time between `now` and the event
 * start. Falls back to "happening now" once the start has passed.
 */
export function countdownLabel(targetIso: string, now: Date = new Date()): string {
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
export function eventTimeLabel(schedule: WorkshopSchedule): string {
  return `${schedule.timeRange} (${schedule.timeUtcLabel})`;
}

/** Reminder types this cron can send, and how to build each email. */
export const REMINDER_TYPES = [
  "reminder_7d",
  "reminder_3d",
  "reminder_1d",
  "reminder_1h",
  "post_event",
] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export function isReminderType(value: string): value is ReminderType {
  return (REMINDER_TYPES as readonly string[]).includes(value);
}

/**
 * Which reminders are due right now, based on the active session's schedule.
 *
 * At most ONE pre-event reminder is returned: the tightest window that applies.
 *
 * Every window stays open until the event starts, so listing all of them meant a
 * buyer who paid inside the last day received the 7-day, 3-day, 1-day and 1-hour
 * emails together on the next cron run — four messages, minutes apart, three of
 * them describing a lead time that had already passed. Someone who buys an hour
 * before the workshop should get one email that says it starts in an hour.
 *
 * This costs nothing for buyers who register early: each window becomes the
 * tightest in turn, so they still receive the full sequence, one at a time. The
 * email_log unique constraint remains the real guarantee that a type sends once,
 * which is also what makes a missed cron run catch up rather than skip.
 */
export function dueReminderTypes(now: Date, schedule: WorkshopSchedule): ReminderType[] {
  const start = new Date(schedule.startUtc).getTime();
  const end = new Date(schedule.endUtc).getTime();
  const t = now.getTime();
  const due: ReminderType[] = [];

  // Ordered widest to tightest; the last match wins.
  const preEvent: Array<[ReminderType, number]> = [
    ["reminder_7d", 7 * MS_PER_DAY],
    ["reminder_3d", 3 * MS_PER_DAY],
    ["reminder_1d", 1 * MS_PER_DAY],
    ["reminder_1h", 1 * MS_PER_HOUR],
  ];

  let tightest: ReminderType | null = null;
  for (const [type, lead] of preEvent) {
    if (t >= start - lead && t < start) tightest = type;
  }
  if (tightest) due.push(tightest);

  // After the event has ended.
  if (t >= end) due.push("post_event");

  return due;
}

