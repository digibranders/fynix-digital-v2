import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { verifyProxySecret, hasLocalDb } from "@/lib/admin/gateway";
import {
  mutateReferral,
  queryReferrals,
  type ReferralAction,
} from "@/lib/admin/referrals";

export const runtime = "nodejs";
// Live operator data; never statically rendered or cached.
export const dynamic = "force-dynamic";

/**
 * Internal: manage referral codes.
 *
 * Called server-to-server by the console with the shared secret, never by a
 * browser. The operator's login is checked on the console side; the secret is
 * what authenticates the caller here. A wrong or missing secret gets a bare
 * 404, which tells a prober nothing.
 *
 * This exists so running a partner code, capping it or retiring it is an admin
 * task rather than a database session.
 */

export async function GET(request: Request) {
  if (!verifyProxySecret(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!hasLocalDb() || !getDb()) {
    return NextResponse.json(
      { error: "Database is not configured on this host." },
      { status: 503 }
    );
  }

  try {
    return NextResponse.json({ codes: await queryReferrals() });
  } catch (error) {
    console.error("[admin/data/referrals] list failed", error);
    return NextResponse.json({ error: "Could not load referral codes." }, { status: 500 });
  }
}

const ACTIONS: ReadonlySet<string> = new Set(["create", "update", "toggle", "delete"]);

export async function POST(request: Request) {
  if (!verifyProxySecret(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!getDb()) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { action, ...input } = (body ?? {}) as Record<string, unknown> & {
    action?: string;
  };
  if (!action || !ACTIONS.has(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  // This host has the database, so `mutateReferral` takes its direct path and
  // returns an operator-readable message rather than throwing. Validation lives
  // in there, which is what keeps the rules identical on both sides of the
  // gateway.
  const error = await mutateReferral(action as ReferralAction, input);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
