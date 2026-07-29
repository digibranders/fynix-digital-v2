"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

const PROMISES = [
  {
    body: "Map topics the way Google&rsquo;s index sees them.",
  },
  {
    body: "Compound authority instead of leaking it.",
  },
  {
    body: "Engineer relevance with entities, not density.",
  },
  {
    body: "Read the SERP and patents to know what&rsquo;s next.",
  },
];

export const Shift: React.FC = () => {
  return (
    <section
      id="shift"
      className="relative py-16 md:py-20 bg-primary overflow-hidden"
    >
      {/* Faint dot-grid texture, echoing the Hero and final CTA so the dark
          "moment" reads as part of the same system, not a bolted-on band. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#FFFFFF 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <Container className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">
          <div className="lg:col-span-6 lg:sticky lg:top-32">
            <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-white">
              Make your site{" "}
              <span className="font-serif italic font-medium">
                cheaper to retrieve
              </span>{" "}
              and more trustworthy.
            </h2>

            <p className="mt-8 text-[1.2rem] text-white/70 leading-[1.65] max-w-[520px] font-normal">
              <span className="italic font-normal text-white">
                Koray Tuğberk Gübür
              </span>
              &rsquo;s framework, proven on low-budget sites and simple enough
              for Monday morning.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-8 lg:pt-2">
            <p className="text-[16px] italic font-normal text-white/60 pb-3 pv-seam-bd">
              What you will be able to do
            </p>

            <ul className="space-y-8">
              {PROMISES.map((item, i) => (
                <li key={i}>
                  <Reveal delay={i * 80} className="flex gap-6">
                    <span className="font-serif text-[18px] italic font-normal text-accent pt-1 tnum shrink-0 min-w-[28px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p
                      className="text-[1.05rem] text-white/90 leading-[1.55] flex-1"
                      dangerouslySetInnerHTML={{ __html: item.body }}
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
};
