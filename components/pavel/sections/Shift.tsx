"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

const PROMISES = [
  {
    body: "Map a topic the way Google&rsquo;s index sees it, not the way a keyword tool lists it.",
  },
  {
    body: "Structure content so authority compounds across your site instead of leaking.",
  },
  {
    body: "Engineer relevance with entities, attributes, and context, not keyword density.",
  },
  {
    body: "Read the SERP and the patents to know what to do next, every time.",
  },
];

export const Shift: React.FC = () => {
  return (
    <section
      id="shift"
      className="py-24 md:py-32 border-b border-[#DDD3BC] bg-[#FDFBF5]"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">
          <div className="lg:col-span-6 lg:sticky lg:top-32">
            <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-[#0F0E0C]">
              Semantic SEO makes your site{" "}
              <span className="italic font-normal text-[#2F4B3A]">
                cheaper to retrieve
              </span>{" "}
              and more trustworthy to a search engine.
            </h2>

            <p className="mt-8 text-[1.2rem] text-[#4A4640] leading-[1.65] max-w-[520px] font-normal">
              The framework pioneered by{" "}
              <span className="italic font-normal text-[#0F0E0C]">
                Koray Tuğberk Gübür
              </span>
              , proven on low-budget sites that became category authorities.
              Pavel makes it simple enough to use on Monday morning.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-8 lg:pt-2">
            <p className="text-[16px] italic font-normal text-[#6B6659] pb-3 border-b border-[#DDD3BC]">
              What you will be able to do
            </p>

            <ul className="space-y-8">
              {PROMISES.map((item, i) => (
                <li key={i}>
                  <Reveal delay={i * 80} className="flex gap-6">
                    <span className="font-serif text-[18px] italic font-normal text-[#2F4B3A] pt-1 tnum shrink-0 min-w-[28px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p
                      className="text-[1.05rem] text-[#0F0E0C] leading-[1.55] flex-1"
                      dangerouslySetInnerHTML={{ __html: item.body }}
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
};
