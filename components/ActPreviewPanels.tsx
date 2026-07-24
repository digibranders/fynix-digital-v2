"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useLenis } from "lenis/react";
import type { Act } from "@/lib/content";
import { actAccents } from "@/components/ActsStack";

type Props = { acts: Act[] };

const DEFAULT_ACTIVE: Act["slug"] = "ui-ux";
const MOBILE_STICKY_TOP_BASE = 80;
const MOBILE_STACK_PEEK = 48;

export default function ActPreviewPanels({ acts }: Props) {
  const [activeSlug, setActiveSlug] = useState<Act["slug"]>(DEFAULT_ACTIVE);
  const [cardScales, setCardScales] = useState<number[]>(() => acts.map(() => 1));
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const updateStack = useCallback(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768) return;

    const newScales = acts.map(() => 1);
    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const nextEl = cardRefs.current[idx + 1];
      if (!nextEl) return;

      const elRect = el.getBoundingClientRect();
      const nextRect = nextEl.getBoundingClientRect();
      const stickyTop = MOBILE_STICKY_TOP_BASE + idx * MOBILE_STACK_PEEK;

      // When the top of next card approaches sticky top of current card
      const overlap = Math.max(0, stickyTop + elRect.height * 0.85 - nextRect.top);
      const progress = Math.min(1, overlap / (elRect.height * 0.6));

      // Slightly scale down current card as next card stacks over it
      newScales[idx] = 1 - progress * 0.05;
    });

    setCardScales(newScales);
  }, [acts]);

  useLenis(updateStack);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateStack);
    };
    updateStack();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [updateStack]);

  return (
    <>
      {/* DESKTOP MAGAZINE EXPANDABLE PANELS (md and above) */}
      <div
        className="hidden md:flex act-panels flex-row md:h-[520px] w-full border border-border rounded-xl overflow-hidden bg-white shadow-[0_30px_60px_-40px_rgba(12,30,46,0.18)]"
        data-any-active
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
              data-active={isActive}
              style={style}
              className="act-panel group relative overflow-hidden border-r border-border last:border-r-0"
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
                <h3 className="act-panel__vtitle font-serif text-3xl md:text-[2.25rem] text-primary font-medium">
                  {act.title}
                </h3>
                <span aria-hidden />
              </div>

              <div className="act-panel__expanded">
                <h3 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                  {act.title}
                </h3>
                <p className="text-base md:text-lg text-text-muted font-normal mt-5 leading-relaxed max-w-sm">
                  {act.subtitle}
                </p>
                <ul className="mt-7 grid grid-cols-1 gap-y-2.5">
                  {act.deliverables.slice(0, 4).map((d) => (
                    <li
                      key={d.title}
                      className="flex items-center gap-3 text-sm md:text-base text-primary/85 font-normal"
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                      />
                      {d.title}
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

      {/* MOBILE SCROLL STACK (below md) */}
      <div className="md:hidden flex flex-col space-y-0 pb-0 relative">
        {acts.map((act, idx) => {
          const accent = actAccents[act.slug];
          const stickyTop = MOBILE_STICKY_TOP_BASE + idx * MOBILE_STACK_PEEK;
          const scale = cardScales[idx] ?? 1;

          return (
            <Link
              key={act.slug}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              href={`/services/${act.slug}`}
              style={{
                top: `${stickyTop}px`,
                zIndex: 10 + idx,
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                backgroundColor: `color-mix(in oklab, ${accent.to} 25%, white)`,
              }}
              className="sticky block rounded-2xl border border-border p-7 shadow-none overflow-hidden transition-transform duration-150 ease-out group"
              aria-label={`${act.title} · Act ${act.num}`}
            >
              {/* Left accent spine bar */}
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: accent.from }}
              />

              {/* Watermark numeral */}
              <span
                aria-hidden
                className="absolute right-4 bottom-2 font-serif italic text-8xl text-primary/5 select-none pointer-events-none"
              >
                {act.num}
              </span>

              {/* Header row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
                  Act {act.num}
                </span>
                <span aria-hidden className="h-px flex-1 bg-border/60 ml-3" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-serif text-3xl text-primary font-medium leading-snug group-hover:text-accent transition-colors">
                {act.title}
              </h3>
              <p className="text-sm text-text-muted font-normal mt-2 leading-relaxed">
                {act.subtitle}
              </p>

              {/* Deliverables list */}
              <ul className="mt-5 space-y-2.5">
                {act.deliverables.slice(0, 4).map((d) => (
                  <li
                    key={d.title}
                    className="flex items-center gap-2.5 text-sm text-primary/85 font-normal"
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                    />
                    {d.title}
                  </li>
                ))}
              </ul>

              {/* Action CTA */}
              <div className="mt-7 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-xs uppercase font-mono font-semibold tracking-widest text-accent group-hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  Explore {act.title}
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
