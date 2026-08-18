import { getDb } from "@/lib/db/client";
import {
  AdminGatewayError,
  adminGatewayFetch,
  hasLocalDb,
} from "@/lib/admin/gateway";
import {
  listSessions,
  createSession,
  activateSession,
  setRegistrationsClosed,
  updateSessionTimes,
  normalizeWebinarId,
} from "@/lib/pavel/webinarSession";
import { parseSessionTimes } from "@/lib/pavel/sessionTimes";

/**
 * Webinar sessions, as the console sees them.
 *
 * Same split as registrations: where a database is reachable (the droplet and
 * local dev) this talks to Postgres directly; on Vercel it goes through the
 * droplet's internal admin API.
 */

export type AdminSessionRow = {
  id: string;
  zoomWebinarId: string;
  label: string;
  active: boolean;
  /** Whether this session is refusing new registrations. */
  registrationsClosed: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
};

export const SESSIONS_DATA_PATH = "/api/admin/data/sessions";

export type LoadSessionsResult = {
  sessions: AdminSessionRow[];
  error: string | null;
};

function isSessionRow(value: unknown): value is AdminSessionRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.zoomWebinarId === "string" &&
    typeof row.label === "string" &&
    typeof row.active === "boolean"
  );
}

export async function loadSessions(): Promise<LoadSessionsResult> {
  if (hasLocalDb()) {
    try {
      const db = getDb();
      if (!db) throw new Error("no database");
      const sessions = await listSessions(db);
      return {
        sessions: sessions.map((s) => ({
          id: s.id,
          zoomWebinarId: s.zoomWebinarId,
          label: s.label,
          active: s.active,
          registrationsClosed: s.registrationsClosed,
          startsAt: s.startsAt ? s.startsAt.toISOString() : null,
          endsAt: s.endsAt ? s.endsAt.toISOString() : null,
          createdAt: s.createdAt.toISOString(),
        })),
        error: null,
      };
    } catch (error) {
      console.error("[admin] failed to query sessions", error);
      return { sessions: [], error: "Could not load webinar sessions." };
    }
  }

  try {
    const response = await adminGatewayFetch(SESSIONS_DATA_PATH);
    if (!response.ok) {
      return {
        sessions: [],
        error: `Could not reach the sessions service (HTTP ${response.status}).`,
      };
    }
    const payload: unknown = await response.json();
    const sessions =
      typeof payload === "object" && payload !== null
        ? (payload as { sessions?: unknown }).sessions
        : undefined;

    if (!Array.isArray(sessions) || !sessions.every(isSessionRow)) {
      return { sessions: [], error: "The sessions service returned unexpected data." };
    }
    return { sessions, error: null };
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      return {
        sessions: [],
        error: "The admin console is not connected to its data service.",
      };
    }
    console.error("[admin] sessions gateway request failed", error);
    return { sessions: [], error: "Could not reach the sessions service." };
  }
}

/** Perform a session action wherever the data lives. Returns an error message or null. */
export async function mutateSession(
  action: "create" | "activate" | "close" | "reopen" | "update",
  input: {
    zoomWebinarId?: string;
    label?: string;
    sessionId?: string;
    startsAt?: string;
    endsAt?: string;
  }
): Promise<string | null> {
  if (hasLocalDb()) {
    const db = getDb();
    if (!db) return "Database is not configured.";
    try {
      if (action === "create") {
        const normalised = normalizeWebinarId(input.zoomWebinarId ?? "");
        if (normalised.length < 9 || normalised.length > 11) {
          return "That does not look like a Zoom webinar ID (9 to 11 digits).";
        }
        if (!input.label?.trim()) return "A label is required.";
        const times = parseSessionTimes(input.startsAt, input.endsAt);
        if (times.error) return times.error;
        await createSession(db, {
          zoomWebinarId: normalised,
          label: input.label,
          startsAt: times.startsAt,
          endsAt: times.endsAt,
        });
        return null;
      }
      if (!input.sessionId) return "sessionId is required.";
      if (action === "update") {
        const times = parseSessionTimes(input.startsAt, input.endsAt);
        if (times.error) return times.error;
        const session = await updateSessionTimes(db, input.sessionId, {
          startsAt: times.startsAt,
          endsAt: times.endsAt,
        });
        return session ? null : "Session not found.";
      }
      if (action === "close" || action === "reopen") {
        await setRegistrationsClosed(db, input.sessionId, action === "close");
        return null;
      }
      await activateSession(db, input.sessionId);
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/duplicate key|unique constraint/i.test(message)) {
        return "That webinar is already registered as a session.";
      }
      console.error("[admin] session action failed", error);
      return "Could not update sessions.";
    }
  }

  try {
    const response = await adminGatewayFetch(SESSIONS_DATA_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...input }),
    });
    if (response.ok) return null;

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    return payload.error ?? `Could not update sessions (HTTP ${response.status}).`;
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      return "The admin console is not connected to its data service.";
    }
    console.error("[admin] session mutation failed", error);
    return "Could not reach the sessions service.";
  }
}
