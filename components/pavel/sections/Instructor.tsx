"use client";

import React from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

// Collage layout: 4 cols x 2 rows on desktop. Col 1 is a solo tall portrait
// (row-span-2). Cols 2, 3 & 4 each hold two stacked images. Reading order:
// [Col 1 solo], [Col 2 top], [Col 3 top], [Col 4 top], [Col 2 bot],
// [Col 3 bot], [Col 4 bot]. Koray photos sit in the first stacked row so
// they read immediately after the leftmost portrait.
const COLLAGE = [
  {
    src: "/pavel/pavel-klimakov.jpg",
    alt: "Pavel Klimakov",
    caption: "Portrait",
    span: "solo",
  },
  {
    src: "/pavel/korey1.jpeg",
    alt: "Koray Tuğberk Gübür, framework originator",
    caption: "Koray Tuğberk Gübür",
    span: "third",
  },
  {
    src: "/pavel/korey2.jpeg",
    alt: "Koray Tuğberk Gübür on Semantic SEO",
    caption: "Koray Tuğberk Gübür",
    span: "third",
  },
  {
    src: "/pavel/Kulturalnie-o-SEO-warsaw-pavel.jpg",
    alt: "Pavel presenting at Kulturalnie o SEO, Warsaw",
    caption: "Kulturalnie o SEO, Warsaw",
    span: "third",
  },
  {
    src: "/pavel/seo-vibes-zakopane.jpg",
    alt: "SEO Vibes conference, Zakopane",
    caption: "SEO Vibes, Zakopane",
    span: "third",
  },
  {
    src: "/pavel/pavel-seo-mastery-summit-2025.jpg",
    alt: "SEO Mastery Summit, 2025",
    caption: "SEO Mastery Summit, 2025",
    span: "third",
  },
  {
    src: "/pavel/Kulturalnie-o-SEO-warsaw.jpg",
    alt: "Kulturalnie o SEO venue, Warsaw",
    caption: "Kulturalnie o SEO, Warsaw",
    span: "third",
  },
];

export const Instructor: React.FC = () => {
  return (
    <section
      id="instructor"
      className="py-24 md:py-36 lg:py-44 border-b border-[#DDD3BC] bg-[#FDFBF5]"
    >
      <Container>
        {/* Header block: instructor card left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start mb-16 md:mb-20">
          <Reveal className="lg:col-span-5">
            <div className="relative rounded-[16px] overflow-hidden aspect-[4/5] shadow-[0_1px_2px_rgba(15,14,12,0.06),0_24px_50px_-24px_rgba(15,14,12,0.28)]">
              <Image
                src="/pavel/pavel-klimakov.jpg"
                alt="Pavel Klimakov"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="object-cover object-top scale-[1.35]"
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

                <div className="pt-8 border-t border-white/25">
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
            <h2 className="text-[2.05rem] sm:text-[2.55rem] lg:text-[2.9rem] leading-[1.1] font-medium tracking-[-0.026em] text-[#0F0E0C]">
              Pavel has spent eight years inside the systems modern search is
              built on.{" "}
              <span className="italic font-normal text-[#2F4B3A]">
                Information retrieval, NLP, text-understanding algorithms.
              </span>
            </h2>

            <p className="text-[1.175rem] text-[#4A4640] leading-[1.65] font-normal">
              He grows organic traffic by combining Koray&rsquo;s Semantic SEO
              framework with programming methods. When Pavel explains why
              something ranked, you will finally be able to repeat it on
              purpose.
            </p>
          </Reveal>
        </div>

        {/* 4-column collage: 1 tall portrait + 3 stacked columns of 2 */}
        <Reveal
          delay={100}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[210px] lg:auto-rows-[240px]"
        >
          {COLLAGE.map((item, i) => (
            <figure
              key={i}
              className={`relative rounded-2xl overflow-hidden bg-[#EBE5D3] group ${
                item.span === "solo" ? "md:row-span-2" : ""
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
