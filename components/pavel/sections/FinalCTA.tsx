"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";
import { ArrowRight } from "lucide-react";

export const FinalCTA: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-28 md:py-40 bg-[#1A1815] text-[#F4EFE3] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#F4EFE3 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <Container className="relative">
        <Reveal className="max-w-[860px]">
          <h2 className="text-[2.4rem] sm:text-[3.15rem] lg:text-[3.9rem] leading-[1.05] font-medium tracking-[-0.028em] text-[#F4EFE3]">
            The SEOs who win the next few years won&rsquo;t have the biggest
            budgets.{" "}
            <span className="italic font-normal text-[#C9C0A6]">
              They&rsquo;ll understand how search actually reads the web.
            </span>
          </h2>

          <p className="mt-10 text-[1.25rem] text-[#C9C0A6] leading-[1.55] max-w-[620px] italic font-normal">
            Spend one afternoon learning the system, and stop guessing for good.
          </p>

          <div className="mt-12">
            <button
              onClick={() => scrollTo("pricing")}
              className="inline-flex items-center gap-2.5 px-8 py-4 text-[15px] font-medium bg-[#F4EFE3] text-[#0F0E0C] rounded-[10px] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4EFE3]"
            >
              Reserve my seat, $79
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};
