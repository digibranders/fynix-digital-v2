/**
 * Parsing for the start and end an operator types into the session panel.
 *
 * Shared deliberately. The console reaches the database by two different roads
 * — directly where Postgres is reachable (the droplet, local dev) and through
 * the droplet's internal admin API from Vercel — and both must interpret the
 * operator's input identically. When only one road parsed these, the times were
 * silently dropped on the other, every session was stored with no schedule, and
 * the whole site fell back to the hardcoded date in `workshopDetails`.
 */

export type ParsedSessionTimes = {
  startsAt: Date | null;
  endsAt: Date | null;
  error?: string;
};

/**
 * Read the start and end an operator typed.
 *
 * Both or neither: a start without an end cannot express a session range, and
 * half a schedule would silently mix a real date with a hardcoded time, which
 * reads as correct while being wrong.
 *
 * The inputs are wall-clock (`YYYY-MM-DDTHH:mm`, from the picker, which never
 * applies a zone). They are interpreted as IST, which is where the workshop runs
 * and what the operator is typing.
 */
export function parseSessionTimes(
  startsAt?: string | null,
  endsAt?: string | null
): ParsedSessionTimes {
  const start = typeof startsAt === "string" ? startsAt.trim() : "";
  const end = typeof endsAt === "string" ? endsAt.trim() : "";

  if (!start && !end) return { startsAt: null, endsAt: null };
  if (!start || !end) {
    return {
      startsAt: null,
      endsAt: null,
      error: "Give both a start and an end time, or neither.",
    };
  }

  // Reject anything that is not the exact wall-clock shape before parsing:
  // `new Date("nonsense:00+05:30")` is Invalid Date, but a partial like
  // "2026-08-19" would parse as midnight UTC and store a time nobody chose.
  const SHAPE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!SHAPE.test(start) || !SHAPE.test(end)) {
    return { startsAt: null, endsAt: null, error: "That date or time is not valid." };
  }

  // "+05:30" pins the wall-clock time the operator typed to IST.
  const parsedStart = new Date(`${start}:00+05:30`);
  const parsedEnd = new Date(`${end}:00+05:30`);
  if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
    return { startsAt: null, endsAt: null, error: "That date or time is not valid." };
  }
  if (parsedEnd <= parsedStart) {
    return {
      startsAt: null,
      endsAt: null,
      error: "The end time must be after the start.",
    };
  }
  return { startsAt: parsedStart, endsAt: parsedEnd };
}

/**
 * Render a stored instant as the IST wall-clock string the picker expects
 * (`YYYY-MM-DDTHH:mm`), so an existing schedule can be edited rather than
 * retyped.
 *
 * Formatted through `Intl` in Asia/Kolkata rather than via `toISOString()`,
 * which would hand back UTC and show a 5:00 PM session as 11:30.
 */
export function toIstWallClock(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  // Intl renders midnight as "24" in some runtimes; the picker expects "00".
  const hour = get("hour") === "24" ? "00" : get("hour");

  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}
