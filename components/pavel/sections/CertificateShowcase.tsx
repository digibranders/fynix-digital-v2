import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";
import { CertificateEmbed } from "../ui/CertificateEmbed";
import { WORKSHOP } from "../workshopDetails";
// Screen-only certificate styles. The route's A4 print rules live in a separate
// stylesheet (certificate-print.css) so they can't hijack this page's printing.
import "../../../app/pavel/certificate/certificate.css";

/** Sample identity shown on the landing-page preview (not a real graduate). */
const SAMPLE = {
  name: "Alex Morgan",
  credentialId: "FYX-SS26-0184",
};

const POINTS = [
  {
    title: "Ready for LinkedIn",
    body: "Add it to your profile's Licenses & Certifications and your Featured section in a couple of clicks.",
  },
  {
    title: "Issued on completion",
    body: "Attend the full live session and your personalised certificate is generated the same day.",
  },
];

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
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
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Copy */}
          <Reveal className="max-w-[520px]">
            <h2 className="text-[2.15rem] font-medium leading-[1.08] tracking-[-0.026em] text-primary sm:text-[2.5rem] lg:text-[2.85rem]">
              Leave with proof,{" "}
              <span className="whitespace-nowrap font-serif italic font-medium">
                not just knowledge.
              </span>
            </h2>

            <ul className="mt-8 space-y-4">
              {POINTS.map((p) => (
                <li key={p.title} className="flex gap-3.5">
                  <Check />
                  <div className="space-y-1">
                    <h3 className="font-serif text-[1.1rem] font-semibold leading-[1.3] text-primary">
                      {p.title}
                    </h3>
                    <p className="text-[14.5px] leading-[1.6] text-text-muted">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Certificate preview — scaled render of the real component */}
          <Reveal delay={120}>
            <div className="[transform:perspective(1600px)_rotateY(-4deg)] transition-transform duration-500 ease-out hover:[transform:perspective(1600px)_rotateY(0deg)]">
              <CertificateEmbed
                recipientName={SAMPLE.name}
                credentialId={SAMPLE.credentialId}
                issueDate={WORKSHOP.dateLabel}
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};
