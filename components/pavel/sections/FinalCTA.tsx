"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";
import { ArrowRight } from "lucide-react";
import { WORKSHOP } from "../workshopDetails";
import { usePricing } from "../PricingProvider";


export const FinalCTA: React.FC = () => {
  const { price, schedule } = usePricing();

// Split the range so the end time drops cleanly to a second line in the
// narrow essentials column.
  const [timeStart, timeEnd] = schedule.timeRange.split(" - ");

  const FACTS = [
    { label: "Date", value: schedule.dateLabel },
    {
    label: "Time",
    value: (
      <>
        {timeStart} -<br />
        {timeEnd}
      </>
    ),
  },
    { label: "Format", value: `Live on ${WORKSHOP.platform}` },
    { label: "Access", value: "Live Interactive" },
  ];


  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="reserve"
      className="relative py-20 md:py-28 bg-primary text-white overflow-hidden"
    >
      {/* Faint dot-grid texture, matching the Shift section's dark moment. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#FCFCFB 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <Container className="relative">
        <Reveal className="max-w-[760px] mx-auto text-center">
          <h2 className="text-[2.2rem] sm:text-[2.8rem] lg:text-[3.4rem] leading-[1.06] font-medium tracking-[-0.028em] text-white">
            Reserve your seat before{" "}
            <span className="font-serif italic font-normal">it&rsquo;s gone.</span>
          </h2>

          <p className="mt-6 text-[1.15rem] text-white/70 leading-[1.6] max-w-[680px] mx-auto font-normal">
            One live 3-hour intensive session with Pavel Klimakov.
          </p>

          {/* Essentials: the concrete details at the decision point. */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 max-w-[640px] mx-auto border-y border-white/10 py-8">
            {FACTS.map((f) => (
              <div key={f.label} className="text-center">
                <p className="text-[11px] uppercase tracking-[0.14em] text-accent font-semibold">
                  {f.label}
                </p>
                <p className="mt-1.5 text-[15px] text-white leading-snug">
                  {f.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-11 flex flex-col items-center gap-4">
            <button
              onClick={() => scrollTo("pricing")}
              className="inline-flex items-center gap-3 px-8 py-4 text-[15px] font-medium bg-accent text-primary rounded-full shadow-sm cta-primary hover:bg-accent-hover transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Reserve my seat, {price.display}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[13px] italic text-white/55">
              {price.display}{" "}one-time &middot; 7-day recording included &middot; instant confirmation.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};
