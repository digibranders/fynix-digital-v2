/**
 * Calendar arithmetic for the console's date pickers.
 *
 * **Everything here is wall-clock.** Nothing converts through a local
 * timezone, and nothing calls `toISOString()`. `Date.UTC` appears only as a
 * calendar calculator — it knows month lengths and leap years — and every
 * value read back out comes from a `getUTC*` accessor, so no offset is ever
 * applied. Going through local time is how a date picked as 19 August is
 * stored as the 18th for anyone west of Greenwich.
 *
 * Shared by `DateTimeField` and `DateField` rather than written twice: two
 * copies of "how long is this month" is exactly the kind of thing that drifts.
 */

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Monday-first, matching how the rest of the world outside the US reads a calendar. */
export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const pad = (n: number) => String(n).padStart(2, "0");

/** A date with no time and no zone. `month` is 0-indexed. */
export type DateParts = { year: number; month: number; day: number };

/** Days in a month. `month` is 0-indexed; day 0 of the next month is the last of this one. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Weekday index of the 1st, Monday-first (0 = Monday, 6 = Sunday). */
export function firstWeekdayIndex(year: number, month: number): number {
  return (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
}

/** Parse `YYYY-MM-DD`. Anything else is null, including a partial value. */
export function parseIsoDate(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d] = match;
  const year = Number(y);
  const month = Number(mo) - 1;
  const day = Number(d);
  // Reject a well-shaped impossibility like 2026-02-31 rather than silently
  // rolling it into March, which is what a Date would do.
  if (month < 0 || month > 11) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/** Render `YYYY-MM-DD`, the shape the filters compare lexicographically. */
export function formatIsoDate(p: DateParts): string {
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`;
}

/** Human-readable, e.g. "19 Aug 2026". */
export function formatDateLabel(p: DateParts): string {
  return `${p.day} ${MONTHS[p.month].slice(0, 3)} ${p.year}`;
}

/** Move a month view by `delta` months, rolling the year over. */
export function shiftMonth(
  view: { year: number; month: number },
  delta: number
): { year: number; month: number } {
  const total = view.year * 12 + view.month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}
