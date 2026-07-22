"use client";

import { type CSSProperties, useEffect, useRef } from "react";

// Backdrop for pre-footer CTA sections. Layers:
//   1. Cream fill (the section's "island" tone)
//   2. Low-opacity ambient dot-grid texture (always on)
//   3. Cursor-tracked spotlight of brighter dots, masked to a soft
//      circle that follows the pointer — gives a premium "sea-wave
//      following your hand" illusion. Fades in/out gracefully.
//
// All layers share a linear-gradient edge mask, composited to intersect,
// so the whole backdrop fades to zero at top / bottom / sides — no
// visible seam with neighbouring sections. The parent <section> must
// be `relative isolate overflow-hidden` and should be `bg-transparent`.
const EDGE_FADE: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

const DOT_PATTERN =
  "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)";

export default function PreFooterBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const section = root.parentElement;
    if (!section) return;

    // Skip the effect for users who prefer reduced motion — the base
    // dot grid remains, they just don't get the spotlight interaction.
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
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={
        {
          // Initial defaults — get overwritten by the pointermove handler.
          "--mx": "50%",
          "--my": "50%",
          "--active": "0",
        } as CSSProperties
      }
    >
      {/* Cream fill — the section's tinted "island" surface. */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--background-soft)", ...EDGE_FADE }}
      />

      {/* Ambient dot grid — always visible, low contrast. */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: DOT_PATTERN,
          backgroundSize: "26px 26px",
          ...EDGE_FADE,
        }}
      />

      {/* Interactive spotlight — a brighter dot grid, masked to a soft
          circle following the pointer. The `--active` var fades the
          whole layer in/out; the mask centres on `--mx / --my`. */}
      <div
        className="absolute inset-0 transition-[opacity] duration-500 ease-out"
        style={{
          backgroundImage: DOT_PATTERN,
          backgroundSize: "26px 26px",
          opacity: "calc(0.22 * var(--active, 0))",
          maskImage:
            "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 35%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 35%, transparent 75%)",
          willChange: "opacity, mask-position",
        }}
      />
    </div>
  );
}
