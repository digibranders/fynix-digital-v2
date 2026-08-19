import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  certificates,
  emailLog,
  invoices,
  referralCodes,
  registrations,
  webinarSessions,
} from "@/lib/db/schema";
import {
  AdminGatewayError,
  adminGatewayFetch,
  hasLocalDb,
} from "@/lib/admin/gateway";
import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";
import { hasEarnedCertificate } from "@/lib/pavel/certificate";
import { canonicalCode } from "@/lib/pavel/referral";

export type { AdminRegistrationRow };

export type LoadRegistrationsResult = {
  rows: AdminRegistrationRow[];
  error: string | null;
};

/** Path of the droplet-side endpoint that serves these rows. */
export const REGISTRATIONS_DATA_PATH = "/api/admin/data/registrations";

/**
 * Read every registration straight from Postgres, with everything hanging off
 * it. Only callable where the database is reachable (the droplet, local dev).
 *
 * Five tables meet here because the operator's questions span all of them: what
 * was charged (registrations), what was invoiced and taxed (invoices), which
 * cohort it belongs to (webinar_sessions), whether a credential was issued
 * (certificates), and who owns the code that sold it (referral_codes). Email
 * history is a second grouped pass rather than a sixth join, because one
 * registration has many emails and joining them would multiply every row.
 *
 * Money is read from BOTH sources on purpose. `registrations.amount_charged` is
 * what Razorpay took; `invoices.total` is what was billed. They should be
 * identical, and where they are not an invoice failed to issue, which the
 * console surfaces rather than hides.
 */
export async function queryRegistrations(): Promise<AdminRegistrationRow[]> {
  const db = getDb();
  if (!db) {
    throw new Error("queryRegistrations called without a database connection.");
  }

  const records = await db
    .select({
      // Identity and contact.
      ref: registrations.ref,
      name: registrations.name,
      email: registrations.email,
      phone: registrations.phone,
      companyName: registrations.companyName,
      gstin: registrations.gstin,
      companyAddress: registrations.companyAddress,
      country: registrations.country,
      countryName: registrations.countryName,
      countryCode: registrations.countryCode,
      state: registrations.state,

      // Referral.
      referralCode: registrations.referralCode,
      discountPercent: registrations.discountPercent,
      codeOwnerName: referralCodes.ownerName,
      codeOwnerEmail: referralCodes.ownerEmail,
      codeCommissionPercent: referralCodes.commissionPercent,

      // Payment.
      status: registrations.status,
      amountDisplay: registrations.amountDisplay,
      amountCharged: registrations.amountCharged,
      currency: registrations.currency,
      razorpayOrderId: registrations.razorpayOrderId,
      razorpayPaymentId: registrations.razorpayPaymentId,
      createdAt: registrations.createdAt,
      paidAt: registrations.paidAt,

      // Invoice: the authoritative money breakdown.
      invoiceNo: invoices.invoiceNo,
      invoiceIssuedAt: invoices.issuedAt,
      invoiceFy: invoices.fy,
      listValue: invoices.listValue,
      discountAmount: invoices.discountAmount,
      taxableValue: invoices.taxableValue,
      cgst: invoices.cgst,
      sgst: invoices.sgst,
      igst: invoices.igst,
      totalTax: invoices.totalTax,
      invoiceTotal: invoices.total,
      taxRatePercent: invoices.ratePercent,
      supplyType: invoices.supplyType,
      placeOfSupply: invoices.placeOfSupply,
      zeroRatedUnderLut: invoices.zeroRatedUnderLut,

      // Cohort and Zoom.
      sessionLabel: webinarSessions.label,
      sessionStartsAt: webinarSessions.startsAt,
      sessionEndsAt: webinarSessions.endsAt,
      zoomWebinarId: webinarSessions.zoomWebinarId,
      zoomRegistrantId: registrations.zoomRegistrantId,
      zoomJoinUrl: registrations.zoomJoinUrl,
      zoomRegisteredAt: registrations.zoomRegisteredAt,
      zoomAccessAttempts: registrations.zoomAccessAttempts,
      zoomAccessLastAttemptAt: registrations.zoomAccessLastAttemptAt,

      // Attendance and credential.
      attendedMinutes: registrations.attendedMinutes,
      firstJoinedAt: registrations.firstJoinedAt,
      attendanceSyncedAt: registrations.attendanceSyncedAt,
      credentialId: certificates.credentialId,
      certificateIssuedAt: certificates.issuedAt,
    })
    .from(registrations)
    // Left joins throughout: a pending seat has no invoice, no certificate and
    // possibly no session, and it must still appear in the operator's table
    // with blank cells rather than vanish from it.
    .leftJoin(invoices, eq(invoices.registrationId, registrations.id))
    .leftJoin(certificates, eq(certificates.registrationId, registrations.id))
    .leftJoin(webinarSessions, eq(webinarSessions.id, registrations.sessionId))
    // Joined on the canonical form: rows written before the code was validated
    // hold whatever was typed, and matching those exactly left the owner and
    // commission null on real redemptions.
    .leftJoin(
      referralCodes,
      eq(referralCodes.code, canonicalCode(registrations.referralCode))
    )
    .orderBy(desc(registrations.createdAt));

  // Which emails each registration has had, in one grouped pass. Joined into
  // the query above it would multiply rows by the number of emails sent.
  const emails = await db
    .select({
      ref: registrations.ref,
      types: sql<string[]>`array_agg(${emailLog.type})`,
      lastSentAt: sql<Date | null>`max(${emailLog.sentAt})`,
    })
    .from(emailLog)
    .innerJoin(registrations, eq(registrations.id, emailLog.registrationId))
    .groupBy(registrations.ref);

  const emailsByRef = new Map(emails.map((e) => [e.ref, e]));

  const iso = (value: Date | null | undefined): string | null =>
    value ? new Date(value).toISOString() : null;

  return records.map((r) => {
    const mail = emailsByRef.get(r.ref);
    const types = (mail?.types ?? []).filter(Boolean);
    return {
      ...r,
      createdAt: r.createdAt.toISOString(),
      paidAt: iso(r.paidAt),
      invoiceIssuedAt: iso(r.invoiceIssuedAt),
      sessionStartsAt: iso(r.sessionStartsAt),
      sessionEndsAt: iso(r.sessionEndsAt),
      zoomRegisteredAt: iso(r.zoomRegisteredAt),
      zoomAccessLastAttemptAt: iso(r.zoomAccessLastAttemptAt),
      firstJoinedAt: iso(r.firstJoinedAt),
      attendanceSyncedAt: iso(r.attendanceSyncedAt),
      certificateIssuedAt: iso(r.certificateIssuedAt),
      hasJoinLink: Boolean(r.zoomJoinUrl),
      // Decided here, with the same helper that decides whether a certificate is
      // actually issued, so the console and the issuer can never disagree about
      // who earned one. The threshold is configurable, so a copy of the number
      // in the browser bundle would go stale the moment it was changed.
      certificateEarned: hasEarnedCertificate({
        status: r.status,
        attendedMinutes: r.attendedMinutes,
      }),
      emailTypes: types,
      lastEmailAt: iso(mail?.lastSentAt ?? null),
    };
  });
}

/**
 * Fill in fields an older droplet build may not send yet.
 *
 * The site and the API deploy separately, so during a rollout Vercel can be a
 * build ahead of the droplet. Treating a missing optional field as fatal would
 * blank the whole dashboard over one absent column, so every field the row type
 * promises is defaulted here instead. This is what makes the type true at
 * runtime for data that crossed the gateway.
 */
function normaliseRow(row: AdminRegistrationRow): AdminRegistrationRow {
  const n = <T>(value: T | undefined, fallback: T): T =>
    value === undefined ? fallback : value;
  return {
    ...row,
    phone: n(row.phone, null),
    companyName: n(row.companyName, null),
    gstin: n(row.gstin, null),
    companyAddress: n(row.companyAddress, null),
    countryName: n(row.countryName, null),
    countryCode: n(row.countryCode, null),
    state: n(row.state, null),
    referralCode: n(row.referralCode, null),
    discountPercent: n(row.discountPercent, null),
    codeOwnerName: n(row.codeOwnerName, null),
    codeOwnerEmail: n(row.codeOwnerEmail, null),
    codeCommissionPercent: n(row.codeCommissionPercent, null),
    amountDisplay: n(row.amountDisplay, null),
    amountCharged: n(row.amountCharged, null),
    currency: n(row.currency, null),
    razorpayOrderId: n(row.razorpayOrderId, null),
    razorpayPaymentId: n(row.razorpayPaymentId, null),
    paidAt: n(row.paidAt, null),
    invoiceNo: n(row.invoiceNo, null),
    invoiceIssuedAt: n(row.invoiceIssuedAt, null),
    invoiceFy: n(row.invoiceFy, null),
    listValue: n(row.listValue, null),
    discountAmount: n(row.discountAmount, null),
    taxableValue: n(row.taxableValue, null),
    cgst: n(row.cgst, null),
    sgst: n(row.sgst, null),
    igst: n(row.igst, null),
    totalTax: n(row.totalTax, null),
    invoiceTotal: n(row.invoiceTotal, null),
    taxRatePercent: n(row.taxRatePercent, null),
    supplyType: n(row.supplyType, null),
    placeOfSupply: n(row.placeOfSupply, null),
    zeroRatedUnderLut: n(row.zeroRatedUnderLut, null),
    sessionLabel: n(row.sessionLabel, null),
    sessionStartsAt: n(row.sessionStartsAt, null),
    sessionEndsAt: n(row.sessionEndsAt, null),
    zoomWebinarId: n(row.zoomWebinarId, null),
    zoomRegistrantId: n(row.zoomRegistrantId, null),
    zoomRegisteredAt: n(row.zoomRegisteredAt, null),
    zoomAccessAttempts: n(row.zoomAccessAttempts, 0),
    zoomAccessLastAttemptAt: n(row.zoomAccessLastAttemptAt, null),
    attendedMinutes: n(row.attendedMinutes, null),
    firstJoinedAt: n(row.firstJoinedAt, null),
    attendanceSyncedAt: n(row.attendanceSyncedAt, null),
    credentialId: n(row.credentialId, null),
    certificateIssuedAt: n(row.certificateIssuedAt, null),
    certificateEarned: n(row.certificateEarned, false),
    hasJoinLink: n(row.hasJoinLink, false),
    emailTypes: n(row.emailTypes, []),
    lastEmailAt: n(row.lastEmailAt, null),
  };
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

    return { rows: rows.map(normaliseRow), error: null };
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
