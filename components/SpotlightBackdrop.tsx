import type { CSSProperties } from "react";

// Bottom-only fade - cream stays flush at the top (so it butts up against
// a cream-toned section above without a seam) and dissolves into whatever
// lives below (white body, footer). Applied to every layer so they all
// fall off together.
const BOTTOM_FADE: CSSProperties = {
  maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
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
  const fadeStyle: CSSProperties = noFade ? {} : BOTTOM_FADE;

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
