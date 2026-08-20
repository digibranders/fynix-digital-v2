/**
 * The calendar day an instant falls on, in IST.
 *
 * The console is an IST console: every timestamp it renders is formatted in
 * Asia/Kolkata, because that is where the workshop runs and where the operator
 * is. Its date FILTERS, though, compared the UTC day, taken by slicing the
 * first ten characters off the stored ISO string. The two disagree for five
 * and a half hours out of every twenty-four.
 *
 * Concretely: a seat registered at 2026-08-18T19:00Z is 19 August in IST and
 * the table shows it as such, but it sliced to "2026-08-18", so "Registered
 * from 19 Aug" hid a row the operator could see was the 19th. Anything taken
 * between 18:30 and midnight UTC was filed under the day before.
 *
 * Formatted through `Intl` rather than by adding 5.5 hours by hand. The offset
 * is correct today and India has not moved its clocks since 1945, but a fixed
 * number in the code is a claim about the future that this does not need to
 * make.
 */

const IST_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * `YYYY-MM-DD` in IST, or null if there is no usable instant.
 *
 * Built from `formatToParts` rather than the formatted string, so it does not
 * depend on the locale's separator staying a hyphen.
 */
export function istDay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const parts = IST_DAY.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  if (!year || !month || !day) return null;

  return `${year}-${month}-${day}`;
}
