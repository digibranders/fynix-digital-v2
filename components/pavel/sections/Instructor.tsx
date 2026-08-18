import React from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";
import { TalkVideo } from "../ui/TalkVideo";

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
      className="py-12 pv-seam bg-background-soft"
    >
      <Container>
        {/* See him teach: centred feature — a short heading leads into the
            click-to-play recording of Pavel's conference talk. */}
        <Reveal delay={100} className="mb-16 md:mb-20">
          <div className="mx-auto mb-10 max-w-[680px] text-center md:mb-12">
            <h3 className="text-[1.9rem] font-medium leading-[1.1] tracking-[-0.024em] text-primary sm:text-[2.3rem]">
              Live on stage,{" "}
              <span className="font-serif italic font-medium">
                teaching this.
              </span>
            </h3>
            <p className="mx-auto mt-4 max-w-[560px] text-[1.1rem] font-normal leading-[1.6] text-text-muted">
              A full conference talk on the exact framework you&rsquo;ll learn.
              Entities, topical maps, and reading Google the way it reads the
              web.
            </p>
          </div>
          <div className="mx-auto max-w-[900px]">
            <TalkVideo
              src="/pavel/pavel-semantic-seo-talk.mp4"
              poster="/pavel/pavel-talk-poster.jpg"
              label="Watch Pavel teach Semantic SEO, live on stage"
              duration="4:43"
            />
          </div>
        </Reveal>

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
