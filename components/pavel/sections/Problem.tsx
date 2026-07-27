"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

const PAINS = [
  {
    n: "01",
    title: "The comprehensive article that still won't rank",
    body: "You publish thorough, well-researched pieces and watch them stall on page three, while thinner competitor pages sit at the top.",
  },
  {
    n: "02",
    title: "Authority that dilutes instead of compounding",
    body: "You add more content trying to build depth, but every new post seems to weaken the site rather than strengthen it.",
  },
  {
    n: "03",
    title: "Keyword-at-a-time, while competitors map topics",
    body: "You chase individual queries with individual pages. They cover the whole topic as a structured system, and Google rewards them for it.",
  },
  {
    n: "04",
    title: "You can't explain why something ranked",
    body: "When a page finally lands, you can't tell if it was the content, the links, the internal structure, or luck. So you can't repeat it on purpose.",
  },
];

export const Problem: React.FC = () => {
  return (
    <section
      id="problem"
      className="py-24 md:py-32 border-b border-[#DDD3BC] bg-[#F4EFE3]"
    >
      <Container>
        <div className="max-w-[820px] mb-16 md:mb-20">
          <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.15rem] leading-[1.08] font-medium tracking-[-0.026em] text-[#0F0E0C]">
            You already know more about SEO than{" "}
            <span className="italic font-normal text-[#2F4B3A]">95% of the people</span>{" "}
            calling themselves SEOs.
          </h2>
          <p className="mt-8 text-[1.3rem] sm:text-[1.45rem] text-[#4A4640] leading-[1.6] max-w-[700px] font-normal">
            {/* You have read the guides, fixed the technical issues, built the
            links. Yet less experienced competitors keep ranking higher, because
            most of what people call{" "}
            <span className="italic font-normal">SEO</span> is optimising for a
            Google that no longer exists. */}
            You&apos;ve optimized your site, yet competitors stay ahead. The rules of search have changed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-12 md:gap-y-16">
          {PAINS.map((p, i) => (
            <Reveal key={p.n} delay={i * 80} className="flex gap-6">
              <span className="font-serif text-[22px] italic font-normal text-[#8B857A] leading-none pt-1 tnum shrink-0">
                {p.n}
              </span>
              <div className="space-y-3 border-l border-[#DDD3BC] pl-6 -ml-2">
                <h3 className="font-serif text-[1.4rem] sm:text-[1.55rem] leading-[1.25] font-semibold text-[#0F0E0C]">
                  {p.title}
                </h3>
                <p className="text-[16.5px] text-[#4A4640] leading-[1.65]">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 max-w-[960px] pt-10 border-t border-[#DDD3BC]">
          <p className="italic font-normal text-[1.45rem] sm:text-[1.6rem] lg:text-[1.7rem] leading-[1.35] text-[#0F0E0C] lg:whitespace-nowrap">
            &ldquo;You don&rsquo;t need another tool. You need to understand the
            machine.&rdquo;
          </p>
        </div>
      </Container>
    </section>
  );
};
