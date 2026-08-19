/**
 * The registration row the console renders, and the values derived from it.
 *
 * No database imports live here. The dashboard is a client component, so
 * anything it imports is bundled for the browser; pulling this from
 * `registrations.ts` would drag the Postgres driver in with it and fail the
 * build. `registrations.ts` re-exports the type for server callers.
 */

/** One registration, with everything the console joins onto it. */
export type AdminRegistrationRow = {
  // Identity and contact.
  ref: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  gstin: string | null;
  companyAddress: string | null;
  /**
   * Pricing region, only ever "IN" or "REST". It decides which price was
   * charged; it does not identify where the buyer is. Use `countryName` for
   * that — collapsing every non-Indian buyer to "International" in the UI hides
   * the country the invoice was actually raised against.
   */
  country: string;
  /** The country the buyer selected, e.g. "Netherlands". Null on older rows. */
  countryName: string | null;
  countryCode: string | null;
  /** Indian state / UT (place of supply). Captured for India only. */
  state: string | null;

  // Referral.
  /** Code the buyer used. Since validation moved to registration, this is real. */
  referralCode: string | null;
  /** Set at checkout only once the code validated as active. `null` = no discount. */
  discountPercent: number | null;
  codeOwnerName: string | null;
  codeOwnerEmail: string | null;
  codeCommissionPercent: number | null;

  // Payment.
  status: string;
  amountDisplay: string | null;
  /** What Razorpay actually took, in minor units. Null until an order is made. */
  amountCharged: number | null;
  currency: string | null; // 'INR' | 'USD'
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string; // ISO
  paidAt: string | null; // ISO

  // Invoice: the authoritative money breakdown, ex-GST figures included.
  invoiceNo: string | null;
  invoiceIssuedAt: string | null;
  invoiceFy: string | null;
  listValue: number | null;
  discountAmount: number | null;
  taxableValue: number | null;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  totalTax: number | null;
  invoiceTotal: number | null;
  taxRatePercent: number | null;
  supplyType: string | null; // 'intra' | 'inter' | 'export'
  placeOfSupply: string | null;
  zeroRatedUnderLut: boolean | null;

  // Cohort and Zoom.
  sessionLabel: string | null;
  sessionStartsAt: string | null;
  sessionEndsAt: string | null;
  zoomWebinarId: string | null;
  zoomRegistrantId: string | null;
  zoomRegisteredAt: string | null;
  zoomAccessAttempts: number;
  zoomAccessLastAttemptAt: string | null;
  /** Whether the buyer has their own Zoom join link yet. */
  hasJoinLink: boolean;

  // Attendance and credential.
  /**
   * Minutes attended. `null` means attendance has not been synced from Zoom
   * yet, which is deliberately different from 0 (registered, never joined):
   * one is "we do not know", the other is a final answer.
   */
  attendedMinutes: number | null;
  firstJoinedAt: string | null;
  attendanceSyncedAt: string | null;
  credentialId: string | null;
  certificateIssuedAt: string | null;
  /**
   * Whether this seat has earned a certificate, decided by the SERVER.
   *
   * Carried on the row rather than recomputed here, because the threshold is
   * configurable (`PAVEL_ATTENDANCE_MIN_MINUTES`) and is deliberately lowered
   * while testing. A copy of the number in this browser-side module would
   * disagree with the server the moment it was changed, and the console would
   * quietly report the wrong people as having earned one.
   */
  certificateEarned: boolean;

  // Lifecycle.
  /** Email types already sent, e.g. ['confirmation','reminder_1d']. */
  emailTypes: string[];
  lastEmailAt: string | null;
};

/** A pending seat older than this is treated as abandoned rather than in-flight. */
export const ABANDONED_AFTER_DAYS = 7;

export type AttendanceBand = "full" | "partial" | "no_show" | "not_synced" | "n/a";

/**
 * How much of the session the buyer actually attended.
 *
 * "not_synced" is not a zero. Until Zoom has been read we do not know whether
 * someone attended, and showing that as a no-show would have an operator
 * chasing people who simply have not been measured yet.
 */
export function attendanceBand(row: AdminRegistrationRow): AttendanceBand {
  if (row.status !== "paid") return "n/a";
  if (row.attendedMinutes === null) return "not_synced";
  if (row.attendedMinutes === 0) return "no_show";
  // "full" means the seat cleared the certificate threshold, which only the
  // server knows: see `certificateEarned`.
  return row.certificateEarned ? "full" : "partial";
}

/** Attended minutes as a percentage of the session's scheduled length. */
export function attendancePercent(row: AdminRegistrationRow): number | null {
  if (row.attendedMinutes === null) return null;
  if (!row.sessionStartsAt || !row.sessionEndsAt) return null;
  const minutes =
    (new Date(row.sessionEndsAt).getTime() - new Date(row.sessionStartsAt).getTime()) /
    60000;
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  // Someone can join early and leave late, so this is capped rather than left
  // to report 104% and read as a bug.
  return Math.min(100, Math.round((row.attendedMinutes / minutes) * 100));
}

/** Earned a certificate but has not been issued one. Actionable, so it is its own signal. */
export function certificateEligibleUnissued(row: AdminRegistrationRow): boolean {
  return row.certificateEarned && !row.credentialId;
}

/** Paid but no invoice was ever issued. Always an operator problem. */
export function invoiceMissing(row: AdminRegistrationRow): boolean {
  return row.status === "paid" && !row.invoiceNo;
}

/** Paid but Zoom never issued a join link, so the buyer cannot attend. */
export function joinLinkMissing(row: AdminRegistrationRow): boolean {
  return row.status === "paid" && !row.hasJoinLink;
}

/**
 * Zoom allows three registration attempts per person, per webinar, per day.
 *
 * Lives here rather than as a literal in the column that renders it, because
 * the same number now decides a cell's colour, a summary figure and a filter,
 * and three copies of it would drift.
 */
export const ZOOM_ACCESS_ATTEMPT_LIMIT = 3;

/**
 * A paid seat with no join link that has burned its Zoom attempts.
 *
 * A strict subset of `joinLinkMissing`, and worth separating from it: a seat
 * merely missing a link is usually mid-flight and resolves itself on the next
 * attempt, while one at the quota will not recover until the limit resets and
 * needs a person to intervene. Reported as one figure, the two are
 * indistinguishable, and the urgent case hides inside the routine one.
 */
export function zoomAccessStuck(row: AdminRegistrationRow): boolean {
  return (
    joinLinkMissing(row) && row.zoomAccessAttempts >= ZOOM_ACCESS_ATTEMPT_LIMIT
  );
}

/**
 * Charged and invoiced amounts disagree.
 *
 * They are derived from the same tax breakdown and should be identical by
 * construction, so a mismatch means one of the two writes did not land. That
 * makes it the most serious thing this data can say: the money taken and the
 * money on the tax invoice are different numbers, and one of them is wrong.
 */
export function amountMismatch(row: AdminRegistrationRow): boolean {
  if (row.amountCharged === null || row.invoiceTotal === null) return false;
  return row.amountCharged !== row.invoiceTotal;
}

/** Minutes between reserving a seat and paying for it. */
export function minutesToPay(row: AdminRegistrationRow): number | null {
  if (!row.paidAt) return null;
  const ms = new Date(row.paidAt).getTime() - new Date(row.createdAt).getTime();
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 60000)) : null;
}

/** Whole days since the seat was reserved. */
export function ageInDays(row: AdminRegistrationRow, now: Date): number {
  const ms = now.getTime() - new Date(row.createdAt).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** An unpaid seat old enough to count as gone rather than in progress. */
export function isAbandoned(row: AdminRegistrationRow, now: Date): boolean {
  return row.status !== "paid" && ageInDays(row, now) >= ABANDONED_AFTER_DAYS;
}

/**
 * Commission owed on this seat, in minor units.
 *
 * Calculated on the ex-GST taxable value, never on the gross. Commission on the
 * gross would pay the partner a share of tax collected for the government.
 */
export function rowCommission(row: AdminRegistrationRow): number | null {
  if (!row.codeCommissionPercent || row.codeCommissionPercent <= 0) return null;
  if (row.taxableValue === null) return null;
  return Math.round((row.taxableValue * row.codeCommissionPercent) / 100);
}
