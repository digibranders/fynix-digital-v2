import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { invoices, registrations } from "@/lib/db/schema";
import {
  AdminGatewayError,
  adminGatewayFetch,
  hasLocalDb,
} from "@/lib/admin/gateway";

/** One row of the Pavel registrations table, as the dashboard renders it. */
export type AdminRegistrationRow = {
  ref: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  /** Indian state / UT (place of supply). Captured for India only. */
  state: string | null;
  /** Code the buyer typed at registration — not yet proof of a discount. */
  referralCode: string | null;
  /** Set at checkout only once the code validated as active. `null` = no discount. */
  discountPercent: number | null;
  amountDisplay: string | null;
  status: string;
  createdAt: string; // ISO
  paidAt: string | null; // ISO
  razorpayPaymentId: string | null;
  /** Issued tax invoice number, e.g. "FYX/26-27/0001". Null until issued. */
  invoiceNo: string | null;
};

export type LoadRegistrationsResult = {
  rows: AdminRegistrationRow[];
  error: string | null;
};

/** Path of the droplet-side endpoint that serves these rows. */
export const REGISTRATIONS_DATA_PATH = "/api/admin/data/registrations";

/**
 * Read every registration straight from Postgres. Only callable where the
 * database is reachable — the droplet and local dev.
 */
export async function queryRegistrations(): Promise<AdminRegistrationRow[]> {
  const db = getDb();
  if (!db) {
    throw new Error("queryRegistrations called without a database connection.");
  }

  const records = await db
    .select({
      ref: registrations.ref,
      name: registrations.name,
      email: registrations.email,
      phone: registrations.phone,
      country: registrations.country,
      state: registrations.state,
      referralCode: registrations.referralCode,
      discountPercent: registrations.discountPercent,
      amountDisplay: registrations.amountDisplay,
      status: registrations.status,
      createdAt: registrations.createdAt,
      paidAt: registrations.paidAt,
      razorpayPaymentId: registrations.razorpayPaymentId,
      invoiceNo: invoices.invoiceNo,
    })
    .from(registrations)
    // Left join: pending seats have no invoice, and a paid seat whose issuance
    // failed should still appear in the table (with a blank invoice cell)
    // rather than vanish from the operator's view.
    .leftJoin(invoices, eq(invoices.registrationId, registrations.id))
    .orderBy(desc(registrations.createdAt));

  return records.map((r) => ({
    ref: r.ref,
    name: r.name,
    email: r.email,
    phone: r.phone,
    country: r.country,
    state: r.state,
    referralCode: r.referralCode,
    discountPercent: r.discountPercent,
    amountDisplay: r.amountDisplay,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    paidAt: r.paidAt ? r.paidAt.toISOString() : null,
    razorpayPaymentId: r.razorpayPaymentId,
    invoiceNo: r.invoiceNo,
  }));
}

/** Narrow an untrusted JSON payload to the row shape the dashboard expects. */
function isRegistrationRow(value: unknown): value is AdminRegistrationRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.ref === "string" &&
    typeof row.name === "string" &&
    typeof row.email === "string" &&
    typeof row.country === "string" &&
    typeof row.status === "string" &&
    typeof row.createdAt === "string"
  );
}

/**
 * Load registrations for the dashboard, from wherever they live.
 *
 * On the droplet (and locally) that is Postgres directly. On Vercel — which has
 * no database — it is the droplet's internal admin API. Errors are returned as
 * an operator-readable message rather than thrown, so the page can render a
 * useful failure state instead of a 500.
 */
export async function loadRegistrations(): Promise<LoadRegistrationsResult> {
  if (hasLocalDb()) {
    try {
      return { rows: await queryRegistrations(), error: null };
    } catch (error) {
      console.error("[admin] failed to query registrations", error);
      return { rows: [], error: "Could not load registrations. Please try again." };
    }
  }

  try {
    const response = await adminGatewayFetch(REGISTRATIONS_DATA_PATH);
    if (!response.ok) {
      console.error(
        "[admin] registrations gateway responded",
        response.status,
        await response.text().catch(() => "")
      );
      return {
        rows: [],
        error: `Could not reach the registrations service (HTTP ${response.status}).`,
      };
    }

    const payload: unknown = await response.json();
    const rows =
      typeof payload === "object" && payload !== null
        ? (payload as { rows?: unknown }).rows
        : undefined;

    if (!Array.isArray(rows) || !rows.every(isRegistrationRow)) {
      console.error("[admin] registrations gateway returned an unexpected payload");
      return {
        rows: [],
        error: "The registrations service returned unexpected data.",
      };
    }

    return { rows, error: null };
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      console.error("[admin] gateway is not configured", error);
      return {
        rows: [],
        error:
          "The admin console is not connected to its data service. Set ADMIN_API_ORIGIN and ADMIN_PROXY_SECRET.",
      };
    }
    console.error("[admin] registrations gateway request failed", error);
    return {
      rows: [],
      error: "Could not reach the registrations service. Please try again.",
    };
  }
}
