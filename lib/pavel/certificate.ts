import { randomBytes } from "node:crypto";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { certificates, registrations, type Certificate } from "@/lib/db/schema";
import { loadSchedule } from "@/lib/pavel/loadSchedule";

/**
 * Certificate issuance.
 *
 * A certificate is a credential, so the rule is simple: it exists only if this
 * module created it, against a registration that actually paid AND actually
 * attended. Nothing is derived from user input. The page renders a stored row
 * or nothing at all.
 */

/** Prefix shared by every credential in this cohort. */
const CREDENTIAL_PREFIX = "FYX-SS26";

/** Minutes required when nothing valid is configured. Half a three-hour session. */
const DEFAULT_ATTENDANCE_THRESHOLD_MINUTES = 90;

/**
 * Minutes a seat must be present before the workshop counts as completed.
 *
 * The line between "attended" and "dropped in". A business judgement rather
 * than a technical one, so it is configurable — lowered while testing, raised
 * for the real event.
 *
 * Parsed defensively because the deploy writes this line whether or not the
 * variable is set, so an unset variable arrives as an EMPTY STRING rather than
 * undefined. `??` does not catch that and `Number("")` is 0 — which would hand
 * a certificate to everyone who registered, including people who never joined.
 * Anything that is not a positive finite number falls back to the default.
 */
export function readThreshold(raw: string | undefined): number {
  const parsed = Number((raw ?? "").trim());
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ATTENDANCE_THRESHOLD_MINUTES;
}

export const ATTENDANCE_THRESHOLD_MINUTES = readThreshold(
  process.env.PAVEL_ATTENDANCE_MIN_MINUTES
);

/**
 * Whether a registration has earned a certificate.
 *
 * `attendedMinutes` null means attendance has not been synced yet, which is not
 * the same as having attended nothing: neither earns a certificate, but only the
 * latter is a final answer.
 */
export function hasEarnedCertificate(registration: {
  status: string;
  attendedMinutes: number | null;
}): boolean {
  if (registration.status !== "paid") return false;
  if (registration.attendedMinutes === null) return false;
  return registration.attendedMinutes >= ATTENDANCE_THRESHOLD_MINUTES;
}

/**
 * Generate an unguessable credential id, e.g. "FYX-SS26-7A3F9C21".
 *
 * Certificates are meant to be shared, so the id is not a secret. It is random
 * rather than sequential so the set cannot be enumerated, which would expose
 * other attendees' names.
 */
function generateCredentialId(): string {
  return `${CREDENTIAL_PREFIX}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export type IssueCertificateResult =
  | { status: "issued"; certificate: Certificate }
  | { status: "exists"; certificate: Certificate }
  | { status: "not_eligible"; reason: string }
  | { status: "error"; reason: string };

/**
 * Issue the certificate for a registration that has paid and attended.
 *
 * Idempotent: the unique `registration_id` means a repeat call returns the
 * existing credential rather than minting a second one. Never throws, so a
 * failure here cannot take down the caller (the post-event mailer).
 */
export async function issueCertificateForRegistration(
  db: Db,
  registrationId: string
): Promise<IssueCertificateResult> {
  try {
    const existing = await findCertificate(db, registrationId);
    if (existing) return { status: "exists", certificate: existing };

    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (!registration) {
      return { status: "error", reason: `Registration ${registrationId} not found.` };
    }

    if (!hasEarnedCertificate(registration)) {
      const detail =
        registration.status !== "paid"
          ? `status is ${registration.status}`
          : registration.attendedMinutes === null
            ? "attendance has not been synced"
            : `attended ${registration.attendedMinutes} min, needs ${ATTENDANCE_THRESHOLD_MINUTES}`;
      return {
        status: "not_eligible",
        reason: `${registration.ref}: ${detail}.`,
      };
    }

    const [certificate] = await db
      .insert(certificates)
      .values({
        registrationId: registration.id,
        credentialId: generateCredentialId(),
        recipientName: registration.name,
        // The date of the session actually attended, snapshotted so a shared
        // certificate keeps reading correctly after the next cohort runs.
        issueDateLabel: (await loadSchedule()).dateLabel,
        attendedMinutes: registration.attendedMinutes,
      })
      .returning();

    return { status: "issued", certificate };
  } catch (error) {
    // A concurrent caller may have won the race between the check and the
    // insert. The unique constraint is the real guarantee, so return theirs.
    const existing = await findCertificate(db, registrationId).catch(() => undefined);
    if (existing) return { status: "exists", certificate: existing };

    return {
      status: "error",
      reason: error instanceof Error ? error.message : "certificate issuance failed",
    };
  }
}

async function findCertificate(
  db: Db,
  registrationId: string
): Promise<Certificate | undefined> {
  const [row] = await db
    .select()
    .from(certificates)
    .where(eq(certificates.registrationId, registrationId))
    .limit(1);
  return row;
}

/**
 * Look up a certificate for public display. Returns undefined for an unknown
 * credential, which the page renders as a 404: an id that was never issued must
 * be indistinguishable from one that does not exist.
 */
export async function getCertificateByCredentialId(
  db: Db,
  credentialId: string
): Promise<Certificate | undefined> {
  const normalised = credentialId.trim().toUpperCase();
  if (!/^[A-Z0-9-]{6,32}$/.test(normalised)) return undefined;

  const [row] = await db
    .select()
    .from(certificates)
    .where(eq(certificates.credentialId, normalised))
    .limit(1);
  return row;
}

/**
 * Issue certificates for everyone who has earned one but does not have one yet.
 *
 * Ordered by payment time and run sequentially, mirroring the invoice backfill,
 * so a batch issued after the event is deterministic. Safe to run repeatedly.
 */
export async function issueEarnedCertificates(
  db: Db,
  limit = 500
): Promise<{ issued: number; skipped: number; failed: number }> {
  const candidates = await db
    .select({
      id: registrations.id,
      status: registrations.status,
      attendedMinutes: registrations.attendedMinutes,
    })
    .from(registrations)
    .leftJoin(certificates, eq(certificates.registrationId, registrations.id))
    .where(and(eq(registrations.status, "paid"), isNull(certificates.id)))
    .orderBy(asc(registrations.paidAt))
    .limit(limit);

  let issued = 0;
  let skipped = 0;
  let failed = 0;

  for (const candidate of candidates) {
    if (!hasEarnedCertificate(candidate)) {
      skipped += 1;
      continue;
    }
    const result = await issueCertificateForRegistration(db, candidate.id);
    if (result.status === "issued") issued += 1;
    else if (result.status === "error") {
      console.error("[pavel/certificate] issuance failed", result.reason);
      failed += 1;
    } else skipped += 1;
  }

  return { issued, skipped, failed };
}
