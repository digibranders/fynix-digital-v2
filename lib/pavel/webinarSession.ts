import { desc, eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { webinarSessions, type WebinarSession } from "@/lib/db/schema";

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

export async function listSessions(db: Db): Promise<WebinarSession[]> {
  return db
    .select()
    .from(webinarSessions)
    .orderBy(desc(webinarSessions.createdAt));
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
