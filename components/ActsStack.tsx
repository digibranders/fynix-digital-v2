import Link from "next/link";
import type { Act } from "@/lib/content";

const HEADER_HEIGHT = 80;
const STACK_PEEK = 68;

export const actAccents: Record<Act["slug"], { from: string; to: string; ink: string }> = {
  "ui-ux": { from: "#c9b57a", to: "#f5ecd5", ink: "#5a4a1e" },
  development: { from: "#7f9c95", to: "#dce8e4", ink: "#243a35" },
  seo: { from: "#b1786c", to: "#efd9d1", ink: "#4c231c" },
  "lead-generation": { from: "#7a6e9c", to: "#e0d9ef", ink: "#2b2144" },
};

type Props = { acts: Act[] };

export default function ActsStack({ acts }: Props) {
  return (
    <div className="relative">
      {acts.map((act, i) => {
        const accent = actAccents[act.slug];
        const stickyTop = HEADER_HEIGHT + i * STACK_PEEK;

        return (
          <article
            key={act.slug}
            style={{ top: `${stickyTop}px`, zIndex: 10 + i }}
            className="relative lg:sticky mb-6 lg:mb-0 rounded-2xl overflow-hidden border border-border bg-white shadow-[0_30px_60px_-40px_rgba(0,0,0,0.15)] lg:min-h-[calc(100vh-160px)] flex flex-col"
          >
            <header
              className="flex items-center gap-4 px-6 md:px-10 border-b border-border bg-white"
              style={{
                height: `${STACK_PEEK}px`,
                boxShadow: `inset 4px 0 0 0 ${accent.from}`,
              }}
            >
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted tabular-nums">
                Act {act.num}
              </span>
              <span aria-hidden className="h-3 w-px bg-border" />
              <span className="font-serif italic text-lg md:text-xl text-primary">
                {act.title}
              </span>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 p-6 md:p-10 lg:p-14 flex-1">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="font-serif italic text-6xl md:text-7xl lg:text-[92px] text-primary font-normal leading-[0.9] tracking-tight mb-8 md:mb-10">
                  {act.title}
                </div>
                <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
                  {act.subtitle}
                </span>
                <h3 className="font-serif text-2xl md:text-4xl lg:text-[42px] text-primary font-normal mt-4 leading-[1.15]">
                  {act.headline}
                </h3>
                <p className="text-text-muted text-base md:text-lg font-light leading-relaxed mt-6 max-w-xl">
                  {act.content}
                </p>

                <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {act.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-primary/85 font-light"
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/services/${act.slug}`}
                  className="mt-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent border-b border-accent pb-1 hover:text-primary hover:border-primary cta-underline transition-colors self-start"
                >
                  Explore {act.title}
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>

              <div className="lg:col-span-6 relative min-h-[240px] md:min-h-[320px] lg:min-h-0 rounded-xl overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 mix-blend-overlay opacity-70"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 25% 30%, rgba(255,255,255,0.55), transparent 55%), radial-gradient(circle at 85% 75%, rgba(0,0,0,0.25), transparent 60%)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(115deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 22px)",
                  }}
                />

                <div
                  className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex items-end justify-between"
                  style={{ color: accent.ink }}
                >
                  <span className="font-mono text-xs uppercase tracking-widest opacity-80">
                    {act.num}. {act.title}
                  </span>
                  <span
                    aria-hidden
                    className="font-serif italic text-4xl md:text-6xl font-normal opacity-80 leading-none"
                  >
                    {act.num}
                  </span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
