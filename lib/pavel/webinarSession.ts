import { desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  registrations,
  webinarSessions,
  type WebinarSession,
} from "@/lib/db/schema";

/**
 * The webinar new registrations are sold into.
 *
 * Held in the database rather than an env var or a constant so an operator can
 * stand up a test session or a new cohort from the admin console without a
 * deploy. Marking a session active supersedes the previous one; the most
 * recently activated wins, so flipping the switch is all it takes.
 */
export async function getActiveSession(
  db: Db
): Promise<WebinarSession | undefined> {
  const [session] = await db
    .select()
    .from(webinarSessions)
    .where(eq(webinarSessions.active, true))
    .orderBy(desc(webinarSessions.activatedAt))
    .limit(1);
  return session;
}

/**
 * Open or close a session to new registrations.
 *
 * Scoped to one session rather than global so closing a finished cohort cannot
 * accidentally suppress the next one: activating a fresh session opens sales
 * again on its own, because the flag travels with the session it describes.
 */
export async function setRegistrationsClosed(
  db: Db,
  sessionId: string,
  closed: boolean
): Promise<WebinarSession | undefined> {
  const [session] = await db
    .update(webinarSessions)
    .set({ registrationsClosed: closed })
    .where(eq(webinarSessions.id, sessionId))
    .returning();
  return session;
}

/**
 * Set (or clear) when a session runs.
 *
 * Separate from `createSession` because a schedule is routinely decided, or
 * corrected, after the webinar exists — a cohort is created from the Zoom id
 * long before the slot is confirmed. Without this the times could only ever be
 * chosen at creation, so a session that was stored without them could never be
 * given any, and every page, email and reminder would keep quoting the built-in
 * fallback date.
 *
 * Both values move together: `deriveSchedule` needs the pair, so a half-set
 * schedule would silently fall back while looking configured.
 */
export async function updateSessionTimes(
  db: Db,
  sessionId: string,
  times: { startsAt: Date | null; endsAt: Date | null }
): Promise<WebinarSession | undefined> {
  const [session] = await db
    .update(webinarSessions)
    .set({ startsAt: times.startsAt, endsAt: times.endsAt })
    .where(eq(webinarSessions.id, sessionId))
    .returning();
  return session;
}

export async function listSessions(db: Db): Promise<WebinarSession[]> {
  return db
    .select()
    .from(webinarSessions)
    .orderBy(desc(webinarSessions.createdAt));
}

/**
 * Sessions with the number of seats sold into each.
 *
 * The count is what tells an operator whether a session can be removed, so it
 * is fetched with the list rather than left for the delete to discover: a
 * button that fails when pressed is worse than one that explains itself.
 */
export async function listSessionsWithCounts(
  db: Db
): Promise<Array<WebinarSession & { registrationCount: number }>> {
  const rows = await db
    .select({
      session: webinarSessions,
      registrationCount: sql<number>`count(${registrations.id})`,
    })
    .from(webinarSessions)
    .leftJoin(registrations, eq(registrations.sessionId, webinarSessions.id))
    .groupBy(webinarSessions.id)
    .orderBy(desc(webinarSessions.createdAt));

  return rows.map((r) => ({
    ...r.session,
    registrationCount: Number(r.registrationCount),
  }));
}

/** Zoom webinar ids are numeric; strip the spaces operators paste from the UI. */
export function normalizeWebinarId(value: string): string {
  return value.replace(/\D/g, "");
}

export async function createSession(
  db: Db,
  input: {
    zoomWebinarId: string;
    label: string;
    startsAt?: Date | null;
    endsAt?: Date | null;
  }
): Promise<WebinarSession> {
  const [session] = await db
    .insert(webinarSessions)
    .values({
      zoomWebinarId: normalizeWebinarId(input.zoomWebinarId),
      label: input.label.trim(),
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
    })
    .returning();
  return session;
}

/**
 * Make one session the active one, deactivating the rest in the same
 * transaction so there is never a moment with two live sessions.
 */
export async function activateSession(
  db: Db,
  sessionId: string
): Promise<WebinarSession | undefined> {
  return db.transaction(async (tx) => {
    await (tx as Db)
      .update(webinarSessions)
      .set({ active: false })
      .where(eq(webinarSessions.active, true));

    const [session] = await (tx as Db)
      .update(webinarSessions)
      .set({ active: true, activatedAt: new Date() })
      .where(eq(webinarSessions.id, sessionId))
      .returning();

    return session;
  });
}

/**
 * Remove a session that was never used.
 *
 * Deliberately refuses in two cases rather than doing what was asked:
 *
 *   active            deleting it would stop sales with nothing to fall back on
 *   has registrations `registrations.session_id` is ON DELETE SET NULL, so the
 *                     rows would survive with no cohort attached — invoices and
 *                     certificates would still exist while the record of which
 *                     workshop they were for quietly disappeared
 *
 * So this is for tidying mistakes: a mistyped webinar id, a session created and
 * superseded before anyone bought. A cohort that sold seats is a business
 * record and stays.
 */
export async function deleteSession(
  db: Db,
  sessionId: string
): Promise<{ deleted: boolean; reason?: string }> {
  const [session] = await db
    .select()
    .from(webinarSessions)
    .where(eq(webinarSessions.id, sessionId))
    .limit(1);

  if (!session) return { deleted: false, reason: "Session not found." };
  if (session.active) {
    return {
      deleted: false,
      reason: "This session is active. Activate another one first.",
    };
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(registrations)
    .where(eq(registrations.sessionId, sessionId));

  if (Number(count) > 0) {
    return {
      deleted: false,
      reason: `${count} registration(s) belong to this session, so it cannot be deleted.`,
    };
  }

  await db.delete(webinarSessions).where(eq(webinarSessions.id, sessionId));
  return { deleted: true };
}
