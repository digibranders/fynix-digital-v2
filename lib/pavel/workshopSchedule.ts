import { WORKSHOP } from "@/components/pavel/workshopDetails";

/**
 * When the workshop actually runs.
 *
 * The webinar a buyer joins is data (see webinar_sessions), so its schedule must
 * be too: otherwise opening a second cohort means editing a constant and
 * deploying, and the reminder emails fire against the wrong event entirely.
 *
 * Every label is DERIVED from the start and end instants rather than stored, so
 * a date and its written form can never disagree. The constant in
 * workshopDetails remains the fallback for when no session defines a time.
 */

export interface WorkshopSchedule {
  /** ISO instants. The source of truth; every label below derives from them. */
  startUtc: string;
  endUtc: string;
  /** "5 September 2026" */
  dateLabel: string;
  /** "5:00 PM IST" */
  time: string;
  /** "5:00 PM - 8:00 PM IST" */
  timeRange: string;
  /** "11:30 UTC" */
  timeUtcLabel: string;
}

const IST = "Asia/Kolkata";
/** Zones that ARE the workshop's own, including the alias older systems report. */
const IST_ZONES = new Set([IST, "Asia/Calcutta"]);

function istDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: IST,
  }).format(value);
}

function istTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  })
    .format(value)
    .replace(/\s/g, " ");
}

function utcTime(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(value);
}

/** The schedule baked into the code, used when a session defines no times. */
export const FALLBACK_SCHEDULE: WorkshopSchedule = {
  startUtc: WORKSHOP.startUtc,
  endUtc: WORKSHOP.endUtc,
  dateLabel: WORKSHOP.dateLabel,
  time: WORKSHOP.time,
  timeRange: WORKSHOP.timeRange,
  timeUtcLabel: WORKSHOP.timeUtcLabel,
};

/**
 * Build a schedule from a session's start and end.
 *
 * Both are required: a start without an end cannot express a range, and a
 * half-derived schedule that silently mixes a real date with a hardcoded time
 * would be worse than falling back cleanly.
 */
export function deriveSchedule(
  startsAt: Date | null | undefined,
  endsAt: Date | null | undefined
): WorkshopSchedule {
  if (!startsAt || !endsAt) return FALLBACK_SCHEDULE;

  return {
    startUtc: startsAt.toISOString(),
    endUtc: endsAt.toISOString(),
    dateLabel: istDate(startsAt),
    time: `${istTime(startsAt)} IST`,
    timeRange: `${istTime(startsAt)} - ${istTime(endsAt)} IST`,
    timeUtcLabel: `${utcTime(startsAt)} UTC`,
  };
}

/**
 * The session expressed in a viewer's own timezone.
 *
 * A buyer in Chicago should not have to convert "5:00 PM IST (11:30 UTC)" in
 * their head, and getting it wrong means missing a workshop they paid for. The
 * offset is what people mis-read, so show the wall-clock time instead.
 *
 * Returns null when the zone matches the workshop's own, where a second line
 * would just repeat the first.
 */
export function localTimeLabel(
  schedule: WorkshopSchedule,
  timeZone: string | null | undefined
): { range: string; dateLabel: string; zoneLabel: string } | null {
  // The whole alias set, not just the canonical name. "Asia/Calcutta" is what
  // many browsers still report, and matching only "Asia/Kolkata" showed Indian
  // readers a second line repeating the first in different words.
  if (!timeZone || IST_ZONES.has(timeZone)) return null;

  const start = new Date(schedule.startUtc);
  const end = new Date(schedule.endUtc);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  try {
    const time = (value: Date) =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
      }).format(value);

    // The short zone name, e.g. "CDT". Far more recognisable than an offset.
    const zoneLabel =
      new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
        .formatToParts(start)
        .find((part) => part.type === "timeZoneName")?.value ?? "";

    return {
      range: `${time(start)} - ${time(end)}`,
      // Their date can differ from the workshop's: 5:00 PM IST is still the
      // previous day in much of the Americas.
      dateLabel: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone,
      }).format(start),
      zoneLabel,
    };
  } catch {
    // An unknown zone should never take the confirmation page down.
    return null;
  }
}

/**
 * The same session, expressed in a viewer's own timezone.
 *
 * Returns the identical shape as the IST schedule so callers can swap one for
 * the other with no other change: every label is re-derived from the same two
 * instants, which is why the date and the time can never drift apart.
 *
 * Unlike `localTimeLabel`, this never returns null. It is the page's only
 * clock, so there has to be an answer for every viewer; a zone matching the
 * workshop's simply reproduces the IST labels.
 */
export function scheduleInZone(
  schedule: WorkshopSchedule,
  timeZone: string | null | undefined
): WorkshopSchedule {
  // "Asia/Calcutta" is the legacy alias many systems still report, so matching
  // only the canonical name would show Indian viewers "GMT+5:30" instead of IST.
  if (!timeZone || IST_ZONES.has(timeZone)) return schedule;

  const start = new Date(schedule.startUtc);
  const end = new Date(schedule.endUtc);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return schedule;

  try {
    const time = (value: Date) =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
      })
        .format(value)
        .replace(/\s/g, " ");

    const zoneLabel = shortZoneLabel(start, timeZone);

    return {
      ...schedule,
      // The viewer's calendar date, which can differ from the workshop's:
      // 5:00 PM IST is still the previous day across much of the Americas.
      dateLabel: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone,
      }).format(start),
      time: `${time(start)} ${zoneLabel}`.trim(),
      timeRange: `${time(start)} - ${time(end)} ${zoneLabel}`.trim(),
    };
  } catch {
    // An unrecognised zone must never take the landing page down; showing the
    // workshop's own time is a correct answer, just not a personalised one.
    return schedule;
  }
}

/** e.g. "EDT". Far more recognisable than a raw offset. */
function shortZoneLabel(at: Date, timeZone: string): string {
  const label =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
      .formatToParts(at)
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  // Intl has no short name for India and renders the offset; use the name
  // everyone there actually recognises.
  return label === "GMT+5:30" ? "IST" : label;
}
