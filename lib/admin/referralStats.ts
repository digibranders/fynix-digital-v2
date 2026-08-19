/**
 * Referral code shape and the numbers derived from it.
 *
 * Kept in its own module with NO database imports, because the console panel is
 * a client component: importing these from `lib/admin/referrals.ts` pulled
 * `lib/db/client.ts` — and with it the whole `postgres` driver — into the
 * browser bundle, which fails the build. Everything here is pure and safe on
 * either side. `lib/admin/referrals.ts` re-exports it for server callers, so
 * there is still one import path to remember.
 */

export type AdminReferralRow = {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  label: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  commissionPercent: number | null;
  maxUses: number | null;
  expiresAt: string | null; // ISO
  createdAt: string; // ISO

  /** Paid seats that actually received the discount. Counts against `maxUses`. */
  redeemed: number;
  /** Paid seats carrying this code at all, discounted or not. */
  attributed: number;
  /** Unpaid registrations carrying this code. Pipeline, not revenue. */
  pending: number;
  /** Ex-GST invoiced revenue in minor units (paise / cents), per currency. */
  netRevenueInr: number;
  netRevenueUsd: number;
};

/** What an operator sees at a glance. Derived on read, never stored. */
export type ReferralStatus = "active" | "inactive" | "expired" | "exhausted";

/**
 * The one-word state of a code.
 *
 * Order matters. A code switched off by hand reports "inactive" even when it is
 * also expired, because that is the operator's own decision and the one they
 * need to see in order to undo it.
 */
export function referralStatus(
  row: AdminReferralRow,
  now: Date = new Date()
): ReferralStatus {
  if (!row.active) return "inactive";
  if (row.expiresAt && new Date(row.expiresAt).getTime() <= now.getTime()) {
    return "expired";
  }
  if (row.maxUses !== null && row.redeemed >= row.maxUses) return "exhausted";
  return "active";
}

/**
 * Commission owed to the code's owner, in minor units per currency.
 *
 * Calculated on ex-GST revenue. Paying on the gross would overpay every Indian
 * sale by the 18% collected on top of it.
 */
export function commissionOwed(row: AdminReferralRow): { inr: number; usd: number } {
  const pct = row.commissionPercent;
  if (!pct || pct <= 0) return { inr: 0, usd: 0 };
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return {
    inr: Math.round((row.netRevenueInr * clamped) / 100),
    usd: Math.round((row.netRevenueUsd * clamped) / 100),
  };
}

/** Narrow an untrusted JSON payload to the row shape the console expects. */
export function isReferralRow(value: unknown): value is AdminReferralRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.code === "string" &&
    typeof row.discountPercent === "number" &&
    typeof row.active === "boolean" &&
    typeof row.redeemed === "number"
  );
}
