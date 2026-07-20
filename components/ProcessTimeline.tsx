"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { processSteps } from "@/lib/content";
import Reveal from "./Reveal";

const stepIcons: Record<string, ReactNode> = {
  "01": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" pathLength={1} />
      <path d="m20 20-4.5-4.5" pathLength={1} />
    </svg>
  ),
  "02": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12h4l2.5-7 4 14 2.5-7h5" pathLength={1} />
    </svg>
  ),
  "03": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" pathLength={1} />
      <path d="M3.5 10h17M3.5 15h17M10 3.5v17M15 3.5v17" pathLength={1} />
    </svg>
  ),
  "04": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 4H7a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2v2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2" pathLength={1} />
      <path d="M15 4h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2v2a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2" pathLength={1} />
    </svg>
  ),
  "05": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 3 3 10l7 3 3 7 8-17Z" pathLength={1} />
      <path d="m10 13 4-4" pathLength={1} />
    </svg>
  ),
  "06": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 17.5 9 11l4 4 8-9" pathLength={1} />
      <path d="M14 6.5h7v7" pathLength={1} />
    </svg>
  ),
};

export default function ProcessTimeline() {
  const olRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [drawn, setDrawn] = useState<boolean[]>(() => processSteps.map(() => false));

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      const ol = olRef.current;
      if (!ol) return;
      const olRect = ol.getBoundingClientRect();
      const vpCenter = window.innerHeight * 0.5;
      const usable = Math.max(1, olRect.height - 32);
      const raw = (vpCenter - olRect.top - 16) / usable;
      setProgress(Math.max(0, Math.min(1, raw)));

      let closest = -1;
      let minDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const dist = Math.abs(mid - vpCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      const inView =
        olRect.top < window.innerHeight * 0.75 &&
        olRect.bottom > window.innerHeight * 0.25;
      setActiveIndex(inView ? closest : -1);
    };
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              setDrawn((prev) => {
                if (prev[i]) return prev;
                const next = [...prev];
                next[i] = true;
                return next;
              });
              io.disconnect();
              break;
            }
          }
        },
        { threshold: 0.2 },
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <ol ref={olRef} className="relative">
      <div
        aria-hidden
        className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px bg-border md:-translate-x-1/2"
      />
      <div
        aria-hidden
        className="absolute left-6 md:left-1/2 top-4 w-px bg-accent md:-translate-x-1/2"
        style={{
          height: `calc((100% - 2rem) * ${progress})`,
          transition: "height 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {processSteps.map((step, idx) => {
        const isLeft = idx % 2 === 0;
        const icon = stepIcons[step.num];
        const isActive = idx === activeIndex;
        const passed = activeIndex >= 0 && idx <= activeIndex;

        return (
          <Reveal
            key={step.num}
            variant={isLeft ? "left" : "right"}
            delay={40}
            className="relative"
          >
            <li
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              className="relative pl-16 md:pl-0 md:grid md:grid-cols-2 md:gap-16 md:items-center py-8 md:py-12"
            >
              <span
                aria-hidden
                className={`absolute left-6 md:left-1/2 top-9 md:top-1/2 md:-translate-y-1/2 -translate-x-1/2 rounded-full ring-4 ring-background-soft transition-all duration-500 ${
                  isActive
                    ? "h-3 w-3 bg-accent"
                    : passed
                      ? "h-2.5 w-2.5 bg-accent"
                      : "h-2.5 w-2.5 bg-border"
                }`}
              />

              <div
                className={
                  isLeft ? "md:pr-10" : "md:col-start-2 md:pl-10"
                }
              >
                <div
                  className={`bg-white border rounded-xl p-6 md:p-7 shadow-xs transition-[border-color,box-shadow] duration-500 ${
                    passed ? "border-accent/40 shadow-sm" : "border-border"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-xs text-accent font-bold">
                      {step.num}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                      {step.duration}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-[26px] text-primary font-normal mt-3 leading-tight">
                    {step.title}
                  </h3>

                  <p className="text-sm md:text-[15px] text-text-muted font-light leading-relaxed mt-3">
                    {step.short}
                  </p>
                </div>
              </div>

              <div
                aria-hidden
                className={`hidden md:flex items-center pointer-events-none select-none ${
                  isLeft
                    ? "md:col-start-2 md:pl-10 md:justify-start"
                    : "md:col-start-1 md:row-start-1 md:pr-10 md:justify-end"
                }`}
              >
                <div
                  data-drawn={drawn[idx] ? "true" : undefined}
                  className={`timeline-icon relative h-40 w-40 transition-[color,opacity,transform] duration-700 ease-out ${
                    passed
                      ? "text-accent/60 opacity-100 scale-105"
                      : "text-accent/25 opacity-80 scale-100"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-0 rounded-full border transition-colors duration-500 ${
                      passed ? "border-accent/50" : "border-accent/20"
                    }`}
                  />
                  <div className="absolute inset-6">{icon}</div>
                </div>
              </div>
            </li>
          </Reveal>
        );
      })}
    </ol>
  );
}
