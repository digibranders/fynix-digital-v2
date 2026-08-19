import { and, desc, eq, gt, sql, sum } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { invoices, referralCodes, registrations } from "@/lib/db/schema";
import {
  AdminGatewayError,
  adminGatewayFetch,
  hasLocalDb,
} from "@/lib/admin/gateway";
import { redemptionTotals } from "@/lib/pavel/referral";
import { normalizeReferralCode } from "@/components/pavel/pricing";

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

export const REFERRALS_DATA_PATH = "/api/admin/data/referrals";

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

/** Commission owed to the code's owner, in minor units per currency. */
export function commissionOwed(row: AdminReferralRow): { inr: number; usd: number } {
  const pct = row.commissionPercent;
  if (!pct || pct <= 0) return { inr: 0, usd: 0 };
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return {
    inr: Math.round((row.netRevenueInr * clamped) / 100),
    usd: Math.round((row.netRevenueUsd * clamped) / 100),
  };
}

export type LoadReferralsResult = {
  codes: AdminReferralRow[];
  error: string | null;
};

/** Narrow an untrusted JSON payload to the row shape the console expects. */
function isReferralRow(value: unknown): value is AdminReferralRow {
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
    const parsed = new Date(String(input.expiresAt));
    if (Number.isNaN(parsed.getTime())) return { error: "That expiry date is not valid." };
    expiresAt = parsed;
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

      // Deleting is refused once a code has been redeemed. Registrations and
      // invoices reference it by string, not by key, so removing the row would
      // leave paid seats pointing at a code nobody can look up and take a
      // partner's payout history with it. Switching off is how a used code is
      // retired.
      const [used] = await db
        .select({ id: registrations.id })
        .from(registrations)
        .innerJoin(referralCodes, eq(referralCodes.code, registrations.referralCode))
        .where(and(eq(referralCodes.id, input.id), gt(registrations.discountPercent, 0)))
        .limit(1);
      if (used) {
        return "That code has been redeemed, so it cannot be deleted. Switch it off instead.";
      }

      await db.delete(referralCodes).where(eq(referralCodes.id, input.id));
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/duplicate key|unique constraint/i.test(message)) {
        return "That code already exists.";
      }
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
