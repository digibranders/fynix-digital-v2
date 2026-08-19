import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";
import { CertificateEmbed } from "../ui/CertificateEmbed";
import { CertificateTilt } from "../ui/CertificateTilt";
import { ReserveSeatButton } from "../ui/ReserveSeatButton";
import { WORKSHOP } from "../workshopDetails";
// Screen-only certificate styles. The route's A4 print rules live in a separate
// stylesheet (certificate-print.css) so they can't hijack this page's printing.
import "../../../app/pavel/certificate/certificate.css";

/** Sample identity shown on the landing-page preview (not a real graduate). */
const SAMPLE = {
  name: "Alex Morgan",
  credentialId: "FYX-SS26-0184",
};

// Headline-only takeaways: the two core deliverables followed by the two
// certificate facts. Bodies were dropped intentionally so the left column reads
// as a scannable list beside the certificate preview. An optional `note` renders
// as a muted parenthetical for the one caveat worth stating inline.
const POINTS: { label: string; note?: string }[] = [
  { label: "Three hours of live training with Pavel" },
  { label: "Slide deck and detailed notes" },
  { label: "LinkedIn-ready certificate" },
  {
    label: "Issued on completion",
    note: "minimum 30 minutes of attendance required",
  },
];

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-accent"
    >
      <path
        d="m5 10.5 3.2 3.2L15 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const CertificateShowcase: React.FC = () => {
  return (
    <section
      id="certificate"
      className="relative isolate overflow-hidden py-16 sm:py-20 bg-transparent"
    >
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-stretch lg:gap-y-12">
          {/* Copy — on desktop it fills the certificate's height so the heading
              sits level with the certificate's top edge and the bullet rows
              spread down to meet its bottom edge. */}
          <Reveal className="max-w-[520px] lg:flex lg:flex-col">
            <h2 className="text-[2.15rem] font-medium leading-[1.08] tracking-[-0.026em] text-primary sm:text-[2.65rem] lg:text-[3.05rem]">
              What you leave with,{" "}
              <span className="whitespace-nowrap font-serif italic font-medium">
                beyond the session.
              </span>
            </h2>

            <ul className="mt-8 border-t border-border lg:mt-10 lg:flex lg:flex-1 lg:flex-col lg:justify-between">
              {POINTS.map((point) => (
                <li
                  key={point.label}
                  className="flex items-center gap-4 border-b border-border py-4"
                >
                  <Check />
                  <h3 className="text-[1.05rem] sm:text-[1.1rem] font-medium leading-[1.35] text-primary">
                    {point.label}
                    {point.note && (
                      <span className="font-normal text-text-muted">
                        {" "}
                        ({point.note})
                      </span>
                    )}
                  </h3>
                </li>
              ))}
            </ul>

            <ReserveSeatButton className="mt-8 w-full sm:w-auto lg:self-start" />
          </Reveal>

          {/* Certificate preview — scaled render of the real component, matted
              on a soft cream panel with a caption, so it reads as a framed award. */}
          <Reveal delay={120}>
            <figure className="rounded-[1.75rem] bg-[#F2EBE1] p-3 sm:p-5">
              <CertificateTilt className="overflow-hidden rounded-[1rem] shadow-[0_12px_28px_-10px_rgba(12,30,46,0.30)]">
                <CertificateEmbed
                  recipientName={SAMPLE.name}
                  credentialId={SAMPLE.credentialId}
                  issueDate={WORKSHOP.dateLabel}
                />
              </CertificateTilt>
              <figcaption className="mt-5 flex items-center justify-center px-2 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-text-muted">
                A certificate to recognize your learning and commitment.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};
