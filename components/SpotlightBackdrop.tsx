import type { CSSProperties } from "react";

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

// Ambient cream backdrop with an optional dot-grid texture. No cursor
// interaction — the previous accent spotlight was removed to keep the
// surface calm.
export default function SpotlightBackdrop({
  noFade = false,
  noDots = false,
}: Props = {}) {
  const fadeStyle: CSSProperties = noFade ? {} : FADE_MASK;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{ background: "var(--background-soft)", ...fadeStyle }}
      />

      {!noDots && (
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            ...fadeStyle,
          }}
        />
      )}
    </div>
  );
}
