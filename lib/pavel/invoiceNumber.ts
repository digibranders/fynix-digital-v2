import { and, eq, sql } from "drizzle-orm";
import { invoiceCounters } from "@/lib/db/schema";
import type { Db } from "@/lib/db/client";

/**
 * Allocation of the GST invoice series.
 *
 * GST requires a serial number that is consecutive, unique within a financial
 * year, and at most 16 characters. The Indian financial year runs 1 April to
 * 31 March and is evaluated in IST, since that is where the seller files: a
 * payment at 23:00 UTC on 31 March is already 1 April in India.
 *
 * Numbers come from a counter row locked FOR UPDATE inside the caller's
 * transaction. Deriving the next number from count(*) would race under
 * concurrent payments and issue duplicates.
 */

/** Series prefix for Fynix, deliberately separate from the OyeChats "DB" series. */
export const INVOICE_PREFIX = "FYX";

const IST_TIME_ZONE = "Asia/Kolkata";

/** Calendar year and 1-based month of an instant, as observed in IST. */
function istYearMonth(date: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new Error("Could not resolve the IST date for the invoice series.");
  }
  return { year, month };
}

/** Indian financial year containing `date`, e.g. "2026-27". */
export function financialYearFor(date: Date): string {
  const { year, month } = istYearMonth(date);
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(2)}`;
}

/** Two-digit form used inside the invoice number, e.g. "2026-27" to "26-27". */
export function financialYearShort(fy: string): string {
  const [start, end] = fy.split("-");
  return `${start.slice(2)}-${end}`;
}

/** Render an invoice number, e.g. "FYX/26-27/0001". */
export function formatInvoiceNo(
  prefix: string,
  fy: string,
  seq: number
): string {
  if (!Number.isInteger(seq) || seq < 1) {
    throw new Error(`Invoice sequence must be a positive integer, got ${seq}.`);
  }
  return `${prefix}/${financialYearShort(fy)}/${String(seq).padStart(4, "0")}`;
}

export interface AllocatedInvoiceNumber {
  invoiceNo: string;
  fy: string;
  seq: number;
}

/**
 * Reserve the next invoice number for the financial year containing `issuedAt`.
 *
 * MUST be called inside a transaction (pass the transaction handle as `tx`), and
 * in the same transaction that writes the invoice row, so a rollback releases
 * the number instead of leaving a gap in the series.
 */
export async function allocateInvoiceNumber(
  tx: Db,
  issuedAt: Date,
  prefix: string = INVOICE_PREFIX
): Promise<AllocatedInvoiceNumber> {
  const fy = financialYearFor(issuedAt);

  // Ensure the counter row exists before locking it. Concurrent callers race
  // here harmlessly: the unique constraint means exactly one insert wins and the
  // rest no-op, then all of them queue on the row lock below.
  await tx
    .insert(invoiceCounters)
    .values({ prefix, fy, lastSeq: 0 })
    .onConflictDoNothing();

  // Serialise allocation: every concurrent payment for this FY queues here, so
  // the sequence can never be handed out twice.
  const locked = await tx.execute<{ last_seq: number }>(
    sql`SELECT last_seq FROM invoice_counters WHERE prefix = ${prefix} AND fy = ${fy} FOR UPDATE`
  );

  const current = Number(locked[0]?.last_seq ?? 0);
  const seq = current + 1;

  await tx
    .update(invoiceCounters)
    .set({ lastSeq: seq })
    .where(and(eq(invoiceCounters.prefix, prefix), eq(invoiceCounters.fy, fy)));

  return { invoiceNo: formatInvoiceNo(prefix, fy, seq), fy, seq };
}
