/**
 * Cal.com booking for the lead-generation landing page.
 *
 * The page renders its own calendar and talks to our API routes
 * (`/api/lp/slots`, `/api/lp/book`), which call Cal.com's public v2 API here.
 * Both Cal endpoints used below are unauthenticated: they identify the event by
 * username and slug, so there is no API key to protect.
 */

export const CAL_USERNAME = "adnan30";
export const CAL_EVENT_SLUG = "30min";
export const CAL_EVENT_MINUTES = 30;

const CAL_API = "https://api.cal.com/v2";
const SLOTS_API_VERSION = "2024-09-04";
const BOOKINGS_API_VERSION = "2024-08-13";
const REQUEST_TIMEOUT_MS = 10_000;

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RANGE_DAYS = 62;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const DAY_MS = 86_400_000;

/** Available start times (ISO, in the requested time zone), keyed by `YYYY-MM-DD`. */
export type SlotsByDay = Record<string, string[]>;

export type SlotsQuery = { start: string; end: string; timeZone: string };

export type BookingInput = {
  /** Slot start exactly as returned by the slots endpoint. */
  start: string;
  name: string;
  email: string;
  timeZone: string;
};

/** A failed call to Cal.com. `slotTaken` marks the "someone booked it first" case. */
export class CalApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly slotTaken: boolean = false
  ) {
    super(message);
    this.name = "CalApiError";
  }
}

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function dayNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

/** Parse and bound `?start=&end=&timeZone=`; null when anything is off. */
export function parseSlotsQuery(params: URLSearchParams): SlotsQuery | null {
  const start = params.get("start");
  const end = params.get("end");
  const timeZone = params.get("timeZone");
  if (!start || !end || !DATE_KEY.test(start) || !DATE_KEY.test(end)) return null;
  if (!isValidTimeZone(timeZone)) return null;
  if (Number.isNaN(Date.parse(`${start}T00:00:00Z`)) || Number.isNaN(Date.parse(`${end}T00:00:00Z`))) {
    return null;
  }
  const span = dayNumber(end) - dayNumber(start);
  if (span < 0 || span > MAX_RANGE_DAYS) return null;
  return { start, end, timeZone };
}

/** Validate the booking form payload; null when anything is off. */
export function parseBookingInput(body: unknown, now: number = Date.now()): BookingInput | null {
  if (typeof body !== "object" || body === null) return null;
  const { start, name, email, timeZone } = body as Record<string, unknown>;

  if (typeof start !== "string" || Number.isNaN(Date.parse(start)) || Date.parse(start) <= now) {
    return null;
  }
  if (typeof name !== "string" || !name.trim() || name.trim().length > MAX_NAME_LENGTH) return null;
  if (
    typeof email !== "string" ||
    email.trim().length > MAX_EMAIL_LENGTH ||
    !EMAIL_REGEX.test(email.trim())
  ) {
    return null;
  }
  if (!isValidTimeZone(timeZone)) return null;

  return { start, name: name.trim(), email: email.trim(), timeZone };
}

function errorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const error = (payload as { error?: { message?: unknown } }).error;
    if (error && typeof error.message === "string" && error.message) return error.message;
  }
  return fallback;
}

export async function fetchSlots(query: SlotsQuery): Promise<SlotsByDay> {
  const url = new URL(`${CAL_API}/slots`);
  url.searchParams.set("username", CAL_USERNAME);
  url.searchParams.set("eventTypeSlug", CAL_EVENT_SLUG);
  url.searchParams.set("start", query.start);
  url.searchParams.set("end", query.end);
  url.searchParams.set("timeZone", query.timeZone);

  const res = await fetch(url, {
    headers: { "cal-api-version": SLOTS_API_VERSION },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new CalApiError(errorMessage(payload, "Could not load availability."), res.status);

  const data = (payload as { data?: unknown } | null)?.data;
  if (typeof data !== "object" || data === null) {
    throw new CalApiError("Unexpected availability response.", 502);
  }

  const days: SlotsByDay = {};
  for (const [day, slots] of Object.entries(data)) {
    if (!DATE_KEY.test(day) || !Array.isArray(slots)) continue;
    const starts = slots
      .map((slot) => (slot as { start?: unknown } | null)?.start)
      .filter((value): value is string => typeof value === "string");
    if (starts.length > 0) days[day] = starts;
  }
  return days;
}

export async function createBooking(input: BookingInput): Promise<void> {
  const res = await fetch(`${CAL_API}/bookings`, {
    method: "POST",
    headers: { "cal-api-version": BOOKINGS_API_VERSION, "Content-Type": "application/json" },
    body: JSON.stringify({
      start: new Date(input.start).toISOString(),
      eventTypeSlug: CAL_EVENT_SLUG,
      username: CAL_USERNAME,
      attendee: {
        name: input.name,
        email: input.email,
        timeZone: input.timeZone,
        language: "en",
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const payload: unknown = await res.json().catch(() => null);
  if (res.ok) return;

  const message = errorMessage(payload, "Could not book that time.");
  const slotTaken = /not available|unavailable|already|booked|no available/i.test(message);
  throw new CalApiError(message, res.status, slotTaken);
}
