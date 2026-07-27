"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { testimonials } from "@/lib/content";
import Reveal from "./Reveal";

const SLIDE_DURATION_MS = 7000;
const TRANSITION_MS = 700;
const SWIPE_THRESHOLD_PX = 40;
const SWIPE_DIRECTION_LOCK_PX = 10;

function getInitials(company: string): string {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function TestimonialsRail() {
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [paused, setPaused] = useState(false);

  const total = testimonials.length;
  const activeIdx = ((step % total) + total) % total;

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  const swipeRef = useRef<{ startX: number; startY: number; locked: boolean } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") return;
      swipeRef.current = { startX: e.clientX, startY: e.clientY, locked: false };
      pause();
    },
    [pause],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const s = swipeRef.current;
    if (!s || s.locked) return;
    const dx = Math.abs(e.clientX - s.startX);
    const dy = Math.abs(e.clientY - s.startY);
    if (dx > SWIPE_DIRECTION_LOCK_PX && dx > dy) s.locked = true;
  }, []);

  const onPointerEnd = useCallback(
    (e: React.PointerEvent) => {
      const s = swipeRef.current;
      swipeRef.current = null;
      resume();
      if (!s || !s.locked) return;
      const dx = e.clientX - s.startX;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      setStep((prev) => prev + (dx < 0 ? 1 : -1));
    },
    [resume],
  );

  const jumpToDupIdx = useCallback(
    (dupIdx: number) => {
      setStep(dupIdx - total);
    },
    [total],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setStep((s) => s + 1);
      if (e.key === "ArrowLeft") setStep((s) => s - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (Math.abs(step) < total) return;
    const timer = setTimeout(() => {
      setTransitionEnabled(false);
      setStep((s) => s - Math.sign(s) * total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }, TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [step, total]);

  const autoAdvance = !reducedMotion;
  const centerOffset = total; // middle copy of the tripled render

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="pt-24 md:pt-32 pb-16 md:pb-20 bg-background-soft"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <h2
              id="testimonials-heading"
              className="font-serif text-3xl md:text-5xl text-primary font-medium leading-tight"
            >
              Trusted by Businesses That Expect Results
            </h2>
            <p className="text-text-muted text-lg md:text-xl font-normal leading-relaxed mt-6">
              Long-term partnerships are built on trust, transparency, and measurable outcomes. Here&apos;s what our clients say about working with Fynix Digital.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-16">
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Client testimonials"
          >
            <div
              aria-live="polite"
              className="relative grid touch-pan-y select-none"
              style={{ gridTemplateAreas: '"stack"' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
            >
              {testimonials.map((t, i) => {
                const isActive = i === activeIdx;
                return (
                  <figure
                    key={t.company}
                    aria-hidden={!isActive}
                    style={{ gridArea: "stack" }}
                    onMouseEnter={isActive ? pause : undefined}
                    onMouseLeave={isActive ? resume : undefined}
                    onFocus={isActive ? pause : undefined}
                    onBlur={isActive ? resume : undefined}
                    className={`bg-white border border-border rounded-3xl shadow-sm px-6 py-14 md:px-16 md:py-20 flex flex-col justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? "opacity-100 translate-y-0 relative z-10"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <svg
                      aria-hidden
                      className="mx-auto w-9 h-9 text-accent/60"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7.17v-7.17H6.34c0-1.28 1.05-2.33 2.33-2.33h.67V6h-2.17zm10 0c-2.3 0-4.17 1.87-4.17 4.17V18h7.17v-7.17H16.34c0-1.28 1.05-2.33 2.33-2.33h.67V6h-2.17z" />
                    </svg>

                    <blockquote className="mt-6 font-serif text-xl md:text-2xl lg:text-[28px] text-primary leading-relaxed font-normal text-center max-w-3xl mx-auto">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>

                    <figcaption className="mt-10 text-center">
                      <span className="block text-base font-semibold text-primary">
                        {t.name}
                      </span>
                      <span className="block text-sm text-text-muted mt-1">{t.role}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>

            <div className="mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_30%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_30%,black_70%,transparent_100%)]">
              <div className="relative h-16 md:h-[68px] [--slot:120px] [--item:64px] md:[--slot:148px] md:[--item:68px]">
                <div
                  role="tablist"
                  aria-label="Testimonials navigation"
                  className="absolute top-0 left-1/2 flex items-center gap-14 md:gap-20"
                  style={
                    {
                      transform: `translateX(calc(-1 * ((${
                        centerOffset + step
                      }) * var(--slot) + var(--item) / 2)))`,
                      transition: transitionEnabled
                        ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
                        : "none",
                    } as React.CSSProperties
                  }
                >
                  {[...testimonials, ...testimonials, ...testimonials].map((t, dupIdx) => {
                    const i = dupIdx % total;
                    const isActive = i === activeIdx;
                    const initials = getInitials(t.company);
                    const isPrimaryCopy = dupIdx >= total && dupIdx < 2 * total;

                    return (
                      <button
                        key={`${t.company}-${dupIdx}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-hidden={!isPrimaryCopy}
                        tabIndex={isPrimaryCopy ? 0 : -1}
                        aria-label={`${t.company}, testimonial from ${t.name}`}
                        onClick={() => jumpToDupIdx(dupIdx)}
                        onMouseEnter={isPrimaryCopy ? pause : undefined}
                        onMouseLeave={isPrimaryCopy ? resume : undefined}
                        onFocus={isPrimaryCopy ? pause : undefined}
                        onBlur={isPrimaryCopy ? resume : undefined}
                        className="relative shrink-0 h-16 w-16 md:h-[68px] md:w-[68px] flex items-center justify-center rounded-full"
                      >
                        <span
                          className={`absolute rounded-full overflow-hidden flex items-center justify-center bg-white border transition-[inset,opacity,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isActive
                              ? "inset-[3px] border-transparent opacity-100"
                              : "inset-3 md:inset-[14px] border-border opacity-60 hover:opacity-100"
                          }`}
                        >
                          {t.logo ? (
                            <Image
                              src={t.logo}
                              alt=""
                              aria-hidden
                              width={80}
                              height={80}
                              sizes="80px"
                              className={`object-contain transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                isActive ? "w-[70%] h-[70%]" : "w-[65%] h-[65%]"
                              }`}
                            />
                          ) : (
                            <span
                              className={`font-serif font-medium ${
                                isActive
                                  ? "text-primary text-base md:text-lg"
                                  : "text-text-muted text-xs md:text-sm"
                              }`}
                            >
                              {initials}
                            </span>
                          )}
                        </span>

                        {isActive && autoAdvance && (
                          <svg
                            key={`ring-${step}`}
                            aria-hidden
                            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="47"
                              fill="none"
                              stroke="var(--border)"
                              strokeWidth="2"
                              opacity="0.35"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="47"
                              fill="none"
                              stroke="var(--accent)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeDasharray="295.31"
                              strokeDashoffset="295.31"
                              className="[animation:ringFill_var(--slide-duration)_linear_forwards]"
                              onAnimationEnd={
                                isPrimaryCopy ? () => setStep((s) => s + 1) : undefined
                              }
                              style={
                                {
                                  animationPlayState: paused ? "paused" : "running",
                                  "--slide-duration": `${SLIDE_DURATION_MS}ms`,
                                } as React.CSSProperties
                              }
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
