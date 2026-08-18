import { NextResponse } from "next/server";
import { verifyProxySecret, hasLocalDb } from "@/lib/admin/gateway";
import { queryRegistrations } from "@/lib/admin/registrations";

export const runtime = "nodejs";
// Live operator data; never statically rendered or cached.
export const dynamic = "force-dynamic";

/**
 * Internal: serve every Pavel registration to the admin console.
 *
 * Only the console calls this, server-to-server, carrying the shared secret —
 * never a browser. The operator's login is verified on the console side before
 * the call is made, so this endpoint authenticates the caller (the console),
 * not the person. A wrong or missing secret gets a bare 404, which tells a
 * prober nothing about whether the route exists.
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

  try {
    return NextResponse.json({ rows: await queryRegistrations() });
  } catch (error) {
    console.error("[admin/data/registrations] query failed", error);
    return NextResponse.json(
      { error: "Could not load registrations." },
      { status: 500 }
    );
  }
}
