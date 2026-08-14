import React from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

// Collage layout: 4 cols x 2 rows on desktop.
// Col 1 (solo tall portrait) & Col 4 (solo tall portrait); cols 2 & 3 hold stacked images.
const COLLAGE = [
  {
    src: "/pavel/pavel-klimakov.webp",
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
                  <a
                    href="https://www.linkedin.com/in/pavel-klimakov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Pavel Klimakov on LinkedIn (opens in a new tab)"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Connect on LinkedIn
                  </a>
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
