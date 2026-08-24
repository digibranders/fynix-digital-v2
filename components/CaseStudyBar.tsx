"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Target width of the bar as a percentage (0 to 100). */
  percent: number;
  /** Entrance delay in milliseconds, staggered per row. */
  delay?: number;
  /** Optional override for the fill color; defaults to the accent token. */
  tone?: "accent" | "primary";
  className?: string;
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * A horizontal meter that grows from zero to its target width once scrolled
 * into view. Respects reduced-motion by snapping straight to the final width.
 */
export default function CaseStudyBar({
  percent,
  delay = 0,
  tone = "accent",
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const target = Math.max(0, Math.min(100, percent));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // When IntersectionObserver is unavailable, grow on the next frame so the
    // bar never stays stuck at zero width. Deferring keeps the state update out
    // of the effect body itself.
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setGrown(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setGrown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`h-2 w-full overflow-hidden rounded-full bg-primary/5 ${className}`}
    >
      <div
        className={`h-full rounded-full ${
          tone === "accent" ? "bg-accent" : "bg-primary"
        }`}
        style={{
          width: grown ? `${target}%` : "0%",
          transition: reduced ? "none" : `width 1200ms ${EASE}`,
          transitionDelay: reduced ? "0ms" : `${delay}ms`,
        }}
      />
    </div>
  );
}
