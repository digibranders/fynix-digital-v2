"use client";

import { type CSSProperties, useEffect, useRef } from "react";

// Symmetric fade - dissolves into neighbouring sections at both edges so
// there is never a hard seam-line, regardless of whether the section above
// or below is white, cream, or dark. Applied to every layer so they all
// fall off together.
const FADE_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent 0%, black 12%, black 60%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, black 12%, black 60%, transparent 100%)",
};

const DOT_PATTERN =
  "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)";

type Props = {
  /**
   * Retained for API compatibility with call sites; the cursor-tracked
   * spotlight has been removed, so this prop is now a no-op.
   */
  static?: boolean;
  /**
   * When true, skips the bottom-fade mask so cream stays 100% opaque top
   * and bottom.
   */
  noFade?: boolean;
  /**
   * When true, omits the dot-grid layer.
   */
  noDots?: boolean;
};

// Ambient cream backdrop with an optional dot-grid texture and a
// cursor-tracked spotlight of brighter dots — the "sea-wave following
// your hand" interaction. Skips the spotlight for users who prefer
// reduced motion.
export default function SpotlightBackdrop({
  noFade = false,
  noDots = false,
}: Props = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeStyle: CSSProperties = noFade ? {} : FADE_MASK;

  useEffect(() => {
    if (noDots) return;
    const root = rootRef.current;
    if (!root) return;
    const section = root.parentElement;
    if (!section) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let frame = 0;
    let pendingX = 50;
    let pendingY = 50;
    let pendingActive = 0;

    const flush = () => {
      frame = 0;
      root.style.setProperty("--mx", `${pendingX}%`);
      root.style.setProperty("--my", `${pendingY}%`);
      root.style.setProperty("--active", String(pendingActive));
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(flush);
    };

    const onMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      pendingX = Math.max(-10, Math.min(110, x));
      pendingY = Math.max(-10, Math.min(110, y));
      pendingActive = 1;
      schedule();
    };
    const onEnter = onMove;
    const onLeave = () => {
      pendingActive = 0;
      schedule();
    };

    section.addEventListener("pointerenter", onEnter);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [noDots]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={
        {
          "--mx": "50%",
          "--my": "50%",
          "--active": "0",
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0"
        style={{ background: "var(--background-soft)", ...fadeStyle }}
      />

      {!noDots && (
        <>
          {/* Ambient dot grid — always visible, low contrast. */}
          <div
            className="absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage: DOT_PATTERN,
              backgroundSize: "24px 24px",
              ...fadeStyle,
            }}
          />

          {/* Interactive spotlight — a brighter dot grid, masked to a soft
              circle following the pointer. */}
          <div
            className="absolute inset-0 transition-[opacity] duration-500 ease-out"
            style={{
              backgroundImage: DOT_PATTERN,
              backgroundSize: "24px 24px",
              opacity: "calc(0.24 * var(--active, 0))",
              maskImage:
                "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 35%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 35%, transparent 75%)",
              willChange: "opacity",
            }}
          />
        </>
      )}
    </div>
  );
}
