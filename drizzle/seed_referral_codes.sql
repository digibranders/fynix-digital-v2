-- Seed / upsert referral codes (idempotent).
--
-- Run this AFTER the `referral_codes` table exists (via `npm run db:push` or the
-- generated migration). Apply with psql or paste into pgAdmin:
--   psql "$DATABASE_URL" -f drizzle/seed_referral_codes.sql
--
-- Equivalent to `npm run db:seed`; use whichever is convenient.

INSERT INTO "referral_codes" ("code", "discount_percent", "active", "label")
VALUES ('STEVE10', 10, true, 'Steve — 10% partner code')
ON CONFLICT ("code") DO UPDATE
  SET "discount_percent" = EXCLUDED."discount_percent",
      "active"           = EXCLUDED."active",
      "label"            = EXCLUDED."label";
