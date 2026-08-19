import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { certificates, registrations } from "@/lib/db/schema";

/**
 * Finding an issued certificate from what the holder remembers.
 *
 * Two ways in, and they are not equally safe:
 *
 *   - By credential id. The id is random and unguessable, so holding one IS the
 *     proof; this is the same capability a shared link carries.
 *   - By email. This one is a lookup key anybody can type, so it answers a
 *     question the rest of the system deliberately does not: whether a given
 *     person attended. The endpoint that calls this therefore screens for bots
 *     and rate limits, and callers must never report WHICH field failed.
 *
 * Only the credential id is ever returned. The caller redirects to the
 * certificate page, which decides for itself what is safe to render, so no name
 * or attendance detail passes through this path.
 */

export type CertificateLookupResult = { credentialId: string } | null;

/** Look up by credential id, normalised the way the ids are minted (uppercase). */
export async function findByCredentialId(
  db: Db,
  rawId: string
): Promise<CertificateLookupResult> {
  const credentialId = rawId.trim().toUpperCase();
  if (!credentialId) return null;

  const [row] = await db
    .select({ credentialId: certificates.credentialId })
    .from(certificates)
    .where(eq(certificates.credentialId, credentialId))
    .limit(1);

  return row ?? null;
}

/**
 * Look up by the email the seat was bought with.
 *
 * Compared case-insensitively because registration lower-cases on the way in
 * but older rows may not have. Returns the NEWEST certificate: someone who
 * attended twice has two, and the most recent is the one they are looking for.
 */
export async function findByEmail(
  db: Db,
  rawEmail: string
): Promise<CertificateLookupResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;

  const [row] = await db
    .select({ credentialId: certificates.credentialId })
    .from(certificates)
    .innerJoin(registrations, eq(registrations.id, certificates.registrationId))
    .where(
      and(
        sql`lower(${registrations.email}) = ${email}`,
        // A certificate only exists against a paid seat, but this makes the
        // guarantee explicit rather than inherited.
        eq(registrations.status, "paid"),
        isNotNull(certificates.credentialId)
      )
    )
    .orderBy(desc(certificates.issuedAt))
    .limit(1);

  return row ?? null;
}

/**
 * Resolve whichever identifier was supplied.
 *
 * The credential id wins when both are given: it is the stronger claim, and it
 * avoids returning a different person's certificate when the two disagree.
 */
export async function lookupCertificate(
  db: Db,
  input: { credentialId?: string | null; email?: string | null }
): Promise<CertificateLookupResult> {
  if (input.credentialId?.trim()) {
    return findByCredentialId(db, input.credentialId);
  }
  if (input.email?.trim()) {
    return findByEmail(db, input.email);
  }
  return null;
}
