"use client";

import React, { useState } from "react";
import { Check, Copy, Printer, Share2 } from "lucide-react";

/**
 * LinkedIn glyph. Inline rather than from lucide, which dropped brand icons —
 * the same path the site footer already uses.
 */
function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.978 0 1.778-.773 1.778-1.729V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/**
 * Share and credential actions for an issued certificate.
 *
 * "Add to LinkedIn profile" uses LinkedIn's own documented Add-to-Profile deep
 * link, the same one Coursera, Google and AWS use. It opens LinkedIn with the
 * Licenses & Certifications form pre-filled; the member reviews and saves it
 * themselves. Nothing is posted on anyone's behalf, no API key or partner
 * agreement is involved, and we never touch their account.
 *
 * The claim is honest as well as sanctioned: a credential exists only where a
 * seat was paid for and the attendance threshold was met, `certUrl` points at a
 * public page anyone can check, and the wording says "Certificate of
 * Completion" rather than implying an accredited qualification.
 */

const WORKSHOP_NAME = "Semantic SEO Masterclass";

export type CertificateShareProps = {
  credentialId: string;
  recipientName: string;
  /** Absolute, public URL of this certificate. */
  certificateUrl: string;
  /** ISO instant it was issued. Null on older records; the date is then omitted. */
  issuedAt: string | null;
  /**
   * LinkedIn's numeric company id for Fynix Digital, if configured. With it the
   * entry links to the company page and carries its logo; without it LinkedIn
   * falls back to a plain organisation name, which still saves correctly.
   */
  organizationId?: string;
  organizationName: string;
};

/** LinkedIn's Add-to-Profile deep link for a certification. */
function addToProfileUrl(p: CertificateShareProps): string {
  const url = new URL("https://www.linkedin.com/profile/add");
  url.searchParams.set("startTask", "CERTIFICATION");
  url.searchParams.set("name", WORKSHOP_NAME);
  // Prefer the numeric id: it links the entry to the company page. The name is
  // the documented fallback when no id is configured.
  if (p.organizationId) url.searchParams.set("organizationId", p.organizationId);
  else url.searchParams.set("organizationName", p.organizationName);

  if (p.issuedAt) {
    const issued = new Date(p.issuedAt);
    if (!Number.isNaN(issued.getTime())) {
      url.searchParams.set("issueYear", String(issued.getUTCFullYear()));
      // LinkedIn expects 1-12; getUTCMonth is zero-based.
      url.searchParams.set("issueMonth", String(issued.getUTCMonth() + 1));
    }
  }

  // No expiry: a completion certificate does not lapse, so the entry stays
  // permanent rather than showing an expiry date nobody set.
  url.searchParams.set("certUrl", p.certificateUrl);
  url.searchParams.set("certId", p.credentialId);
  return url.toString();
}

const BUTTON =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export const CertificateShare: React.FC<CertificateShareProps> = (props) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(props.certificateUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused (permissions, insecure origin). Falling
      // back to a prompt still lets the person get the link out.
      window.prompt("Copy your certificate link:", props.certificateUrl);
    }
  };

  // `navigator.share` is read on click, never during render: it does not exist
  // on the server, and branching the markup on it would break hydration.
  const nativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      void copyLink();
      return;
    }
    setSharing(true);
    try {
      await navigator.share({
        title: `${WORKSHOP_NAME} — Certificate of Completion`,
        text: `${props.recipientName} completed the ${WORKSHOP_NAME}.`,
        url: props.certificateUrl,
      });
    } catch {
      // A dismissed share sheet rejects. Nothing to report.
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <a
        href={addToProfileUrl(props)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BUTTON} bg-[#0a66c2] text-white hover:bg-[#0b5aa8] focus-visible:outline-[#0a66c2]`}
      >
        <LinkedInMark />
        Add to LinkedIn profile
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          props.certificateUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BUTTON} border border-border bg-white text-primary hover:bg-background-soft focus-visible:outline-primary`}
      >
        <Share2 className="h-4 w-4" strokeWidth={1.75} />
        Share as a post
      </a>

      <button
        type="button"
        onClick={() => void copyLink()}
        className={`${BUTTON} border border-border bg-white text-primary hover:bg-background-soft focus-visible:outline-primary`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" strokeWidth={2} />
        ) : (
          <Copy className="h-4 w-4" strokeWidth={1.75} />
        )}
        {copied ? "Link copied" : "Copy link"}
      </button>

      {/* Native share sheet, where the device has one. Falls back to copying. */}
      <button
        type="button"
        onClick={() => void nativeShare()}
        disabled={sharing}
        className={`${BUTTON} border border-border bg-white text-primary hover:bg-background-soft focus-visible:outline-primary sm:hidden`}
      >
        <Share2 className="h-4 w-4" strokeWidth={1.75} />
        Share
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        title="Opens your browser's print dialog. Choose “Save as PDF” to download a copy."
        className={`${BUTTON} bg-[#e9af88] font-semibold text-[#0c1e2e] hover:bg-[#f0c3a4] focus-visible:outline-[#e9af88]`}
      >
        <Printer className="h-4 w-4" strokeWidth={2} />
        Save or print
      </button>
    </div>
  );
};
