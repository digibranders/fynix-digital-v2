import { getDb } from "@/lib/db/client";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import {
  deriveSchedule,
  FALLBACK_SCHEDULE,
  type WorkshopSchedule,
} from "@/lib/pavel/workshopSchedule";
import {
  deriveRegistrationWindow,
  FALLBACK_WINDOW,
  parseRegistrationWindow,
  type RegistrationWindow,
} from "@/lib/pavel/registrationWindow";

/** Everything about the active session the public pages need to render. */
export type WorkshopState = {
  schedule: WorkshopSchedule;
  registration: RegistrationWindow;
};

const FALLBACK_STATE: WorkshopState = {
  schedule: FALLBACK_SCHEDULE,
  registration: FALLBACK_WINDOW,
};

/**
 * The active session's schedule and whether it is selling, from wherever the
 * data lives.
 *
 * Reads Postgres directly where it is reachable (the droplet, the cron, local
 * dev) and otherwise asks the droplet's public endpoint, which is what the
 * marketing site does since it has no database. Both values come from the same
 * lookup so the page cannot show one cohort's date beside another's status.
 *
 * Never throws and never returns nothing: a failure falls back to the constant,
 * because showing a slightly stale date is far better than failing to render the
 * page a buyer is trying to pay on. The registration window falling back to
 * "open" is safe because the checkout route re-derives it before charging;
 * see FALLBACK_WINDOW.
 */
export async function loadWorkshopState(): Promise<WorkshopState> {
  const db = getDb();

  if (db) {
    try {
      const session = await getActiveSession(db);
      return {
        schedule: deriveSchedule(session?.startsAt, session?.endsAt),
        registration: deriveRegistrationWindow(session),
      };
    } catch (error) {
      console.error("[pavel/schedule] database lookup failed", error);
      return FALLBACK_STATE;
    }
  }

  const origin = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
  if (!origin) return FALLBACK_STATE;

  try {
    const response = await fetch(`${origin}/api/pavel/schedule`, {
      // Short cache: the schedule changes rarely, but a cohort switch or a
      // close should reach the page without waiting for a deploy.
      next: { revalidate: 60 },
    });
    if (!response.ok) return FALLBACK_STATE;

    const payload = (await response.json()) as Partial<WorkshopSchedule> & {
      registration?: unknown;
    };
    if (typeof payload?.startUtc !== "string" || typeof payload?.dateLabel !== "string") {
      return FALLBACK_STATE;
    }

    const { registration, ...schedule } = payload;
    return {
      schedule: { ...FALLBACK_SCHEDULE, ...schedule },
      registration: parseRegistrationWindow(registration),
    };
  } catch (error) {
    console.error("[pavel/schedule] remote lookup failed", error);
    return FALLBACK_STATE;
  }
}

/**
 * The schedule alone, for callers that do not care whether seats are on sale
 * (invoices, certificates, the reminder scheduler).
 */
export async function loadSchedule(): Promise<WorkshopSchedule> {
  return (await loadWorkshopState()).schedule;
}
