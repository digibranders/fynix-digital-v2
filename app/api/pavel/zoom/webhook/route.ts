import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Zoom event notifications.
 *
 * Zoom requires a reply within THREE SECONDS or it treats the delivery as
 * failed, so this handler does the minimum: verify, record, acknowledge. The
 * authoritative attendance figures come from the participant report, reconciled
 * by the hourly timer, precisely because Zoom does not guarantee that
 * `participant_left` fires at all.
 *
 * Two things must be handled before any event arrives:
 *
 *  - `endpoint.url_validation`, a challenge Zoom sends when the URL is saved in
 *    the Marketplace. It must be answered with an HMAC of the plain token.
 *  - Signature verification on every request, since this endpoint is public.
 */

/** Reject anything older than this to blunt replay attempts. */
const MAX_SIGNATURE_AGE_MS = 5 * 60_000;

function getSecretToken(): string | null {
  return process.env.ZOOM_WEBHOOK_SECRET_TOKEN || null;
}

/**
 * Zoom signs `v0:{timestamp}:{raw body}` with the app's secret token and sends
 * the result as `x-zm-signature: v0=<hex>`.
 */
function verifySignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  secret: string
): boolean {
  if (!signature || !timestamp) return false;

  const age = Math.abs(Date.now() - Number(timestamp) * 1000);
  if (!Number.isFinite(age) || age > MAX_SIGNATURE_AGE_MS) return false;

  const expected = `v0=${crypto
    .createHmac("sha256", secret)
    .update(`v0:${timestamp}:${rawBody}`)
    .digest("hex")}`;

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface ZoomEvent {
  event?: string;
  payload?: {
    plainToken?: string;
    object?: {
      id?: string | number;
      participant?: {
        registrant_id?: string;
        join_time?: string;
        user_name?: string;
      };
    };
  };
}

export async function POST(request: Request) {
  const secret = getSecretToken();
  if (!secret) {
    console.error("[zoom/webhook] ZOOM_WEBHOOK_SECRET_TOKEN is not configured.");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  // The raw body is needed byte-for-byte: re-serialising parsed JSON would
  // change the bytes and break the signature.
  const rawBody = await request.text();

  let event: ZoomEvent;
  try {
    event = JSON.parse(rawBody) as ZoomEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Challenge sent when the endpoint URL is saved in the Marketplace. It is
  // signed like any other request, so verify first.
  const signature = request.headers.get("x-zm-signature");
  const timestamp = request.headers.get("x-zm-request-timestamp");
  if (!verifySignature(rawBody, signature, timestamp, secret)) {
    console.warn("[zoom/webhook] rejected a request with an invalid signature.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  if (event.event === "endpoint.url_validation") {
    const plainToken = event.payload?.plainToken ?? "";
    return NextResponse.json({
      plainToken,
      encryptedToken: crypto
        .createHmac("sha256", secret)
        .update(plainToken)
        .digest("hex"),
    });
  }

  // Everything below is best-effort bookkeeping. Zoom only needs a 200, and
  // holding the connection open risks the three-second deadline, so failures
  // are logged rather than surfaced.
  try {
    const db = getDb();
    if (db && event.event === "webinar.participant_joined") {
      const registrantId = event.payload?.object?.participant?.registrant_id;
      const joinTime = event.payload?.object?.participant?.join_time;

      if (registrantId) {
        // Record the live signal only. Minutes are deliberately NOT computed
        // here: a join with no matching leave would look like zero attendance,
        // and the report reconciles the real total later.
        //
        // Only the FIRST join is stamped. Zoom fires this event again on every
        // reconnect, so writing unconditionally would keep pushing the time
        // forward and report the last rejoin as the arrival time.
        await db
          .update(registrations)
          .set({ firstJoinedAt: joinTime ? new Date(joinTime) : new Date() })
          .where(
            and(
              eq(registrations.zoomRegistrantId, registrantId),
              isNull(registrations.firstJoinedAt)
            )
          );
      }
    }
  } catch (error) {
    console.error("[zoom/webhook] failed to record event", error);
  }

  return NextResponse.json({ received: true });
}
