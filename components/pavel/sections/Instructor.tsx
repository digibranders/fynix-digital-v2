"use client";

import React from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

// Collage layout: 4 cols x 2 rows on desktop.
// Col 1 (solo tall portrait) & Col 4 (solo tall portrait); cols 2 & 3 hold stacked images.
const COLLAGE = [
  {
    src: "/pavel/pavel-seo-vibes-summit-2025.webp",
    alt: "Pavel Klimakov presenting at SEO Vibes Summit 2025",
    caption: "SEO Vibes Summit, 2025",
    span: "solo",
  },
  {
    src: "/pavel/pavel-koray-together.webp",
    alt: "Koray Tuğberk Gübür and Pavel Klimakov together",
    caption: "Koray Tuğberk Gübür & Pavel Klimakov",
    span: "standard",
  },
  {
    src: "/pavel/pavel_new.webp",
    alt: "Pavel Klimakov presenting at SEO conference",
    caption: "SEO Conference, Warsaw",
    span: "standard",
  },
  {
    src: "/pavel/pavel-seo-mastery-summit-2025.webp",
    alt: "SEO Mastery Summit, 2025",
    caption: "SEO Mastery Summit, 2025",
    span: "solo",
  },
  {
    src: "/pavel/korey1.webp",
    alt: "Koray Tuğberk Gübür, framework originator",
    caption: "Koray Tuğberk Gübür",
    span: "standard",
  },
  {
    src: "/pavel/seo-vibes-zakopane.webp",
    alt: "SEO Vibes conference, Zakopane",
    caption: "SEO Vibes, Zakopane",
    span: "standard",
  },
];

export const Instructor: React.FC = () => {
  return (
    <section
      id="instructor"
      className="py-16 md:py-20 pv-seam bg-background-soft"
    >
      <Container>
        {/* Header block: instructor card left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start mb-16 md:mb-20">
          <Reveal className="lg:col-span-5">
            <div className="relative rounded-[16px] overflow-hidden aspect-[4/5] shadow-[0_1px_2px_rgba(15,14,12,0.06),0_24px_50px_-24px_rgba(15,14,12,0.28)]">
              <Image
                src="/pavel/Kulturalnie-o-SEO-warsaw-pavel.webp"
                alt="Pavel Klimakov interview at Kulturalnie o SEO"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="object-cover object-[center_25%]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/80"
              />
              <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10 text-white">
                <div>
                  <p className="text-[16px] italic font-normal text-white/75">
                    Instructor
                  </p>
                  <p className="text-[1.65rem] sm:text-[1.9rem] leading-[1.05] font-semibold text-white mt-2 tracking-[-0.02em]">
                    Pavel
                    <br />
                    Klimakov
                  </p>
                </div>

                <div className="pt-8 pv-seam-td">
                  <p className="text-[13.5px] italic font-normal text-white/75">
                    Experience
                  </p>
                  <p className="text-[15px] text-white font-medium mt-1.5">
                    8 years, information retrieval &amp; NLP
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-7 space-y-7">
            <h2 className="text-[2.05rem] sm:text-[2.55rem] lg:text-[2.9rem] leading-[1.1] font-medium tracking-[-0.026em] text-primary">
              Eight years in information retrieval, NLP, and modern search.
            </h2>

            <p className="text-[1.175rem] text-text-muted leading-[1.65] font-normal">
              He pairs Koray&rsquo;s Semantic SEO framework with programming,
              so you can finally repeat what ranked on purpose.
            </p>
          </Reveal>
        </div>

        {/* 4-column collage: Col 1 & Col 4 tall solo portraits + 2 middle stacked columns */}
        <Reveal
          delay={100}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[210px] lg:auto-rows-[240px]"
        >
          {COLLAGE.map((item, i) => (
            <figure
              key={i}
              className={`relative rounded-2xl overflow-hidden bg-background-soft group ${
                item.span === "solo" ? "lg:row-span-2" : ""
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Bottom scrim + caption */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
              />
              <figcaption className="absolute left-4 bottom-3 text-[12px] italic font-normal text-white/90 tracking-tight">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </Container>
    </section>
  );
};
