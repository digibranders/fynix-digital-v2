import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { verifyProxySecret } from "@/lib/admin/gateway";
import {
  resendCertificate,
  resendConfirmation,
  runAttendanceSyncNow,
  sendRecordingToAll,
} from "@/lib/admin/operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Internal: operator actions the console cannot perform itself.
 *
 * The console runs on Vercel, which has no database and no Zoom credentials, so
 * resending an email or pulling attendance has to happen here. Called
 * server-to-server with the shared secret, never from a browser; a wrong or
 * missing secret gets a bare 404, which tells a prober nothing.
 */
export async function POST(request: Request) {
  if (!verifyProxySecret(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ message: "Unavailable." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const { action, ref } = (body ?? {}) as { action?: string; ref?: string };

  try {
    switch (action) {
      case "resend_confirmation": {
        const result = await resendConfirmation(db, ref ?? "");
        return NextResponse.json({ message: result.message }, { status: result.ok ? 200 : 409 });
      }
      case "resend_certificate": {
        const result = await resendCertificate(db, ref ?? "");
        return NextResponse.json({ message: result.message }, { status: result.ok ? 200 : 409 });
      }
      case "send_recording": {
        const result = await sendRecordingToAll(db);
        return NextResponse.json({ message: result.message }, { status: result.ok ? 200 : 409 });
      }
      case "sync_attendance": {
        const result = await runAttendanceSyncNow(db);
        return NextResponse.json({ message: result.message }, { status: result.ok ? 200 : 409 });
      }
      default:
        return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    console.error("[admin/data/operations] failed", error);
    return NextResponse.json({ message: "Operation failed." }, { status: 500 });
  }
}
