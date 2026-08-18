import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";
// Always evaluated live; never cached.
export const dynamic = "force-dynamic";

/**
 * Liveness + readiness probe for the droplet API.
 *
 * Returns 200 when the process is up AND Postgres answers a trivial query;
 * returns 503 when the database is unreachable, so a deploy or uptime monitor
 * fails on a broken DB connection, not just a booted process.
 *
 * `integrations` reports which external services are wired as booleans only,
 * never secrets, so an operator can spot "payments not configured" at a glance.
 */
export async function GET() {
  const time = new Date().toISOString();
  const db = getDb();

  let dbState: "up" | "down" | "unconfigured" = db ? "down" : "unconfigured";
  if (db) {
    try {
      await db.execute(sql`SELECT 1`);
      dbState = "up";
    } catch {
      dbState = "down";
    }
  }

  const healthy = dbState === "up";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      db: dbState,
      integrations: {
        razorpay: Boolean(
          process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
        ),
        brevo: Boolean(process.env.BREVO_API_KEY),
      },
      time,
    },
    { status: healthy ? 200 : 503 }
  );
}
