import type { ReactNode } from "react";

type Station = {
  code: string;
  step: string;
  title: string;
  role: string;
  icon: ReactNode;
};

// Hairline SVG glyphs, one per station. currentColor + stroke-only so they
// inherit the palette (§8: meaningful icons, in-brand, one per distinct
// concept). aria-hidden — the station code + title carries the semantics.
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const stations: Station[] = [
  {
    code: "UX",
    step: "01",
    title: "Trust",
    role: "The interface earns confidence before a single word is read.",
    icon: (
      // Interface frame — a stand-in for the UI layer buyers first see.
      <svg {...iconProps} className="h-5 w-5">
        <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <circle cx="6" cy="6.75" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="8.5" cy="6.75" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    code: "DEV",
    step: "02",
    title: "Speed",
    role: "Engineering keeps the promise the design just made.",
    icon: (
      // Code brackets — the engineering discipline.
      <svg {...iconProps} className="h-5 w-5">
        <polyline points="8 7 3 12 8 17" />
        <polyline points="16 7 21 12 16 17" />
        <line x1="13.5" y1="6" x2="10.5" y2="18" />
      </svg>
    ),
  },
  {
    code: "SEO",
    step: "03",
    title: "Search",
    role: "Presence built into the pages buyers are already looking at.",
    icon: (
      // Magnifier — visibility in search.
      <svg {...iconProps} className="h-5 w-5">
        <circle cx="10.5" cy="10.5" r="6" />
        <line x1="20" y1="20" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    code: "GEN",
    step: "04",
    title: "Pipeline",
    role: "Visibility turned into real, intent-led conversations.",
    icon: (
      // Funnel — visibility narrowing into pipeline.
      <svg {...iconProps} className="h-5 w-5">
        <path d="M3.5 5 L20.5 5 L14.5 12 L14.5 20 L9.5 18 L9.5 12 Z" />
      </svg>
    ),
  },
];

export default function PhilosophyDiagram() {
  return (
    <figure
      aria-label="The connected growth pipeline: UX to Development to SEO to Lead Generation"
      className="not-prose"
    >
      {/* ── Desktop: editorial column rail ── */}
      <div className="hidden md:block">
        <div className="relative border-t border-primary/80">
          <div className="grid grid-cols-4">
            {stations.map((s, idx) => (
              <div
                key={s.code}
                className={`relative pt-10 pb-2 px-6 lg:px-8 ${
                  idx > 0 ? "border-l border-border/70" : ""
                }`}
              >
                <div
                  className={idx === 0 ? "text-accent-hover" : "text-primary/60"}
                >
                  {s.icon}
                </div>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="relative font-serif italic text-4xl text-accent-hover leading-none">
                    {s.step}
                    {idx === 0 && (
                      <span
                        aria-hidden
                        className="absolute -bottom-2 left-0 h-px w-full bg-accent"
                      />
                    )}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary font-semibold">
                    {s.code}
                  </span>
                </div>
                <h3 className="font-serif text-[26px] text-primary font-normal mt-8 leading-[1.15]">
                  {s.title}
                </h3>
                <p className="text-sm text-text-muted font-light leading-relaxed mt-4">
                  {s.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Direction caption */}
        <div className="mt-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.28em] text-text-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-accent font-semibold">Entry</span>
          <span aria-hidden className="h-px w-8 bg-border" />
          <span>Each stage compounds the next</span>
          <span aria-hidden className="text-accent">→</span>
        </div>
      </div>

      {/* ── Mobile: vertical timeline ── */}
      <div className="md:hidden">
        <div className="border-t border-primary/80 pt-8">
          <ol className="space-y-10">
            {stations.map((s, idx) => (
              <li key={s.code} className="relative">
                {idx < stations.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-4 top-9 h-[calc(100%+2.5rem)] w-px border-l border-dashed border-primary/30"
                  />
                )}
                <div className="flex items-start gap-5">
                  <div
                    className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      idx === 0
                        ? "bg-primary text-white ring-[3px] ring-accent/30 ring-offset-2 ring-offset-background-soft"
                        : "bg-background-soft border border-primary text-primary"
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold tracking-widest">
                      {s.step}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          idx === 0 ? "text-accent-hover" : "text-primary/60"
                        }
                      >
                        {s.icon}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary font-semibold">
                        {s.code}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-primary font-normal mt-3 leading-tight">
                      {s.title}
                    </h3>
                    <p className="text-sm text-text-muted font-light leading-relaxed mt-3">
                      {s.role}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

    </figure>
  );
}
