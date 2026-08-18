import { getDb } from "@/lib/db/client";
import { getActiveSession } from "@/lib/pavel/webinarSession";
import {
  deriveSchedule,
  FALLBACK_SCHEDULE,
  type WorkshopSchedule,
} from "@/lib/pavel/workshopSchedule";

/**
 * The active session's schedule, from wherever the data lives.
 *
 * Reads Postgres directly where it is reachable (the droplet, the cron, local
 * dev) and otherwise asks the droplet's public schedule endpoint, which is what
 * the marketing site does since it has no database.
 *
 * Never throws and never returns nothing: a failure falls back to the constant,
 * because showing a slightly stale date is far better than failing to render the
 * page a buyer is trying to pay on.
 */
export async function loadSchedule(): Promise<WorkshopSchedule> {
  const db = getDb();

  if (db) {
    try {
      const session = await getActiveSession(db);
      return deriveSchedule(session?.startsAt, session?.endsAt);
    } catch (error) {
      console.error("[pavel/schedule] database lookup failed", error);
      return FALLBACK_SCHEDULE;
    }
  }

  const origin = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
  if (!origin) return FALLBACK_SCHEDULE;

  try {
    const response = await fetch(`${origin}/api/pavel/schedule`, {
      // Short cache: the schedule changes rarely, but a cohort switch should
      // reach the page without waiting for a deploy.
      next: { revalidate: 60 },
    });
    if (!response.ok) return FALLBACK_SCHEDULE;

    const payload = (await response.json()) as Partial<WorkshopSchedule>;
    if (typeof payload?.startUtc !== "string" || typeof payload?.dateLabel !== "string") {
      return FALLBACK_SCHEDULE;
    }
    return { ...FALLBACK_SCHEDULE, ...payload };
  } catch (error) {
    console.error("[pavel/schedule] remote lookup failed", error);
    return FALLBACK_SCHEDULE;
  }
}
