import type { CSSProperties } from "react";

// Backdrop for pre-footer CTA sections. Three stacked static layers:
//   1. Cream fill (the section's "island" tone)
//   2. Low-opacity dot-grid texture
//   3. Static warm-peach ambient glow (off-center)
//
// All layers share a linear-gradient edge mask, composited to intersect,
// so the whole backdrop fades to zero at top / bottom / sides - no
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

export default function PreFooterBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Cream fill - the section's tinted "island" surface. */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--background-soft)", ...EDGE_FADE }}
      />

      {/* Dot grid - the "texture" layer. */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          ...EDGE_FADE,
        }}
      />

      {/* Warm peach glow - off-center ambient wash. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 65% at 30% 50%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, color-mix(in srgb, var(--accent) 8%, transparent) 45%, transparent 78%)",
          ...EDGE_FADE,
        }}
      />
    </div>
  );
}
