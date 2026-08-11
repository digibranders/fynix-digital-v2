import { NextResponse } from "next/server";
import { issueFormToken } from "@/lib/security/honeypot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Issues a fresh, short-lived signed token when the checkout modal opens. The
 * client sends it back on submit so the server can screen out bots (see
 * `lib/security/honeypot.ts`).
 */
export async function GET() {
  return NextResponse.json(
    { token: issueFormToken() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
