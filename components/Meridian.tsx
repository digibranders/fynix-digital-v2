"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

type Tone = "warm" | "cool";
type Height = "sm" | "md" | "lg";

type MeridianProps = {
  /** Spark rest position along the line (0 = left edge, 1 = right edge). Default 0.35. */
  sparkAt?: number;
  /** Spark colour family. Default "warm" (accent). */
  tone?: Tone;
  /** Show the faint grid backdrop. Default true. */
  grid?: boolean;
  /** Vertical space of the band. Default "md" (96px). */
  height?: Height;
  /** Play a slow post-settle drift on the spark. Default true. */
  drift?: boolean;
  /** Optional extra classes on the outer band. */
  className?: string;
};

const TONE: Record<Tone, { core: string; glow: string }> = {
  warm: { core: "#F4C99A", glow: "rgba(233, 175, 136, 0.55)" },
  cool: { core: "#C8DFFF", glow: "rgba(180, 205, 240, 0.5)" },
};

const HEIGHT: Record<Height, string> = {
  sm: "h-16",
  md: "h-24",
  lg: "h-32",
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function Meridian({
  sparkAt = 0.35,
  tone = "warm",
  grid = true,
  height = "md",
  drift = true,
  className = "",
}: MeridianProps) {
  const bandRef = useRef<HTMLDivElement | null>(null);
  const [play, setPlay] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = bandRef.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    resize.observe(node);

    if (reduce) {
      queueMicrotask(() => setPlay(true));
      return () => resize.disconnect();
    }

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
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      resize.disconnect();
      observer.disconnect();
    };
  }, []);

  const position = clamp(sparkAt, 0.02, 0.98);
  const centerX = width / 2;
  const targetX = width * position;
  const sparkTone = TONE[tone];

  const sparkStyle: CSSProperties = {
    transform: `translate3d(${play ? targetX : centerX}px, -50%, 0)`,
    opacity: play ? 1 : 0,
    transition: play
      ? "transform 720ms cubic-bezier(0.22, 1, 0.36, 1) 620ms, opacity 400ms ease-out 720ms"
      : "none",
    "--meridian-spark-core": sparkTone.core,
    "--meridian-spark-glow": sparkTone.glow,
  } as CSSProperties;

  return (
    <div
      ref={bandRef}
      aria-hidden
      data-play={play ? "" : undefined}
      className={`meridian relative w-full overflow-hidden bg-primary ${HEIGHT[height]} ${className}`}
    >
      {grid ? <span className="meridian__grid" /> : null}
      <span className="meridian__line" />
      <span className="meridian__spark" style={sparkStyle}>
        <span className="meridian__spark-core" />
        <span
          className={`meridian__spark-glow${drift ? " meridian__spark-glow--drift" : ""}`}
        />
      </span>
    </div>
  );
}
