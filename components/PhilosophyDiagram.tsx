"use client";

import type { ReactNode } from "react";

import DevCardGraphic from "@/components/DevCardGraphic";
import TrustCardGraphic from "@/components/TrustCardGraphic";
import SeoCardGraphic from "@/components/SeoCardGraphic";
import PipelineCardGraphic from "@/components/PipelineCardGraphic";

type Station = {
  code: string;
  step: string;
  title: string;
  description: string;
  illustration: ReactNode;
};

export default function PhilosophyDiagram() {
  const stations: Station[] = [
    {
      code: "UX",
      step: "01",
      title: "Trust",
      description:
        "Interfaces that build confidence and earn trust instantly.",
      illustration: <TrustCardGraphic />,
    },
    {
      code: "DEV",
      step: "02",
      title: "Speed",
      description: "Engineering keeps the promise the design just made.",
      illustration: <DevCardGraphic />,
    },
    {
      code: "SEO",
      step: "03",
      title: "Visibility",
      description:
        "Presence built into the pages buyers are already looking at.",
      illustration: <SeoCardGraphic />,
    },
    {
      code: "GEN",
      step: "04",
      title: "Pipeline",
      description:
        "Visibility turned into real, intent-led conversations.",
      illustration: <PipelineCardGraphic />,
    },
  ];

  return (
    <figure
      aria-label="The connected growth pipeline: UX to Development to SEO to Lead Generation"
      className="not-prose relative w-full overflow-hidden"
    >
      {/* ── 4 Column Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-[#ECE3D8]">
        {stations.map((s, idx) => (
          <div
            key={s.code}
            className={`group relative flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-7 transition-all duration-300 ${
              idx > 0 ? "pt-8 md:pt-6" : ""
            }`}
          >
            {/* Mobile / Tablet Category Tag */}
            <div className="lg:hidden flex items-center mb-4">
              <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#d89870] uppercase">
                {s.code}
              </span>
            </div>

            {/* Illustration Box */}
            <div className="w-full aspect-[500/380] flex items-center justify-center mb-6">
              {s.illustration}
            </div>

            {/* Content Details */}
            <div className="flex flex-col flex-1 justify-between">
              <div>
                <span className="hidden lg:block font-mono text-[11px] font-bold tracking-[0.25em] text-[#d89870] uppercase">
                  {s.code}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-slate-900 font-medium leading-snug mt-1 lg:mt-1.5">
                  {s.title}
                </h3>
                <div className="w-8 h-[2px] bg-[#E06A3B] mt-3 mb-3.5 transition-all duration-300 group-hover:w-12" />
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed text-balance line-clamp-2">
                  {s.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
