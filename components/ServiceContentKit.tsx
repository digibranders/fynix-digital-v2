import type { CSSProperties, ReactNode } from "react";
import Reveal from "@/components/Reveal";

/**
 * Shared presentational kit for the dedicated service pages
 * (UI/UX, Development, SEO).
 *
 * Each page passes its own `Accent` — the same gold / sage / rose palette used
 * by the Four Growth Acts stack (see `actAccents` in `ActsStack`) — so the
 * detail pages inherit the exact colour signature of their pillar. These pieces
 * add editorial colour and premium 3D "clay-card" visuals to pages that were
 * previously text-only, while keeping every page structurally consistent.
 *
 * Server Component: renders the client `Reveal` and client card graphics as
 * children, but holds no client state itself.
 */

export type Accent = { from: string; to: string; ink: string };

/** Soft translucent border derived from the accent ink, for use on the band. */
function inkBorder(ink: string): string {
  return `color-mix(in srgb, ${ink} 22%, transparent)`;
}

/**
 * Small gradient chip used for numbered steps / service indices. Fills with the
 * accent gradient and prints the label in the accent's dark ink for contrast.
 */
export function AccentBadge({
  accent,
  children,
  className = "",
}: {
  accent: Accent;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-mono text-xs font-bold tabular-nums shadow-sm ring-1 ring-black/5 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
        color: accent.ink,
      }}
    >
      {children}
    </span>
  );
}

/** A single accent-tinted bullet dot, colour-matched to the pillar. */
export function AccentDot({ accent }: { accent: Accent }) {
  return (
    <span
      aria-hidden
      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: accent.from }}
    />
  );
}

/**
 * Dark-hero figure: the pillar's 3D clay-card graphic floated on a soft accent
 * glow so it reads as a premium product visual against the navy hero.
 */
export function ServiceHeroFigure({
  accent,
  children,
}: {
  accent: Accent;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 md:-inset-10 rounded-full blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${accent.from}, transparent 68%)`,
        }}
      />
      <div className="relative drop-shadow-[0_40px_60px_rgba(0,0,0,0.45)]">
        {children}
      </div>
    </div>
  );
}

export type BandPoint = { title: string; text: string };

/**
 * Full-bleed accent band — a bold editorial pull-quote on the pillar's gradient,
 * followed by three supporting value points. The gradient is biased toward the
 * light `to` stop (radial from the top-left corner) so the dark ink text keeps
 * comfortable contrast across the whole band.
 */
export function ServiceAccentBand({
  accent,
  eyebrow,
  quote,
  points,
}: {
  accent: Accent;
  eyebrow: string;
  quote: string;
  points: BandPoint[];
}) {
  const inkStyle: CSSProperties = { color: accent.ink };

  return (
    <section
      aria-label={eyebrow}
      className="relative isolate overflow-hidden"
    >
      {/* Base gradient — light-biased for text contrast */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(130% 130% at 6% 0%, ${accent.from} 0%, ${accent.to} 44%, ${accent.to} 100%)`,
        }}
      />
      {/* Soft highlight / shadow bloom */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.55), transparent 55%), radial-gradient(circle at 88% 88%, rgba(0,0,0,0.22), transparent 60%)",
        }}
      />
      {/* Fine engraved lines for a printed, tactile feel */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 22px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <Reveal>
          <span
            className="font-mono text-xs uppercase tracking-[0.25em] font-semibold opacity-80"
            style={inkStyle}
          >
            {eyebrow}
          </span>
          <blockquote
            className="font-serif italic text-3xl md:text-5xl font-medium leading-[1.15] mt-6 max-w-4xl text-balance"
            style={inkStyle}
          >
            {quote}
          </blockquote>
        </Reveal>

        <div
          className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 border-t pt-10"
          style={{ borderColor: inkBorder(accent.ink) }}
        >
          {points.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <div style={inkStyle}>
                <div className="font-serif text-xl md:text-2xl font-medium leading-snug">
                  {p.title}
                </div>
                <p className="text-sm md:text-base mt-2.5 leading-relaxed opacity-75">
                  {p.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
