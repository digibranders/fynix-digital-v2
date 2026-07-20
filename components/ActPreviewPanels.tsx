"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { Act } from "@/lib/content";
import { actAccents } from "@/components/ActsStack";

type Props = { acts: Act[] };

export default function ActPreviewPanels({ acts }: Props) {
  const [activeSlug, setActiveSlug] = useState<Act["slug"] | null>(null);

  return (
    <div
      className="act-panels flex flex-col md:flex-row md:h-[520px] w-full border border-border rounded-xl overflow-hidden bg-white shadow-[0_30px_60px_-40px_rgba(12,30,46,0.18)]"
      data-any-active={activeSlug !== null}
      onMouseLeave={() => setActiveSlug(null)}
    >
      {acts.map((act) => {
        const accent = actAccents[act.slug];
        const isActive = activeSlug === act.slug;

        const style: CSSProperties = {
          ["--act-from" as string]: accent.from,
          ["--act-to" as string]: accent.to,
          ["--act-ink" as string]: accent.ink,
        } as CSSProperties;

        return (
          <Link
            key={act.slug}
            href={`/services/${act.slug}`}
            onMouseEnter={() => setActiveSlug(act.slug)}
            onFocus={() => setActiveSlug(act.slug)}
            onBlur={() => setActiveSlug(null)}
            data-active={isActive}
            style={style}
            className="act-panel group relative overflow-hidden border-b md:border-b-0 md:border-r border-border last:border-r-0 last:border-b-0"
            aria-label={`${act.title} · Act ${act.num}`}
          >
            <span aria-hidden className="act-panel__spine" />
            <span aria-hidden className="act-panel__wash" />
            <span
              aria-hidden
              className="act-panel__watermark font-serif italic"
            >
              {act.num}
            </span>

            <div className="act-panel__collapsed">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted whitespace-nowrap">
                Act {act.num}
              </span>
              <h3 className="act-panel__vtitle font-serif text-3xl md:text-[2.25rem] text-primary font-normal">
                {act.title}
              </h3>
              <span aria-hidden />
            </div>

            <div className="act-panel__expanded">
              <h3 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                {act.title}
              </h3>
              <p className="text-base md:text-lg text-text-muted font-light mt-5 leading-relaxed max-w-sm">
                {act.subtitle}
              </p>
              <ul className="mt-7 grid grid-cols-1 gap-y-2.5">
                {act.deliverables.slice(0, 4).map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-3 text-sm md:text-base text-primary/85 font-light"
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                    />
                    {d}
                  </li>
                ))}
              </ul>
              <span className="mt-10 inline-flex items-center gap-2 text-[13px] uppercase font-semibold text-accent tracking-widest">
                Explore {act.title}
                <span aria-hidden className="act-panel__arrow">&rarr;</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
