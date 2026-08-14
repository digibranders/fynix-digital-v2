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
      className="relative overflow-hidden py-20 md:py-28 pv-seam-bd bg-primary text-white"
    >
      {/* Faint dot-grid texture — the same dark-moment treatment used by the
          Shift and final-CTA sections. Flipping this section to deep navy makes
          the honest-word disclaimer read as a deliberate "stop and read" beat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#FCFCFB 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <Container className="relative">
        <div className="max-w-[820px] mb-16 md:mb-20">
          <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-white">
            An honest word,{" "}
            <br className="sm:hidden" />
            <span className="font-serif italic font-medium text-[#e9af88]">
              before you register.
            </span>
          </h2>
          <p className="mt-7 text-[1.4rem] sm:text-[1.6rem] text-white/75 leading-[1.55] max-w-[680px] font-normal">
            This workshop is not for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
          <Reveal>
            <p className="text-[1.45rem] italic font-normal text-white pb-4 pv-seam-bd">
              This is for you if
            </p>
            <ul className="mt-6 space-y-5">
              {FOR.map((item, i) => (
                <li key={i} className="flex gap-4 text-[19.5px] leading-[1.6] min-h-[3.2em]">
                  <span className="font-serif text-[20px] italic font-normal text-accent tnum pt-0.5 shrink-0 min-w-[24px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-[1.45rem] italic font-normal text-white/55 pb-4 pv-seam-bd">
              This is not for you if
            </p>
            <ul className="mt-6 space-y-5">
              {NOT_FOR.map((item, i) => (
                <li key={i} className="flex gap-4 text-[19.5px] leading-[1.6] min-h-[3.2em]">
                  <span className="font-serif text-[20px] italic font-normal text-white/40 tnum pt-0.5 shrink-0 min-w-[24px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-white/55">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};
