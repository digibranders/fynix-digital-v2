import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

/**
 * Server-only Postgres client for the Pavel workshop pipeline.
 *
 * Uses the `postgres-js` driver over a standard connection — the same shape as
 * the production DigitalOcean droplet, so local (a Postgres you run yourself)
 * and prod (Postgres on the droplet) match exactly. The connection string lives
 * only in `DATABASE_URL` (never `NEXT_PUBLIC_`), so this module must never be
 * imported into client code.
 *
 * Returns `null` when unconfigured so callers can fail gracefully with a clear
 * error instead of crashing at module load. The client is cached on globalThis
 * so Next.js dev HMR doesn't open a new connection pool on every reload.
 */
export type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __pavelSql?: ReturnType<typeof postgres>;
  __pavelDb?: Db;
};

export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!globalForDb.__pavelDb) {
    // Small pool + idle_timeout so the app releases connections it isn't using —
    // important when sharing a local Postgres with pgAdmin, which itself holds
    // many. Comfortable headroom on a production droplet too.
    globalForDb.__pavelSql ??= postgres(url, { max: 5, idle_timeout: 20 });
    globalForDb.__pavelDb = drizzle(globalForDb.__pavelSql, { schema });
  }
  return globalForDb.__pavelDb;
}
