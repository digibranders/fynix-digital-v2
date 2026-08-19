import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../pavel.css";
import "../certificate.css";
import "../certificate-print.css";
import { loadCertificate } from "@/lib/pavel/certificateView";
import { loadSchedule } from "@/lib/pavel/loadSchedule";
import { Certificate } from "@/components/pavel/Certificate";
import { CertificateShare } from "@/components/pavel/CertificateShare";
import { PricingProvider } from "@/components/pavel/PricingProvider";
import { Navbar } from "@/components/pavel/sections/Navbar";
import { Footer } from "@/components/pavel/sections/Footer";
import { siteConfig } from "@/lib/content";

export const runtime = "nodejs";
// Reads the database per request; a credential issued a moment ago must resolve.
export const dynamic = "force-dynamic";

const WORKSHOP_NAME = "Semantic SEO Masterclass";

/**
 * Per-certificate metadata.
 *
 * `robots: noindex` stays: a credential is meant to be shared with the people
 * its holder chooses, not to surface in a search for their name. That is
 * independent of Open Graph, which is what makes the link render as a card when
 * they do share it — without these tags a LinkedIn post shows a bare URL.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}): Promise<Metadata> {
  const { credentialId } = await params;
  const certificate = await loadCertificate(credentialId);

  const title = certificate
    ? `${certificate.recipientName} — Certificate of Completion, ${WORKSHOP_NAME}`
    : `Certificate of Completion — ${WORKSHOP_NAME} | Fynix Digital`;
  const description = certificate
    ? `${certificate.recipientName} completed the live ${WORKSHOP_NAME} with Pavel Klimakov. Credential ${certificate.credentialId}, issued by Fynix Digital.`
    : "Verify a Semantic SEO Masterclass certificate issued by Fynix Digital.";

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteConfig.url}/pavel/certificate/${encodeURIComponent(credentialId)}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

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
 *
 * It now carries the workshop's own header and footer rather than floating on a
 * bare canvas: someone arriving from a shared link lands on a page that is
 * visibly part of Fynix, with a way back to the workshop. Both are hidden when
 * the sheet is printed.
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
  const [certificate, schedule] = await Promise.all([
    loadCertificate(credentialId),
    // The navbar is shared with the landing page and reads the live schedule.
    loadSchedule(),
  ]);

  // An id that was never issued is indistinguishable from one that does not
  // exist, so probing tells an attacker nothing.
  if (!certificate) notFound();

  const certificateUrl = `${siteConfig.url}/pavel/certificate/${encodeURIComponent(
    certificate.credentialId
  )}`;

  return (
    <PricingProvider initialCountry="REST" schedule={schedule}>
      <div className="min-h-screen bg-background-soft text-primary tnum">
        {/* Minimal: this page has none of the landing sections the full navbar
            scrolls to, and its visitor is here for a credential, not a seat. */}
        <Navbar minimal />
        <main className="cert-main">
          <div className="cert-page">
            <div className="cert-shell">
              <Certificate
                recipientName={certificate.recipientName}
                credentialId={certificate.credentialId}
                issueDate={certificate.issueDateLabel}
              />
            </div>
          </div>

          <div className="cert-toolbar">
            <CertificateShare
              credentialId={certificate.credentialId}
              recipientName={certificate.recipientName}
              certificateUrl={certificateUrl}
              issuedAt={certificate.issuedAt ?? null}
              organizationId={siteConfig.linkedInOrgId}
              organizationName={siteConfig.name}
            />
            <p className="cert-toolbar__note">
              Credential{" "}
              <span className="cert-toolbar__id">{certificate.credentialId}</span>{" "}
              &middot; anyone with this link can verify it.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </PricingProvider>
  );
}
