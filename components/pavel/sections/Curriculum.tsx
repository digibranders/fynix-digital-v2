import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

const MODULES = [
  {
    n: "01",
    title: "How search engines actually read your site",
    summary:
      "The plain-English version of information retrieval, NLP, and the Google patents that govern ranking. Every decision you make afterward has a reason behind it.",
    points: [
      "Information retrieval basics, without the jargon.",
      "The Google patents that quietly shape ranking behaviour.",
      "How NLP and language models evaluate a passage of text.",
    ],
  },
  {
    n: "02",
    title: "Building a topical map that creates authority",
    summary:
      "Core sections versus outer sections. How to define the boundaries of a topic, sequence your content, and structure a site so coverage signals real expertise.",
    points: [
      "Defining the boundaries of a topic before you write a word.",
      "Core sections, outer sections, and how they route authority.",
      "Sequencing content so the site reads as a single expert body.",
    ],
  },
  {
    n: "03",
    title: "Entities, attributes and relevance configuration",
    summary:
      "How to identify the entities that matter in your niche, filter them by attribute, and write content that is contextually unambiguous to a machine.",
    points: [
      "Finding the entities that anchor your niche.",
      "Filtering by attribute to sharpen relevance.",
      "Writing so a search engine cannot misread your meaning.",
    ],
  },
  {
    n: "04",
    title: "Semantic content networks",
    summary:
      "How internal structure and contextual connection turn a pile of articles into a network that ranks as a unit, and outranks bigger competitors.",
    points: [
      "Internal linking as a network, not a checklist.",
      "Contextual bridges that pass meaning, not just PageRank.",
      "Why a network of ten pages can beat a site with a hundred.",
    ],
  },
  {
    n: "05",
    title: "From framework to execution",
    summary:
      "Pavel&rsquo;s programming-assisted workflow for doing this at scale, plus how to read the SERP to validate and iterate.",
    points: [
      "The programming-assisted workflow Pavel uses on real projects.",
      "Reading the SERP as a live feedback signal.",
      "A repeatable loop for validating and iterating each week.",
    ],
  },
];

export const Curriculum: React.FC = () => {
  return (
    <section
      id="curriculum"
      className="py-24 md:py-32 border-b border-[#DDD3BC] bg-[#F4EFE3]"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 mb-16 md:mb-20">
          <div className="lg:col-span-6">
            <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.15rem] leading-[1.08] font-medium tracking-[-0.026em] text-[#0F0E0C]">
              What you will learn,{" "}
              <span className="italic font-normal text-[#2F4B3A]">
                in three hours.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-[1.2rem] text-[#4A4640] leading-[1.65] font-normal">
              Five modules, taught live. A method you can apply on Monday
              morning, not a motivational talk.
            </p>
          </div>
        </div>

        {/* Full syllabus — every module laid out at once, no accordion. */}
        <div className="border-t border-[#DDD3BC]">
          {MODULES.map((m, i) => (
            <Reveal key={m.n} delay={(i % 2) * 60}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-5 gap-x-8 lg:gap-x-12 py-10 md:py-14 border-b border-[#DDD3BC]">
                <div className="lg:col-span-2">
                  <span className="font-serif text-[2.5rem] sm:text-[2.85rem] italic font-normal text-[#2F4B3A] leading-none tnum">
                    {m.n}
                  </span>
                </div>

                <div className="lg:col-span-6">
                  <h3 className="font-serif text-[1.5rem] sm:text-[1.75rem] leading-[1.2] font-medium text-[#0F0E0C]">
                    {m.title}
                  </h3>
                  <p
                    className="mt-4 text-[1.05rem] text-[#4A4640] leading-[1.65] italic font-normal max-w-[440px]"
                    dangerouslySetInnerHTML={{ __html: m.summary }}
                  />
                </div>

                <div className="lg:col-span-4">
                  <ul className="space-y-3.5">
                    {m.points.map((point, pi) => (
                      <li
                        key={pi}
                        className="flex gap-3.5 text-[15.5px] text-[#0F0E0C] leading-[1.6]"
                      >
                        <span
                          aria-hidden
                          className="mt-[9px] h-1.5 w-1.5 rounded-full bg-[#2F4B3A] shrink-0"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
};
