import { and, count, eq, gt, gte, or, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { Db } from "@/lib/db/client";
import { referralCodes, registrations } from "@/lib/db/schema";
import { normalizeReferralCode } from "@/components/pavel/pricing";

/** Why a code cannot be redeemed. Drives the message the buyer is shown. */
export type ReferralRejection =
  | "unknown" // no such code, or its stored discount is out of range
  | "inactive" // switched off by an operator
  | "expired" // past its expiry
  | "exhausted" // redemption cap reached
  | "unavailable"; // could not be verified right now (database trouble)

/** A validated, redeemable code and the discount it grants. */
export type ReferralDiscount = {
  code: string;
  discountPercent: number;
};

export type ReferralEvaluation =
  | ({ ok: true } & ReferralDiscount)
  | { ok: false; reason: ReferralRejection };

/** The stored fields a redemption decision depends on. */
export type ReferralRules = {
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt: Date | null;
  maxUses: number | null;
};

/**
 * Decide whether a code may be redeemed, given its rules, how many times it has
 * already been redeemed, and the current time.
 *
 * Pure by design: no database, no clock of its own. That is what lets the rules
 * be tested exhaustively, and it makes the ORDER of the checks explicit — a code
 * that is both expired and exhausted reports "expired", because that is the
 * fact an operator needs to see first.
 */
export function decideReferral(
  rules: ReferralRules | null,
  redemptions: number,
  now: Date
): ReferralEvaluation {
  if (!rules) return { ok: false, reason: "unknown" };

  // An out-of-range discount is a corrupt row, not a business state. Reporting
  // it as "unknown" keeps a broken code from ever pricing an order.
  if (
    !Number.isFinite(rules.discountPercent) ||
    rules.discountPercent <= 0 ||
    rules.discountPercent > 100
  ) {
    return { ok: false, reason: "unknown" };
  }

  if (!rules.active) return { ok: false, reason: "inactive" };
  if (rules.expiresAt && rules.expiresAt.getTime() <= now.getTime()) {
    return { ok: false, reason: "expired" };
  }
  if (rules.maxUses !== null && redemptions >= rules.maxUses) {
    return { ok: false, reason: "exhausted" };
  }

  return { ok: true, code: rules.code, discountPercent: rules.discountPercent };
}

/** Buyer-facing explanation for a rejection. Never leaks operator detail. */
export function referralRejectionMessage(reason: ReferralRejection): string {
  switch (reason) {
    case "inactive":
      return "That code is no longer active.";
    case "expired":
      return "That code has expired.";
    case "exhausted":
      return "That code has been fully claimed.";
    case "unavailable":
      return "We couldn’t check that code just now. Please try again.";
    case "unknown":
    default:
      return "That code isn’t valid.";
  }
}

/**
 * A stored code reduced to its canonical form, for matching.
 *
 * Registrations and invoices record the code as free text, and rows written
 * before the code was validated at registration hold whatever the buyer typed —
 * production has a paid seat carrying 'steve10' against a code stored as
 * 'STEVE10'. Matching those exactly meant they never met: the redemption went
 * uncounted, so the panel reported zero revenue for a real sale, the owner join
 * missed so no commission was ever calculated, and the cap read the code as
 * untouched and would have kept selling past its limit.
 *
 * Migration 0021 normalises the existing rows. This stays because it costs
 * nothing and the column is still free text: the guard should not depend on
 * every writer, past and future, having remembered.
 */
export function canonicalCode(column: AnyPgColumn): SQL<string> {
  return sql<string>`upper(btrim(${column}))`;
}

/**
 * How long an unpaid checkout holds a cap slot. Comfortably longer than a
 * Razorpay Checkout session stays payable, so a reservation cannot expire
 * while its buyer could still complete the payment; short enough that an
 * abandoned checkout frees the slot the same half hour.
 */
export const CHECKOUT_RESERVATION_MS = 30 * 60 * 1000;

/**
 * Count redemptions of a code: PAID discounted seats, plus ACTIVE checkout
 * reservations — pending seats whose checkout stamped `checkout_started_at`
 * within the reservation window.
 *
 * Reservations exist because payment is deferred: the cap used to be checked
 * only against paid seats at order-creation time, so any number of checkouts
 * opened before the first one paid all passed it, and a capped code could be
 * oversold without any concurrency at all. Counting open checkouts closes
 * that window; an abandoned one ages out and frees the slot.
 *
 * Testing `discountPercent > 0` rather than merely matching the code means a
 * full-price seat carrying the code as attribution does not consume a slot.
 */
export async function countRedemptions(
  db: Db,
  code: string,
  now: Date = new Date()
): Promise<number> {
  const reservedSince = new Date(now.getTime() - CHECKOUT_RESERVATION_MS);
  const [row] = await db
    .select({ value: count() })
    .from(registrations)
    .where(
      and(
        eq(canonicalCode(registrations.referralCode), normalizeReferralCode(code)),
        gt(registrations.discountPercent, 0),
        or(
          eq(registrations.status, "paid"),
          and(
            eq(registrations.status, "pending"),
            gte(registrations.checkoutStartedAt, reservedSince)
          )
        )
      )
    );
  return row?.value ?? 0;
}

/**
 * Look up a code and decide whether it may be redeemed right now.
 *
 * Returns a typed rejection rather than a bare null so callers can tell the
 * buyer WHY, and so a transient database failure ("unavailable") stays
 * distinguishable from a genuinely bad code. Callers must not collapse
 * "unavailable" into "no discount" and charge the list price: that silently
 * bills someone an amount they did not agree to.
 *
 * The cap count is only paid for when there is a cap to enforce.
 */
export async function evaluateReferral(
  db: Db,
  rawCode: string | null | undefined,
  now: Date = new Date()
): Promise<ReferralEvaluation> {
  const code = rawCode ? normalizeReferralCode(rawCode) : "";
  if (!code) return { ok: false, reason: "unknown" };

  try {
    const [row] = await db
      .select({
        code: referralCodes.code,
        discountPercent: referralCodes.discountPercent,
        active: referralCodes.active,
        expiresAt: referralCodes.expiresAt,
        maxUses: referralCodes.maxUses,
      })
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (!row) return { ok: false, reason: "unknown" };

    const redemptions =
      row.maxUses === null ? 0 : await countRedemptions(db, row.code, now);
    return decideReferral(row, redemptions, now);
  } catch (error) {
    console.error("[pavel/referral] lookup failed", error);
    return { ok: false, reason: "unavailable" };
  }
}

/**
 * Redemption totals for every code that has seen any, keyed by code.
 *
 * One grouped pass rather than a query per code, for the admin console. Kept
 * beside `countRedemptions` so the definition of "redeemed" lives in exactly one
 * place: change it here and the cap, the console and the payout report all move
 * together.
 */
export async function redemptionTotals(
  db: Db
): Promise<Map<string, { redeemed: number; attributed: number; pending: number }>> {
  const rows = await db
    .select({
      // Grouped on the canonical form so 'steve10' and 'STEVE10' are one code,
      // and so the key matches referral_codes.code without further massaging.
      code: canonicalCode(registrations.referralCode),
      redeemed: count(
        sql`case when ${registrations.status} = 'paid' and ${registrations.discountPercent} > 0 then 1 end`
      ),
      attributed: count(sql`case when ${registrations.status} = 'paid' then 1 end`),
      pending: count(sql`case when ${registrations.status} <> 'paid' then 1 end`),
    })
    .from(registrations)
    .where(sql`${registrations.referralCode} is not null`)
    .groupBy(canonicalCode(registrations.referralCode));

  return new Map(
    rows.map((r) => [
      r.code ?? "",
      { redeemed: r.redeemed, attributed: r.attributed, pending: r.pending },
    ])
  );
}
