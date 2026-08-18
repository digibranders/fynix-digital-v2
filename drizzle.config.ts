import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config for the Neon Postgres schema.
 *   npm run db:generate  → create SQL migrations from lib/db/schema.ts
 *   npm run db:push      → push the schema straight to DATABASE_URL (dev)
 */
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
