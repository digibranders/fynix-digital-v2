"use client";

import React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRight } from "lucide-react";
import { WORKSHOP } from "../workshopDetails";
import { usePricing } from "../PricingProvider";

export const Hero: React.FC = () => {
  const { price } = usePricing();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative pt-28 pb-20 md:pt-36 md:pb-24 bg-black text-white overflow-hidden"
    >
      {/* Ambient background blur accent */}
      <div
        aria-hidden
        className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #b1786c 0%, transparent 70%)" }}
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center">
          {/* LEFT: Text Column */}
          <div className="hero-rise order-2 lg:order-1 lg:col-span-7 space-y-8">
            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] tracking-[-0.005em]">
              <span className="text-white/70">{WORKSHOP.dateLabel}</span>
              <span aria-hidden className="text-white/40">
                /
              </span>
              <span className="text-white/70">
                3 hours on {WORKSHOP.platform}
              </span>
            </div>

            <h1 className="text-[2.4rem] leading-[1.04] sm:text-[3.25rem] sm:leading-[1.02] lg:text-[3.85rem] lg:leading-[1.02] font-medium tracking-[-0.028em] text-white">
              Stop guessing what Google wants.{" "}
              <span className="font-serif italic font-normal text-[#E8B087]">
                Learn how Google decides
              </span>{" "}
              which <span className="lg:whitespace-nowrap">websites deserve to rank.</span>
            </h1>

            <p className="text-[1.2rem] sm:text-[1.3rem] text-white/80 leading-[1.55] max-w-[560px] font-normal">
              Google rewards websites that thoroughly cover a topic, not just pages with the right keywords.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button size="lg" variant="primary" onClick={() => scrollTo("pricing")}>
                Reserve my seat, {price.display}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("curriculum")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/15"
              >
                See the curriculum
              </Button>
            </div>
          </div>

          {/* RIGHT: Image 1 with Seamless Transition into Pure Black (No Borders) */}
          <div className="hero-rise-delayed order-1 lg:order-2 lg:col-span-5">
            <div className="relative mx-auto max-w-[460px] lg:max-w-none h-[420px] sm:h-[480px] lg:h-[540px] w-full overflow-hidden">
              <Image
                src="/pavel/pavel-seo-vibes-summit-2025.webp"
                alt="Pavel Klimakov presenting on stage at SEO Vibes Summit"
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-[center_22%] scale-105"
              />

              {/* Bottom and left edge gradient blend into black background — top stays 100% clear */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, #000000 0%, transparent 40%), linear-gradient(to right, #000000 0%, transparent 20%)",
                }}
              />

              {/* Instructor Name Label */}
              <div className="absolute left-6 bottom-6 z-10 text-white">
                <p className="text-[13px] italic font-normal text-white/75">
                  Instructor
                </p>
                <p className="text-[1.5rem] leading-[1.05] font-semibold text-white tracking-[-0.02em] mt-0.5">
                  Pavel Klimakov
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
