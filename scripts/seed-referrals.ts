/**
 * Seed / upsert referral codes.
 *
 *   npm run db:seed
 *
 * Idempotent: re-running updates the discount/label for an existing code rather
 * than erroring on the unique constraint. Requires DATABASE_URL (loaded from
 * your environment or .env). Run AFTER the schema is in place (`npm run db:push`
 * or applying the generated migration).
 *
 * Codes are managed from the console at /admin/pavel — this script exists to
 * bootstrap a fresh database, not as the day-to-day tool. It sets no cap, no
 * expiry and no owner, so a seeded code is unlimited until an operator says
 * otherwise.
 */
import { getDb } from "@/lib/db/client";
import { referralCodes } from "@/lib/db/schema";
import { normalizeReferralCode } from "@/components/pavel/pricing";

// Load DATABASE_URL from .env when available (Node 20.12+). Harmless if the
// file is absent or the env already comes from the shell. getDb() reads
// process.env lazily, so this runs before any connection is opened.
try {
  process.loadEnvFile?.();
} catch {
  /* .env optional — fall back to the ambient environment */
}

/**
 * Codes to ensure exist. Empty on purpose.
 *
 * Every deploy runs this script, so anything listed here comes back after it is
 * deleted. The test codes were cleared before launch to make room for the real
 * partner codes, and a seeded one reappearing on the next deploy would put a
 * live discount back in circulation that nobody chose to offer.
 *
 * Codes are created in the console at /admin/pavel. Add a row here only for one
 * that must survive a rebuild from an empty database.
 */
const SEED: ReadonlyArray<{ code: string; discountPercent: number; label: string }> = [];

async function main() {
  const db = getDb();
  if (!db) {
    console.error("DATABASE_URL is not set — cannot seed referral codes.");
    process.exit(1);
  }

  for (const entry of SEED) {
    const code = normalizeReferralCode(entry.code);
    await db
      .insert(referralCodes)
      .values({
        code,
        discountPercent: entry.discountPercent,
        active: true,
        label: entry.label,
      })
      .onConflictDoUpdate({
        target: referralCodes.code,
        // Deliberately narrow: a re-seed must not wipe a cap, an expiry or an
        // owner that an operator set in the console.
        set: {
          discountPercent: entry.discountPercent,
          active: true,
          label: entry.label,
        },
      });
    console.log(`✓ ${code} — ${entry.discountPercent}% off`);
  }

  console.log(`Seeded ${SEED.length} referral code(s).`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to seed referral codes:", error);
  process.exit(1);
});
