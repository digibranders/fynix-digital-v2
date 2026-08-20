import { getDb } from "@/lib/db/client";
import {
  AdminGatewayError,
  adminGatewayFetch,
  hasLocalDb,
} from "@/lib/admin/gateway";
import {
  listSessionsWithCounts,
  createSession,
  activateSession,
  deleteSession,
  setRegistrationsClosed,
  setRegistrationsCloseAt,
  setRecordingUrl,
  setWhatsappGroupUrl,
  updateSessionTimes,
  normalizeWebinarId,
} from "@/lib/pavel/webinarSession";
import { parseSessionCloseAt, parseSessionTimes } from "@/lib/pavel/sessionTimes";
import { resolveRecordingInput } from "@/lib/pavel/recordingLink";
import { resolveWhatsappGroupInput } from "@/lib/pavel/whatsappGroupLink";
import { isUniqueViolation } from "@/lib/admin/dbErrors";

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
  /**
   * When this session stops taking registrations on its own, if a cutoff is
   * set. The console derives the live open/closed state from it rather than
   * trusting `registrationsClosed` alone, exactly as the checkout route does.
   */
  registrationsCloseAt: string | null;
  /**
   * This cohort's WhatsApp community invite. Null means the session falls back
   * to the built-in link, which is what the panel says in place of a value.
   */
  whatsappGroupUrl: string | null;
  /** Zoom share link for this session's recording, once published. */
  recordingUrl: string | null;
  /** Passcode Zoom asks for on that link, when one is set. */
  recordingPasscode: string | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  /**
   * Seats sold into this session. Drives whether it can be deleted: a cohort
   * that sold anything is a business record, and deleting it would orphan those
   * rows from the workshop they belong to.
   */
  registrationCount: number;
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
      const sessions = await listSessionsWithCounts(db);
      return {
        sessions: sessions.map((s) => ({
          id: s.id,
          zoomWebinarId: s.zoomWebinarId,
          label: s.label,
          active: s.active,
          registrationsClosed: s.registrationsClosed,
          registrationsCloseAt: s.registrationsCloseAt
            ? s.registrationsCloseAt.toISOString()
            : null,
          whatsappGroupUrl: s.whatsappGroupUrl,
          recordingUrl: s.recordingUrl,
          recordingPasscode: s.recordingPasscode,
          startsAt: s.startsAt ? s.startsAt.toISOString() : null,
          endsAt: s.endsAt ? s.endsAt.toISOString() : null,
          createdAt: s.createdAt.toISOString(),
          registrationCount: s.registrationCount,
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
    return {
      // The console and the droplet are deployed separately, so the droplet can
      // be a build behind and answer without a field this one expects. Pinning
      // the cutoff to null in that case keeps the row honest about its own type
      // rather than leaving an `undefined` the panel has been told is a string.
      sessions: sessions.map((session) => ({
        ...session,
        registrationsCloseAt:
          typeof session.registrationsCloseAt === "string"
            ? session.registrationsCloseAt
            : null,
        whatsappGroupUrl:
          typeof session.whatsappGroupUrl === "string"
            ? session.whatsappGroupUrl
            : null,
      })),
      error: null,
    };
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
  action:
    | "create"
    | "activate"
    | "close"
    | "reopen"
    | "scheduleClose"
    | "update"
    | "delete"
    | "recording"
    | "whatsapp",
  input: {
    zoomWebinarId?: string;
    label?: string;
    sessionId?: string;
    startsAt?: string;
    endsAt?: string;
    closeAt?: string;
    whatsappGroupUrl?: string;
    recordingUrl?: string;
    recordingPasscode?: string;
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
      if (action === "scheduleClose") {
        const parsed = parseSessionCloseAt(input.closeAt);
        if (parsed.error) return parsed.error;
        const session = await setRegistrationsCloseAt(
          db,
          input.sessionId,
          parsed.closeAt
        );
        return session ? null : "Session not found.";
      }
      if (action === "whatsapp") {
        // Refuses anything that is not a chat.whatsapp.com invite: this link is
        // mailed to every buyer, and the likely mistake is the public support
        // number, which would put the whole cohort in a one-to-one chat.
        const resolved = resolveWhatsappGroupInput(input.whatsappGroupUrl ?? "");
        if (!resolved.ok) return resolved.error;
        const session = await setWhatsappGroupUrl(db, input.sessionId, resolved.url);
        return session ? null : "Session not found.";
      }
      if (action === "recording") {
        // Splits Zoom's share block into link and passcode, and refuses
        // anything with no http(s) URL in it rather than storing it: this value
        // is emailed to every buyer, so a typo becomes a dead link in someone's
        // inbox that nobody sees until they complain.
        const resolved = resolveRecordingInput(
          input.recordingUrl ?? "",
          input.recordingPasscode ?? ""
        );
        if (!resolved.ok) return resolved.error;
        await setRecordingUrl(
          db,
          input.sessionId,
          resolved.url,
          resolved.passcode
        );
        return null;
      }
      if (action === "delete") {
        const result = await deleteSession(db, input.sessionId);
        return result.deleted ? null : (result.reason ?? "Could not delete.");
      }
      if (action === "close" || action === "reopen") {
        await setRegistrationsClosed(db, input.sessionId, action === "close");
        return null;
      }
      await activateSession(db, input.sessionId);
      return null;
    } catch (error) {
      // A duplicate webinar id is an operator mistake worth naming, not a
      // generic failure. Matching on `error.message` never fired: Drizzle's own
      // message is the SQL that failed, and the constraint sits on `cause`.
      if (isUniqueViolation(error)) {
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
