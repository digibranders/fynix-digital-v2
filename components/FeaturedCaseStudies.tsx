"use client";

import Link from "next/link";
import type { CaseStudy } from "@/lib/content";
import DossierTile from "@/components/DossierTile";
import Reveal from "@/components/Reveal";

type Props = { studies: CaseStudy[] };

export default function FeaturedCaseStudies({ studies }: Props) {
  const [featured, ...supporting] = studies;
  if (!featured) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <Reveal className="lg:col-span-7">
        <FeaturedCard study={featured} index={1} />
      </Reveal>
      <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
        {supporting.slice(0, 2).map((study, idx) => (
          <Reveal key={study.slug} delay={(idx + 1) * 120} className="flex-1">
            <SupportingCard study={study} index={idx + 2} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function FeaturedCard({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      className="group h-full grid grid-cols-1 md:grid-cols-2 bg-white border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-30px_rgba(12,30,46,0.25)] hover:-translate-y-0.5"
    >
      <div className="relative aspect-square md:aspect-auto md:min-h-[480px]">
        <DossierTile
          domain={study.domain}
          name={study.name}
          index={index}
          iconUrl={study.iconUrl}
          size="lg"
        />
      </div>

      <div className="flex flex-col justify-between p-8 md:p-10">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-semibold">
            Featured Case
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
            №{String(index).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-auto pt-10">
          <h3 className="font-serif italic text-4xl md:text-5xl text-primary font-normal leading-[1.05] group-hover:text-accent transition-colors">
            {study.name}
          </h3>
          <div className="mt-3 text-xs font-mono text-text-muted">
            {study.domain}
          </div>
          <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent">
            <span className="border-b border-accent pb-0.5 transition-colors group-hover:text-primary group-hover:border-primary">
              Read Case Study
            </span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SupportingCard({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      className="group grid grid-cols-5 bg-white border border-border rounded-lg overflow-hidden h-full transition-all duration-300 hover:shadow-[0_15px_40px_-25px_rgba(12,30,46,0.2)] hover:-translate-y-0.5"
    >
      <div className="relative col-span-2 min-h-[160px] self-stretch">
        <DossierTile
          domain={study.domain}
          name={study.name}
          index={index}
          iconUrl={study.iconUrl}
          size="sm"
        />
      </div>
      <div className="col-span-3 flex flex-col justify-between p-5 md:p-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
            Case №{String(index).padStart(2, "0")}
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <div>
          <h3 className="font-serif italic text-2xl md:text-3xl text-primary font-normal leading-[1.1] group-hover:text-accent transition-colors">
            {study.name}
          </h3>
          <div className="mt-2 text-[11px] font-mono text-text-muted">
            {study.domain}
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-accent">
            <span className="border-b border-accent pb-0.5 transition-colors group-hover:text-primary group-hover:border-primary">
              View
            </span>
            <svg
              className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
