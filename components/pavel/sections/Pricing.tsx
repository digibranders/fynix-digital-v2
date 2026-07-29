"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRight, Check, X } from "lucide-react";
import { WORKSHOP } from "../workshopDetails";

const INCLUDED = [
  "Three hours live with Pavel, on Zoom",
  "Live Q&amp;A during the session",
  "Workbook and topical map template",
  "Full slide deck and detailed notes",
  "A repeatable process you can apply the same week",
];

const NOT_INCLUDED = [
  "Session recording (this is a live-only event)",
  "Refunds if you cannot attend live",
];

export const Pricing: React.FC = () => {
  return (
    <section
      id="pricing"
      className="py-16 md:py-20 pv-seam bg-background-soft"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.15rem] leading-[1.08] font-medium tracking-[-0.026em] text-primary">
              One seat.{" "}
              <span className="font-serif italic font-medium whitespace-nowrap">
                One price.
              </span>
            </h2>
            <p className="mt-6 text-[1.2rem] text-text-muted leading-[1.65] max-w-[460px] font-normal">
              One semantic SEO win. One client retained, one topic you finally
              dominate, one project that compounds for years. It pays for this
              many times over.
            </p>
          </div>

          <Reveal className="lg:col-span-7">
            <div className="bg-white border border-border rounded-[16px] shadow-[0_1px_2px_rgba(15,14,12,0.04),0_24px_50px_-28px_rgba(15,14,12,0.24)] overflow-hidden">
              <div className="px-8 pt-9 pb-8 md:px-12 md:pt-10 md:pb-10">
                <div className="flex items-start justify-between gap-6 pb-8 pv-seam">
                  <div>
                    <p className="font-serif text-[1.75rem] sm:text-[2rem] font-semibold text-primary leading-[1.1]">
                      Workshop seat
                    </p>
                    <p className="text-[15px] italic font-normal text-text-muted mt-2">
                      Live on {WORKSHOP.platform}, {WORKSHOP.dateLabel},{" "}
                      {WORKSHOP.time} ({WORKSHOP.timezone}).
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="font-serif text-[3rem] sm:text-[3.5rem] font-semibold text-primary leading-none tnum">
                        $79
                      </span>
                      <span className="text-[13px] text-text-muted">USD</span>
                    </div>
                    <p className="text-[12.5px] italic font-normal text-text-muted mt-2">
                      one-time
                    </p>
                  </div>
                </div>

                <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div>
                    <p className="text-[15px] italic font-normal text-text-muted mb-4">
                      Included
                    </p>
                    <ul className="space-y-3">
                      {INCLUDED.map((it, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-[14.5px] text-primary leading-[1.55]"
                        >
                          <Check
                            className="w-4 h-4 text-accent mt-1 shrink-0"
                            strokeWidth={1.75}
                          />
                          <span dangerouslySetInnerHTML={{ __html: it }} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[15px] italic font-normal text-text-muted mb-4">
                      Not included
                    </p>
                    <ul className="space-y-3">
                      {NOT_INCLUDED.map((it, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-[14.5px] text-text-muted leading-[1.55]"
                        >
                          <X
                            className="w-4 h-4 text-text-muted mt-1 shrink-0"
                            strokeWidth={1.75}
                          />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-9 mt-8 pv-seam-t">
                  <Button size="lg" variant="primary" className="w-full">
                    Reserve my seat, $79
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-center text-[13px] italic font-normal text-text-muted mt-4">
                    Only {WORKSHOP.seats} seats. We may extend depending on
                    demand.
                  </p>
                  <p className="text-center text-[12px] font-normal text-text-muted mt-2">
                    Live-only · no recording · no refunds for missed sessions.{" "}
                    <a
                      href="/terms"
                      className="underline decoration-[#565D64]/40 underline-offset-2 hover:text-text-muted hover:decoration-[#565D64]"
                    >
                      Workshop terms
                    </a>
                    .
                  </p>
                </div>
              </div>

            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};
