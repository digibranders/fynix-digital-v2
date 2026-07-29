"use client";

import React, { useState } from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";
import { Plus, Minus } from "lucide-react";

// Client video testimonials from Pavel's own site (serp.science): the 3 from
// "Client Testimonials from Consultations" plus 6 more revealed by the
// "Testimonials from a previous era of SEO" button. Privacy-enhanced
// youtube-nocookie embeds, lazy-loaded. First 3 show; the rest sit behind
// "View more".
const TESTIMONIALS = [
  // Client Testimonials from Consultations
  "Dmi4Yw5KhvA",
  "VALShmkWUks",
  "pRtFeph_g5o",
  // Testimonials from a previous era of SEO (shown in front)
  "S2aZIwufb80",
  "xy5hpDSZyWE",
  "4mdaoeYdQ_k",
  // Testimonials from a previous era of SEO (behind "View more")
  "XYADdFMaArw",
  "xJcifwOsi0U",
  "3wUrngg9GRQ",
];

const INITIAL_COUNT = 3;

export const Testimonials: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? TESTIMONIALS : TESTIMONIALS.slice(0, INITIAL_COUNT);

  return (
    <section
      id="testimonials"
      className="py-16 md:py-20 pv-seam bg-background-soft"
    >
      <Container>
        <div className="max-w-[820px] mb-16 md:mb-20">
          <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-primary">
            {/* What clients say,{" "}
            <span className="italic font-normal text-accent">
              in their own words.
            </span> */}
            Experiences That Speak{" "}
            <span className="italic font-normal text-accent whitespace-nowrap">
              for Themselves.
            </span>
          </h2>
          <p className="mt-6 text-[1.2rem] text-text-muted leading-[1.65] max-w-[680px] font-normal">
            Video testimonials from Pavel&rsquo;s private SEO consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
          {visible.map((id, i) => (
            <Reveal key={id} delay={(i % 3) * 80}>
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-background-soft shadow-[0_1px_2px_rgba(15,14,12,0.05),0_20px_40px_-28px_rgba(15,14,12,0.22)]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  title={`Client testimonial ${i + 1}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </Reveal>
          ))}
        </div>

        {TESTIMONIALS.length > INITIAL_COUNT && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="inline-flex items-center gap-2 px-6 py-3 text-[15px] font-medium text-primary bg-white border border-border rounded-full hover:bg-background-soft cta-secondary transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {showAll ? (
                <>
                  View less
                  <Minus className="w-4 h-4" strokeWidth={1.75} />
                </>
              ) : (
                <>
                  View more
                  <Plus className="w-4 h-4" strokeWidth={1.75} />
                </>
              )}
            </button>
          </div>
        )}
      </Container>
    </section>
  );
};
