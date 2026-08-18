import type { Metadata } from "next";
import "../pavel.css";
import "./certificate.css";
import "./certificate-print.css";
import { WORKSHOP } from "@/components/pavel/workshopDetails";
import { Certificate } from "@/components/pavel/Certificate";
import { CertificateActions } from "@/components/pavel/CertificateActions";

export const metadata: Metadata = {
  title: "Certificate of Completion — Semantic SEO Masterclass | Fynix Digital",
  // Per-attendee keepsake — never index individual certificates.
  robots: { index: false, follow: false },
};

/** First value of a possibly-repeated query param. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Strip ASCII control characters, collapse whitespace, then cap the length so a
 * malformed query string can never blow out the certificate layout.
 */
function cleanText(value: string | undefined, max: number): string {
  if (!value) return "";
  return value
    .replace(/\p{Cc}+/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Credential IDs are uppercase alphanumerics + dashes only. */
function cleanCredentialId(value: string | undefined): string {
  return (value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 24);
}

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Certificate route. Personalisation is passed by query string:
 *   /pavel/certificate?name=Ada%20Lovelace&id=FYX-SS26-0184&date=5%20September%202026
 * All three fall back to sensible defaults so the page always renders a
 * complete, presentable certificate.
 */
export default async function CertificatePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const recipientName = cleanText(first(params.name), 48) || "Recipient Name";
  const credentialId = cleanCredentialId(first(params.id)) || "FYX-SS26-0000";
  const issueDate = cleanText(first(params.date), 32) || WORKSHOP.dateLabel;

  return (
    <div className="cert-page tnum">
      <div className="cert-actions">
        <CertificateActions />
      </div>
      <div className="cert-shell">
        <Certificate
          recipientName={recipientName}
          credentialId={credentialId}
          issueDate={issueDate}
        />
      </div>
    </div>
  );
}
