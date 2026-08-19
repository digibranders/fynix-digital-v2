import { count, desc, eq, sql, sum } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db/client";
import { invoices, referralCodes, registrations } from "@/lib/db/schema";
import {
  AdminGatewayError,
  adminGatewayFetch,
  hasLocalDb,
} from "@/lib/admin/gateway";
import { redemptionTotals } from "@/lib/pavel/referral";
import { normalizeReferralCode } from "@/components/pavel/pricing";
import {
  isReferralRow,
  type AdminReferralRow,
} from "@/lib/admin/referralStats";
import { isUniqueViolation } from "@/lib/admin/dbErrors";
import { parseIstWallClock } from "@/lib/pavel/sessionTimes";

// Re-exported so server callers have one import path, while the console panel
// (a client component) imports them from `referralStats` directly and does not
// drag the database driver into the browser bundle.
export {
  commissionOwed,
  referralStatus,
  type AdminReferralRow,
  type ReferralStatus,
} from "@/lib/admin/referralStats";

/**
 * Referral codes, as the console sees them: the stored rules plus the usage
 * they have actually seen.
 *
 * Same split as registrations and sessions — direct Postgres where reachable
 * (the droplet, local dev), the droplet's internal admin API from Vercel.
 *
 * Two different sources back the numbers, deliberately:
 *
 *   - Usage comes from `registrations`, the operational record. A seat counts
 *     as redeemed the moment it is paid, whether or not its invoice was issued.
 *   - Money comes from `invoices.taxableValue`, which is EX-GST. Commission is
 *     owed on what was earned, not on the tax collected on top of it; paying on
 *     the gross would overpay every Indian sale by 18%.
 *
 * Where the two disagree, an invoice failed to issue. Both are surfaced so that
 * is visible rather than silently absorbed.
 */

export const REFERRALS_DATA_PATH = "/api/admin/data/referrals";

export type LoadReferralsResult = {
  codes: AdminReferralRow[];
  error: string | null;
};

/** Read every code with its usage, straight from Postgres. */
export async function queryReferrals(): Promise<AdminReferralRow[]> {
  const db = getDb();
  if (!db) throw new Error("queryReferrals called without a database connection.");

  const codes = await db
    .select()
    .from(referralCodes)
    .orderBy(desc(referralCodes.createdAt));

  // Two grouped passes for the whole table, rather than a pair of queries per
  // code. `redemptionTotals` is shared with the cap check so "redeemed" means
  // the same thing here as it does at checkout.
  const usage = await redemptionTotals(db);

  const revenue = await db
    .select({
      code: invoices.referralCode,
      currency: invoices.currency,
      net: sum(invoices.taxableValue),
    })
    .from(invoices)
    .where(sql`${invoices.referralCode} is not null`)
    .groupBy(invoices.referralCode, invoices.currency);

  const revenueByCode = new Map<string, { inr: number; usd: number }>();
  for (const r of revenue) {
    const key = r.code ?? "";
    const bucket = revenueByCode.get(key) ?? { inr: 0, usd: 0 };
    // `sum()` comes back as a string: a Postgres numeric aggregate is arbitrary
    // precision, so the driver will not narrow it to a number for us.
    const net = Number(r.net ?? 0);
    if (r.currency === "INR") bucket.inr += net;
    else if (r.currency === "USD") bucket.usd += net;
    revenueByCode.set(key, bucket);
  }

  return codes.map((c) => {
    const used = usage.get(c.code);
    const money = revenueByCode.get(c.code) ?? { inr: 0, usd: 0 };
    return {
      id: c.id,
      code: c.code,
      discountPercent: c.discountPercent,
      active: c.active,
      label: c.label,
      ownerName: c.ownerName,
      ownerEmail: c.ownerEmail,
      commissionPercent: c.commissionPercent,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
      redeemed: used?.redeemed ?? 0,
      attributed: used?.attributed ?? 0,
      pending: used?.pending ?? 0,
      netRevenueInr: money.inr,
      netRevenueUsd: money.usd,
    };
  });
}

/**
 * Load codes for the console, from wherever they live. Errors are returned as
 * an operator-readable message rather than thrown, so the page renders a useful
 * failure state instead of a 500.
 */
export async function loadReferrals(): Promise<LoadReferralsResult> {
  if (hasLocalDb()) {
    try {
      return { codes: await queryReferrals(), error: null };
    } catch (error) {
      console.error("[admin] failed to query referral codes", error);
      return { codes: [], error: "Could not load referral codes." };
    }
  }

  try {
    const response = await adminGatewayFetch(REFERRALS_DATA_PATH);
    if (!response.ok) {
      console.error("[admin] referrals gateway responded", response.status);
      return {
        codes: [],
        error: `Could not reach the referrals service (HTTP ${response.status}).`,
      };
    }

    const payload: unknown = await response.json();
    const codes =
      typeof payload === "object" && payload !== null
        ? (payload as { codes?: unknown }).codes
        : undefined;

    if (!Array.isArray(codes) || !codes.every(isReferralRow)) {
      console.error("[admin] referrals gateway returned an unexpected payload");
      return { codes: [], error: "The referrals service returned unexpected data." };
    }
    return { codes, error: null };
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      console.error("[admin] gateway is not configured", error);
      return {
        codes: [],
        error:
          "The admin console is not connected to its data service. Set ADMIN_API_ORIGIN and ADMIN_PROXY_SECRET.",
      };
    }
    console.error("[admin] referrals gateway request failed", error);
    return { codes: [], error: "Could not reach the referrals service." };
  }
}

export type ReferralMutationInput = {
  id?: string;
  code?: string;
  discountPercent?: string | number;
  label?: string;
  ownerName?: string;
  ownerEmail?: string;
  commissionPercent?: string | number;
  maxUses?: string | number;
  expiresAt?: string;
  active?: boolean;
};

/** Columns a validated create or update writes. */
export type ReferralValues = {
  code: string;
  discountPercent: number;
  label: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  commissionPercent: number | null;
  maxUses: number | null;
  expiresAt: Date | null;
};

/**
 * Parse operator input into storable columns, or explain what is wrong.
 *
 * Shared by the direct-database and gateway paths so every rule is enforced
 * once, wherever the console happens to be running. Blank optional fields mean
 * "no limit" and are stored as null, which is distinct from zero.
 */
export function parseReferralInput(
  input: ReferralMutationInput
): { error: string } | { values: ReferralValues } {
  const code = normalizeReferralCode(String(input.code ?? ""));
  if (!code) return { error: "A code is required." };
  if (!/^[A-Z0-9._-]+$/.test(code)) {
    return {
      error: "A code may use only letters, digits, dots, dashes and underscores.",
    };
  }

  const discountPercent = Number(input.discountPercent);
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    return { error: "Discount must be a whole number between 1 and 100." };
  }

  const blank = (v: unknown) => v === undefined || v === null || String(v).trim() === "";

  let maxUses: number | null = null;
  if (!blank(input.maxUses)) {
    const parsed = Number(input.maxUses);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return { error: "Max redemptions must be a whole number of 1 or more, or blank." };
    }
    maxUses = parsed;
  }

  let commissionPercent: number | null = null;
  if (!blank(input.commissionPercent)) {
    const parsed = Number(input.commissionPercent);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      return { error: "Commission must be a whole number between 0 and 100, or blank." };
    }
    commissionPercent = parsed;
  }

  let expiresAt: Date | null = null;
  if (!blank(input.expiresAt)) {
    // Read as IST, the zone the operator is typing in and the workshop runs in.
    // `new Date(value)` would read the picker's zoneless string in the SERVER's
    // zone — UTC in production — quietly moving every expiry by 5.5 hours.
    expiresAt = parseIstWallClock(String(input.expiresAt).trim());
    if (!expiresAt) {
      return { error: "That expiry date is not valid." };
    }
  }

  const trim = (v: unknown): string | null => {
    const s = typeof v === "string" ? v.trim() : "";
    return s ? s.slice(0, 200) : null;
  };

  return {
    values: {
      code,
      discountPercent,
      label: trim(input.label),
      ownerName: trim(input.ownerName),
      ownerEmail: trim(input.ownerEmail),
      commissionPercent,
      maxUses,
      expiresAt,
    },
  };
}

/**
 * How many rows reference this code by string — registrations of any status,
 * plus issued invoices.
 *
 * The question both destructive guards ask. Deliberately broader than
 * "redeemed": a full-price seat still carries the code as attribution, and a
 * pending seat may still be paid, so either would be orphaned by a rename or a
 * delete. Invoices are counted too because an invoice outlives its registration
 * conceptually and is the record a payout reconciles against.
 */
async function countReferences(db: Db, code: string): Promise<number> {
  const [regs] = await db
    .select({ value: count() })
    .from(registrations)
    .where(eq(registrations.referralCode, code));
  if ((regs?.value ?? 0) > 0) return regs.value;

  const [invs] = await db
    .select({ value: count() })
    .from(invoices)
    .where(eq(invoices.referralCode, code));
  return invs?.value ?? 0;
}

export type ReferralAction = "create" | "update" | "toggle" | "delete";

/** Perform a referral action wherever the data lives. Returns an error or null. */
export async function mutateReferral(
  action: ReferralAction,
  input: ReferralMutationInput
): Promise<string | null> {
  if (hasLocalDb()) {
    const db = getDb();
    if (!db) return "Database is not configured.";
    try {
      if (action === "create" || action === "update") {
        const parsed = parseReferralInput(input);
        if ("error" in parsed) return parsed.error;

        if (action === "create") {
          await db.insert(referralCodes).values(parsed.values);
          return null;
        }
        if (!input.id) return "A code id is required.";

        // Renaming a code that has been used is refused.
        //
        // Registrations and invoices record the code as a STRING, not a foreign
        // key, so renaming silently cuts the row off from its own history: the
        // redemption count drops to zero, which resets a spent cap and lets the
        // code be redeemed all over again, and the owner's revenue disappears
        // from the payout report. Rewriting those references is not an option
        // either — an invoice is a legal record of what was issued and must
        // reproduce exactly as issued. Everything else about the code stays
        // editable; only the identity is frozen once it has been earned.
        const [existing] = await db
          .select({ code: referralCodes.code })
          .from(referralCodes)
          .where(eq(referralCodes.id, input.id))
          .limit(1);
        if (!existing) return "That code no longer exists.";

        if (existing.code !== parsed.values.code) {
          const referenced = await countReferences(db, existing.code);
          if (referenced > 0) {
            return `${existing.code} has been used, so its code cannot be changed. Switch it off and create a new one instead.`;
          }
        }

        await db
          .update(referralCodes)
          .set({ ...parsed.values, updatedAt: new Date() })
          .where(eq(referralCodes.id, input.id));
        return null;
      }

      if (!input.id) return "A code id is required.";

      if (action === "toggle") {
        await db
          .update(referralCodes)
          .set({ active: Boolean(input.active), updatedAt: new Date() })
          .where(eq(referralCodes.id, input.id));
        return null;
      }

      // Deleting is refused once ANYTHING references the code. Registrations
      // and invoices reference it by string, not by key, so removing the row
      // would leave those rows pointing at a code nobody can look up.
      //
      // Any reference counts, not just a discounted one: a seat paid at full
      // price still carries the code as attribution, and a pending seat may yet
      // be paid. Testing only for a discount let both be orphaned by a direct
      // call to the internal API, which is the real boundary — the panel hides
      // the button, but the panel is not what enforces this.
      const [existing] = await db
        .select({ code: referralCodes.code })
        .from(referralCodes)
        .where(eq(referralCodes.id, input.id))
        .limit(1);
      if (!existing) return "That code no longer exists.";

      if ((await countReferences(db, existing.code)) > 0) {
        return "That code has been used, so it cannot be deleted. Switch it off instead.";
      }

      await db.delete(referralCodes).where(eq(referralCodes.id, input.id));
      return null;
    } catch (error) {
      // A code that already exists is an operator mistake worth naming, not a
      // generic failure. The check reads the cause chain because Drizzle's own
      // message is only the SQL that failed.
      if (isUniqueViolation(error)) return "That code already exists.";
      console.error("[admin] referral action failed", error);
      return "Could not update referral codes.";
    }
  }

  try {
    const response = await adminGatewayFetch(REFERRALS_DATA_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...input }),
    });
    if (response.ok) return null;

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    return payload.error ?? `Could not update referral codes (HTTP ${response.status}).`;
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      return "The admin console is not connected to its data service.";
    }
    console.error("[admin] referral mutation failed", error);
    return "Could not reach the referrals service.";
  }
}
