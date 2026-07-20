"use client";

import { useState } from "react";

function faviconFor(domain: string) {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

function monogramFor(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export type DossierTileProps = {
  domain: string;
  name: string;
  index?: number;
  iconUrl?: string;
  size?: "lg" | "sm";
  /**
   * Bottom-right tick label. Defaults: "Verified" for lg, "N°XX" for sm
   * (derived from `index` if provided).
   */
  tickLabel?: string;
  /** Render the company name in white beneath the favicon disc. */
  showName?: boolean;
};

// Dark navy "dossier" tile — grid pattern, radial glow, corner crop marks,
// a white favicon disc in the middle, and an editorial tick label at the
// bottom-right. Fills its parent absolutely; the parent should be
// `relative` with a chosen aspect ratio.
export default function DossierTile({
  domain,
  name,
  index,
  iconUrl,
  size = "lg",
  tickLabel,
  showName = false,
}: DossierTileProps) {
  const disc = size === "lg" ? "w-24 h-24" : "w-16 h-16";
  const icon = size === "lg" ? "w-11 h-11" : "w-8 h-8";
  const monoText = size === "lg" ? "text-3xl" : "text-xl";
  const sources = [iconUrl, faviconFor(domain)].filter(
    (s): s is string => typeof s === "string",
  );
  const [sourceIdx, setSourceIdx] = useState(0);
  const currentSrc = sources[sourceIdx];
  const failed = !currentSrc;

  const resolvedTick =
    tickLabel ??
    (size === "lg"
      ? "Verified"
      : `N°${String(index ?? 0).padStart(2, "0")}`);

  return (
    <div className="absolute inset-0 bg-primary overflow-hidden">
      {/* Fine grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: size === "lg" ? "40px 40px" : "28px 28px",
        }}
        aria-hidden
      />

      {/* Radial accent glow, top-right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 78% 22%, rgba(233,175,136,0.18), transparent 55%)",
        }}
        aria-hidden
      />

      {/* Soft vignette bottom-left for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 90%, rgba(0,0,0,0.35), transparent 60%)",
        }}
        aria-hidden
      />

      {/* Corner crop marks — subtle editorial detail */}
      <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/15" aria-hidden />
      <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-white/15" aria-hidden />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-white/15" aria-hidden />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-white/15" aria-hidden />

      {/* Lockup: favicon + optional company name */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        {showName ? (
          <div className="flex items-center gap-4 md:gap-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
            {failed ? (
              <span
                className={`font-serif ${monoText} text-white font-normal tracking-tight`}
                aria-label={`${name} monogram`}
              >
                {monogramFor(name)}
              </span>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={currentSrc}
                src={currentSrc}
                alt={`${name} logo`}
                className={`${icon} object-contain`}
                loading="lazy"
                decoding="async"
                onError={() => setSourceIdx((i) => i + 1)}
                style={{ filter: "brightness(0) invert(1)" }}
              />
            )}
            <span
              className={`font-serif font-normal tracking-tight text-white leading-none ${
                size === "lg" ? "text-3xl md:text-5xl" : "text-2xl"
              }`}
            >
              {name}
            </span>
          </div>
        ) : (
          <div
            className={`${disc} rounded-full bg-background-soft ring-1 ring-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105`}
          >
            {failed ? (
              <span
                className={`font-serif ${monoText} text-primary font-normal tracking-tight`}
                aria-label={`${name} monogram`}
              >
                {monogramFor(name)}
              </span>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={currentSrc}
                src={currentSrc}
                alt={`${name} logo`}
                className={`${icon} object-contain`}
                loading="lazy"
                decoding="async"
                onError={() => setSourceIdx((i) => i + 1)}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom-right accent tick */}
      <div className="absolute bottom-5 right-5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
        <span className="w-4 h-px bg-accent" aria-hidden />
        {resolvedTick}
      </div>
    </div>
  );
}
