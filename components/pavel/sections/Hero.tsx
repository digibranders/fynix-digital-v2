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
      className="relative pt-[44px] pb-20 md:pt-40 md:pb-24 pv-seam bg-background-soft overflow-hidden"
    >
      {/* Full-bleed hero photo. Covers the entire section, stays fully clear
          on the right (where Pavel and the slide are), and fades its left edge
          into the cream page so the headline column stays readable. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, transparent 38%, black 66%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, transparent 38%, black 66%, black 100%)",
        }}
      >
        <Image
          src="/pavel/pavel_hero_new_sharp.webp"
          alt="Pavel Klimakov presenting: What is Semantic SEO?"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
      </div>

      {/* Cream scrim over the text column. Sits above the photo and keeps the
          headline / body copy on a light, high-contrast field even where the
          photo's faded left edge reaches under the text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, #FBFAF8 0%, #FBFAF8 36%, rgba(244,239,227,0.94) 48%, rgba(244,239,227,0.55) 60%, rgba(244,239,227,0) 70%)",
        }}
      />

      {/* Text-side dot grid, kept confined to the left half so it doesn't
          fall behind the right-side photo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-full lg:w-1/2 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(#E8E7E3 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 60% at 40% 20%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 60% at 40% 20%, black 0%, transparent 75%)",
        }}
      />

      <Container className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: text */}
          <div className="hero-rise order-2 lg:order-1 lg:col-span-7 space-y-9">
            {/* Eyebrow: the essentials (live, when, where) in the page's own
                editorial voice. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] tracking-[-0.005em]">
              <span className="font-medium text-accent">Live workshop</span>
              <span aria-hidden className="text-text-muted">
                /
              </span>
              <span className="text-text-muted">{WORKSHOP.dateLabel}</span>
              <span aria-hidden className="text-text-muted">
                /
              </span>
              <span className="text-text-muted">
                3 hours on {WORKSHOP.platform}
              </span>
            </div>

            <h1 className="text-[2.4rem] leading-[1.04] sm:text-[3.25rem] sm:leading-[1.02] lg:text-[4rem] lg:leading-[1.02] font-medium tracking-[-0.028em] text-primary">
              Stop guessing what Google wants.{" "}
              <span className="font-serif italic font-normal">
                Learn how Google decides
              </span>{" "}
              which <span className="lg:whitespace-nowrap">websites deserve to rank.</span>
            </h1>

            <p className="text-[1.25rem] sm:text-[1.35rem] text-text-muted leading-[1.55] max-w-[560px] font-normal">
              Google rewards websites that thoroughly cover a topic, not just pages with the right keywords.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Button size="lg" variant="primary" onClick={() => scrollTo("pricing")}>
                Reserve my seat, {price.display}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("curriculum")}>
                See the curriculum
              </Button>
            </div>
          </div>

          {/* RIGHT: on desktop this just reserves grid space for the
              full-bleed background photo above. On mobile it shows the photo
              inline (the full-bleed layer is desktop-only). */}
          <div className="hero-rise-delayed order-1 lg:order-2 lg:col-span-5">
            {/* Mobile-only portrait of Pavel on stage. The desktop hero uses the
                full-bleed layer above, so this is hidden from lg up. Breaks out of
                the padded container to span the full viewport width (edge-to-edge,
                no rounded card), sitting flush under the fixed header. */}
            <div className="relative left-1/2 -translate-x-1/2 w-screen lg:hidden">
              <Image
                src="/pavel/hero_mobile_sharp.webp"
                alt="Pavel Klimakov presenting on stage"
                width={760}
                height={806}
                priority
                quality={82}
                sizes="100vw"
                className="w-full h-auto"
              />
              {/* Name label over the photo, matching the Instructor section:
                  bottom scrim + white name for legibility. */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
              />
              <div className="absolute left-5 bottom-6 z-10 text-white">
                <p className="text-[14px] italic font-normal text-white/75">
                  Instructor
                </p>
                <p className="text-[1.6rem] leading-[1.05] font-semibold tracking-[-0.02em] mt-1">
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
