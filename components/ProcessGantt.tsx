"use client";

import { useEffect, useRef, useState } from "react";
import { processSteps } from "@/lib/content";

type Props = {
  variant?: "compact" | "full";
  className?: string;
};

const TOTAL_COLUMNS = 12;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const BAR_DURATION_MS = 700;
const ROW_STAGGER_MS = 110;

export default function ProcessGantt({ variant = "full", className = "" }: Props) {
  const isCompact = variant === "compact";
  const figRef = useRef<HTMLElement | null>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = figRef.current;
    if (!el) return;

    // The global reduced-motion rule in globals.css clamps every
    // transition to ~0.01ms, so users who prefer reduced motion see
    // the observer fire and the bars snap to their final state.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPlay(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // When the last row's transition finishes, fade the ongoing dashed line in.
  const lastRowDelay = (processSteps.length - 1) * ROW_STAGGER_MS;
  const dashRevealDelay = lastRowDelay + BAR_DURATION_MS - 200;

  return (
    <figure
      ref={figRef}
      className={`not-prose ${className}`}
      aria-label="Ten-week engagement schedule"
    >
      <div
        className={`grid ${
          isCompact ? "gap-y-1.5" : "gap-y-2"
        }`}
        style={{
          gridTemplateColumns: `${isCompact ? "6.5rem" : "8rem"} minmax(0, 1fr)`,
        }}
      >
        <div />
        <div
          className="grid text-[10px] uppercase tracking-widest text-text-muted font-mono"
          style={{ gridTemplateColumns: `repeat(${TOTAL_COLUMNS}, minmax(0, 1fr))` }}
          aria-hidden
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="text-center pb-1 border-b border-border/60">
              {`W${i + 1}`}
            </span>
          ))}
          <span className="col-span-2 text-center pb-1 border-b border-border/60 italic normal-case tracking-normal">
            ongoing →
          </span>
        </div>

        {processSteps.map((step, idx) => {
          const start = step.weeks.start;
          const end = Math.min(step.weeks.end, 10);
          const span = end - start + 1;
          const colStart = start;
          const isOngoing = step.weeks.ongoing;
          const rowDelay = idx * ROW_STAGGER_MS;

          return (
            <div key={step.num} className="contents">
              <div
                className={`flex items-center gap-2 ${
                  isCompact ? "text-[11px]" : "text-xs"
                } font-mono uppercase tracking-widest text-primary`}
              >
                <span className="text-accent">{step.num}</span>
                <span className="font-sans normal-case tracking-normal text-primary/80 font-medium">
                  {step.title}
                </span>
              </div>

              <div
                className="relative grid"
                style={{ gridTemplateColumns: `repeat(${TOTAL_COLUMNS}, minmax(0, 1fr))` }}
              >
                {/* faint weekly ticks */}
                <div
                  className="pointer-events-none absolute inset-0 grid"
                  style={{ gridTemplateColumns: `repeat(${TOTAL_COLUMNS}, minmax(0, 1fr))` }}
                  aria-hidden
                >
                  {Array.from({ length: TOTAL_COLUMNS }).map((_, i) => (
                    <div
                      key={i}
                      className={`border-l ${
                        i === 0 ? "border-transparent" : "border-border/40"
                      }`}
                    />
                  ))}
                </div>

                <div
                  className={`relative ${
                    isCompact ? "h-2.5" : "h-3"
                  } rounded-sm bg-primary/85`}
                  style={{
                    gridColumn: `${colStart} / span ${span}`,
                    clipPath: play ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                    transition: `clip-path ${BAR_DURATION_MS}ms ${EASE} ${rowDelay}ms`,
                    willChange: "clip-path",
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px] rounded-l-sm bg-accent"
                  />
                </div>

                {isOngoing && (
                  <div
                    className="relative flex items-center"
                    style={{ gridColumn: `${end + 1} / span 2` }}
                  >
                    <div
                      className="dash-drift h-px w-full"
                      aria-hidden
                      style={{
                        opacity: play ? 1 : 0,
                        transition: `opacity 400ms ${EASE} ${dashRevealDelay}ms`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isCompact && (
        <figcaption className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-widest text-text-muted">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-4 bg-primary/85 rounded-sm" aria-hidden />
            Active work
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-4 border-t border-dashed border-primary/50" aria-hidden />
            Continues after launch
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-1 bg-accent rounded-sm" aria-hidden />
            Client gate
          </span>
        </figcaption>
      )}
    </figure>
  );
}
