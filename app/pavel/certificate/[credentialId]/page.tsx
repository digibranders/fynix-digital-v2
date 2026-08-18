import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../pavel.css";
import "../certificate.css";
import "../certificate-print.css";
import { loadCertificate } from "@/lib/pavel/certificateView";
import { Certificate } from "@/components/pavel/Certificate";
import { CertificateActions } from "@/components/pavel/CertificateActions";

export const runtime = "nodejs";
// Reads the database per request; a credential issued a moment ago must resolve.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificate of Completion — Semantic SEO Masterclass | Fynix Digital",
  // Per-attendee keepsake — never index individual certificates.
  robots: { index: false, follow: false },
};

/**
 * A real, issued certificate.
 *
 * Everything rendered comes from the stored `certificates` row, so a credential
 * exists only if the pipeline issued it against a registration that paid and
 * attended. Nothing is taken from the URL beyond the id used to look it up,
 * which is why this replaced the old query-string page: that one would render
 * any name a visitor typed, which for a paid credential is forgery by design.
 *
 * The page is deliberately public. A certificate is meant to be shared and
 * verified by employers, so the credential id is unguessable rather than secret.
 */
export default async function IssuedCertificatePage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = await params;

  // Read from Postgres where it is reachable, otherwise from the droplet's
  // public certificate endpoint. This page is served by the marketing site,
  // which has no database, and that is exactly the host the certificate email
  // links to.
  const certificate = await loadCertificate(credentialId);

  // An id that was never issued is indistinguishable from one that does not
  // exist, so probing tells an attacker nothing.
  if (!certificate) notFound();

  return (
    <div className="cert-page tnum">
      <div className="cert-actions">
        <CertificateActions />
      </div>
      <div className="cert-shell">
        <Certificate
          recipientName={certificate.recipientName}
          credentialId={certificate.credentialId}
          issueDate={certificate.issueDateLabel}
        />
      </div>
    </div>
  );
}
