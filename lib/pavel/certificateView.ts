import { getDb } from "@/lib/db/client";
import { getCertificateByCredentialId } from "@/lib/pavel/certificate";

/**
 * Reading a certificate for public display, from wherever the data lives.
 *
 * The certificate page is served by the marketing site, which has no database,
 * while Postgres sits on the droplet. So this reads directly where a database is
 * reachable (the droplet and local dev) and falls back to the droplet's public
 * certificate endpoint otherwise.
 *
 * Without this the page 404s on the very host the certificate email links to,
 * which is how a shared credential turns into a dead link.
 */

export interface CertificateView {
  credentialId: string;
  recipientName: string;
  issueDateLabel: string;
}

function isCertificateView(value: unknown): value is CertificateView {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.credentialId === "string" &&
    typeof row.recipientName === "string" &&
    typeof row.issueDateLabel === "string"
  );
}

export async function loadCertificate(
  credentialId: string
): Promise<CertificateView | null> {
  const db = getDb();

  if (db) {
    const certificate = await getCertificateByCredentialId(db, credentialId);
    if (!certificate) return null;
    return {
      credentialId: certificate.credentialId,
      recipientName: certificate.recipientName,
      issueDateLabel: certificate.issueDateLabel,
    };
  }

  const origin = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
  if (!origin) {
    console.error(
      "[pavel/certificate] no database and no NEXT_PUBLIC_API_BASE_URL; cannot resolve credentials."
    );
    return null;
  }

  try {
    const response = await fetch(
      `${origin}/api/pavel/certificate/${encodeURIComponent(credentialId)}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    return isCertificateView(payload) ? payload : null;
  } catch (error) {
    console.error("[pavel/certificate] lookup failed", error);
    return null;
  }
}
