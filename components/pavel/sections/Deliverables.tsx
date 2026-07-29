"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import { Container } from "../ui/Container";

const ITEMS = [
  {
    n: "01",
    title: "Three hours of live training with Pavel",
    body: "The full live workshop on Zoom, plus a Q&amp;A where you can bring your own site or a client&rsquo;s.",
  },
  {
    n: "02",
    title: "Workbook and topical map template",
    body: "The exact template Pavel uses to map a topic before writing. Yours to keep for every project after.",
  },
  {
    n: "03",
    title: "Slide deck and detailed notes",
    body: "The full slide deck and detailed notes, sent to every attendee after the session.",
  },
];

export const Deliverables: React.FC = () => {
  return (
    <section
      id="deliverables"
      className="relative isolate overflow-hidden py-16 md:py-20 bg-transparent"
    >
      <PreFooterBackdrop />
      <Container className="relative">
        <div className="max-w-[820px] mb-16 md:mb-20">
          <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-primary">
            What you leave with,{" "}
            <span className="font-serif italic font-medium whitespace-nowrap">beyond the session.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14 max-w-[1080px]">
          {ITEMS.map((it, i) => (
            <Reveal key={it.n} delay={i * 80} className="flex gap-6">
              <span className="text-[22px] italic font-normal text-accent pt-1 tnum shrink-0 min-w-[36px]">
                {it.n}
              </span>
              <div className="space-y-2.5 border-l border-border pl-6 -ml-2">
                <h3 className="font-serif text-[1.25rem] leading-[1.25] font-semibold text-primary">
                  {it.title}
                </h3>
                <p
                  className="text-[15.5px] text-text-muted leading-[1.65]"
                  dangerouslySetInnerHTML={{ __html: it.body }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
};
