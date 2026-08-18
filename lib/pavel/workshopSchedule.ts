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
  if (!timeZone || timeZone === IST) return null;

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
