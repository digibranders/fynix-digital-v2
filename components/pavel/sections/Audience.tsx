"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

const FOR = [
  "You are a practising SEO, content strategist, or site owner who already knows the basics.",
  "You are tired of tactics that work sometimes, and want a system that explains why.",
  "You want to rank in competitive niches without out-spending everyone on links.",
  "You are willing to do real work. This rewards depth, not shortcuts.",
];

const NOT_FOR = [
  "You are looking for quick hacks or ten ranking tricks.",
  "You want a done-for-you button instead of a method to master.",
  "You have never run an SEO project and need fundamentals first.",
];

export const Audience: React.FC = () => {
  return (
    <section
      id="audience"
      className="py-16 md:py-20 pv-seam bg-background-soft"
    >
      <Container>
        <div className="max-w-[820px] mb-16 md:mb-20">
          <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-primary">
            An honest word,{" "}
            <br className="sm:hidden" />
            <span className="font-serif italic font-medium">before you register.</span>
          </h2>
          <p className="mt-6 text-[1.2rem] text-text-muted leading-[1.65] max-w-[680px] font-normal">
            This workshop is not for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
          <Reveal>
            <p className="text-[1.45rem] italic font-normal text-primary pb-4 pv-seam">
              This is for you if
            </p>
            <ul className="mt-6 space-y-5">
              {FOR.map((item, i) => (
                <li key={i} className="flex gap-4 text-[15.5px] leading-[1.6] min-h-[3.2em]">
                  <span className="font-serif text-[16px] italic font-normal text-accent tnum pt-0.5 shrink-0 min-w-[24px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-primary">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-[1.45rem] italic font-normal text-text-muted pb-4 pv-seam">
              This is not for you if
            </p>
            <ul className="mt-6 space-y-5">
              {NOT_FOR.map((item, i) => (
                <li key={i} className="flex gap-4 text-[15.5px] leading-[1.6] min-h-[3.2em]">
                  <span className="font-serif text-[16px] italic font-normal text-text-muted tnum pt-0.5 shrink-0 min-w-[24px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};
