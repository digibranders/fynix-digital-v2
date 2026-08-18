"use client";

import React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRight } from "lucide-react";
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center lg:items-stretch">
          {/* LEFT: Text Column — on desktop it fills the image height so the
              eyebrow sits at the top (level with Pavel's head) and the CTAs drop
              to the bottom (level with the "Pavel Klimakov" label). */}
          <div className="hero-rise order-2 lg:order-1 lg:col-span-7 flex flex-col gap-8 lg:gap-0 lg:justify-between lg:pb-6">
            <div className="space-y-8 lg:mt-12
            ">
            <h1 className="text-[2.4rem] leading-[1.04] sm:text-[3.25rem] sm:leading-[1.02] lg:text-[3.85rem] lg:leading-[1.02] font-medium tracking-[-0.028em] text-white">
              Semantic SEO
              <br />
              <span className="font-serif italic font-normal text-[#E8B087]">
                from confusion to clarity.
              </span>
            </h1>

            {/* <p className="text-[18px] text-white/90 leading-[1.5] font-normal max-w-[560px]">
              What you hear about Semantic SEO is just 15% of the story.
            </p> */}

            <div className="space-y-2 max-w-[560px]">
              <p className="text-[17.6px] text-white/85 leading-[1.5] font-normal">
                Taught by someone who&rsquo;s already earned the results you
                want.
              </p>
              <p className="text-[13.5px] text-white/60 leading-[1.5] font-normal">
                3 Hours Masterclass to Decode the Concepts, <br />Connect the
                Dots &amp; Get Certified
              </p>
            </div>
            </div>

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
            <div className="relative mx-auto max-w-[460px] lg:max-w-none h-[calc(100dvh-16rem)] max-h-[560px] min-h-[320px] sm:h-[480px] sm:max-h-none sm:min-h-0 lg:h-[540px] w-full overflow-hidden">
              {/* Mobile: a cleaner crop (no "Refine the…" strip up top). */}
              <Image
                src="/pavel/new_hero_mobile.webp"
                alt="Pavel Klimakov presenting on stage at SEO Vibes Summit"
                fill
                priority
                sizes="100vw"
                className="md:hidden object-cover object-center"
              />
              {/* Desktop / tablet: the original stage shot. */}
              <Image
                src="/pavel/pavel-seo-vibes-summit-2025.webp"
                alt="Pavel Klimakov presenting on stage at SEO Vibes Summit"
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="hidden md:block object-cover object-[center_22%] scale-105"
              />

              {/* Edges blend into the black background — bottom, left, and a
                  small top fade so the busy screen strip up top goes to black. */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, #000000 0%, transparent 40%), linear-gradient(to right, #000000 0%, transparent 20%)",
                }}
              />

              {/* Fade scrim across the bottom so the name + LinkedIn badge stay
                  legible over busy areas of the photo. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/55 to-transparent"
              />

              {/* Instructor Name Label — flush to the photo's left edge on
                  stacked layouts so it aligns with the hero headline; inset on
                  desktop where the photo sits in its own column. */}
              <div className="absolute left-0 lg:left-6 bottom-6 z-10 text-white">
                {/* <p className="text-[13px] italic font-normal text-white/75">
                  Instructor
                </p> */}
                <p className="text-[1.75rem] leading-[1.05] font-semibold text-white tracking-[-0.02em] mt-0.5">
                  Pavel Klimakov
                </p>
                <p className="mt-2 max-w-[300px] text-[15px] italic leading-[1.4] text-white/75">
                  &ldquo;What you hear about Semantic SEO
                  <br />
                  is just 15% of the story.&rdquo;
                </p>
              </div>

              {/* LinkedIn badge, bottom-right */}
              <a
                href="https://www.linkedin.com/in/pavel-klimakov/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pavel Klimakov on LinkedIn (opens in a new tab)"
                className="absolute right-6 bottom-6 z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-[0_2px_10px_rgba(10,102,194,0.45)] transition-colors hover:bg-[#004182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
