"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

const ITEMS = [
  {
    n: "01",
    title: "Three hours of live training with Pavel",
    body: "Full live workshop over Zoom, including a live Q&amp;A window where you can bring your own site or client site to the discussion.",
  },
  {
    n: "02",
    title: "Workbook and topical map template",
    body: "The exact template Pavel uses to map a topic before writing a single article. Yours to take into every project after.",
  },
  {
    n: "03",
    title: "Slide deck and detailed notes",
    body: "The full slide deck and comprehensive notes from the session, sent to attendees after the workshop.",
  },
];

export const Deliverables: React.FC = () => {
  return (
    <section
      id="deliverables"
      className="py-24 md:py-32 border-b border-[#DDD3BC] bg-[#F4EFE3]"
    >
      <Container>
        <div className="max-w-[820px] mb-16 md:mb-20">
          <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-[#0F0E0C]">
            What you leave with,{" "}
            <span className="italic font-normal text-[#2F4B3A]">beyond the session.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14 max-w-[1080px]">
          {ITEMS.map((it, i) => (
            <Reveal key={it.n} delay={i * 80} className="flex gap-6">
              <span className="text-[22px] italic font-normal text-[#2F4B3A] pt-1 tnum shrink-0 min-w-[36px]">
                {it.n}
              </span>
              <div className="space-y-2.5 border-l border-[#DDD3BC] pl-6 -ml-2">
                <h3 className="font-serif text-[1.25rem] leading-[1.25] font-semibold text-[#0F0E0C]">
                  {it.title}
                </h3>
                <p
                  className="text-[15.5px] text-[#4A4640] leading-[1.65]"
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
