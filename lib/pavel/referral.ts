import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { referralCodes } from "@/lib/db/schema";
import { normalizeReferralCode } from "@/components/pavel/pricing";

/** A validated, active referral code and the discount it grants. */
export type ReferralDiscount = {
  code: string;
  discountPercent: number;
};

/**
 * Look up a referral code and return its discount if it exists and is active.
 * Server-only — the discount is never taken from the client. Returns `null` for
 * an empty, unknown, inactive, or out-of-range code, so callers simply charge
 * full price when nothing valid is supplied.
 */
export async function lookupReferral(
  db: Db,
  rawCode: string | null | undefined
): Promise<ReferralDiscount | null> {
  if (!rawCode) return null;
  const code = normalizeReferralCode(rawCode);
  if (!code) return null;

  try {
    const [row] = await db
      .select({
        code: referralCodes.code,
        discountPercent: referralCodes.discountPercent,
        active: referralCodes.active,
      })
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (!row || !row.active) return null;
    if (
      !Number.isFinite(row.discountPercent) ||
      row.discountPercent <= 0 ||
      row.discountPercent > 100
    ) {
      return null;
    }

    return { code: row.code, discountPercent: row.discountPercent };
  } catch (error) {
    // A missing table (migration not yet run) or transient DB error must never
    // block a full-price checkout — degrade to "no discount" and log it.
    console.error("[pavel/referral] lookup failed", error);
    return null;
  }
}
