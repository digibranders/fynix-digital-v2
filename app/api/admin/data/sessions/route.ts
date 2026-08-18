import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { verifyProxySecret, hasLocalDb } from "@/lib/admin/gateway";
import {
  listSessions,
  createSession,
  activateSession,
  normalizeWebinarId,
} from "@/lib/pavel/webinarSession";

export const runtime = "nodejs";
// Live operator data; never statically rendered or cached.
export const dynamic = "force-dynamic";

/**
 * Internal: manage the Zoom webinar sessions the console offers.
 *
 * Called server-to-server by the console with the shared secret, never by a
 * browser. The operator's login is checked on the console side; the secret is
 * what authenticates the caller here. A wrong or missing secret gets a bare
 * 404, which tells a prober nothing.
 *
 * This exists so running a test session or a new cohort is an admin task rather
 * than a code change: the active webinar is data, not a constant.
 */

export async function GET(request: Request) {
  if (!verifyProxySecret(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!hasLocalDb()) {
    return NextResponse.json(
      { error: "Database is not configured on this host." },
      { status: 503 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  try {
    const sessions = await listSessions(db);
    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        zoomWebinarId: session.zoomWebinarId,
        label: session.label,
        active: session.active,
        startsAt: session.startsAt ? session.startsAt.toISOString() : null,
        createdAt: session.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[admin/data/sessions] list failed", error);
    return NextResponse.json({ error: "Could not load sessions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyProxySecret(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { action, zoomWebinarId, label, sessionId } = (body ?? {}) as {
    action?: string;
    zoomWebinarId?: string;
    label?: string;
    sessionId?: string;
  };

  try {
    if (action === "create") {
      const normalised = normalizeWebinarId(zoomWebinarId ?? "");
      // Zoom webinar ids are 9 to 11 digits. Rejecting here means an operator
      // who pastes something wrong is told immediately, rather than every
      // buyer's registration failing silently later.
      if (normalised.length < 9 || normalised.length > 11) {
        return NextResponse.json(
          { error: "That does not look like a Zoom webinar ID (9 to 11 digits)." },
          { status: 400 }
        );
      }
      if (!label?.trim()) {
        return NextResponse.json({ error: "A label is required." }, { status: 400 });
      }

      const session = await createSession(db, {
        zoomWebinarId: normalised,
        label,
      });
      return NextResponse.json({ session: { id: session.id } }, { status: 201 });
    }

    if (action === "activate") {
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
      }
      const session = await activateSession(db, sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
      }
      return NextResponse.json({ session: { id: session.id, active: session.active } });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    // A duplicate webinar id is an operator mistake worth naming, not a 500.
    const message = error instanceof Error ? error.message : "";
    if (/duplicate key|unique constraint/i.test(message)) {
      return NextResponse.json(
        { error: "That webinar is already registered as a session." },
        { status: 409 }
      );
    }
    console.error("[admin/data/sessions] action failed", error);
    return NextResponse.json({ error: "Could not update sessions." }, { status: 500 });
  }
}
