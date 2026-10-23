import type { ReactNode } from "react";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";

type Props = {
  eyebrow?: ReactNode;
  /** The page's single h1. Pass a node when the CMS supplies the heading as HTML. */
  heading: ReactNode;
  description?: string;
  children?: ReactNode;
};

const h1Class =
  "font-serif text-4xl sm:text-5xl lg:text-[56px] text-white font-medium leading-[1.1] tracking-tight text-balance max-w-4xl";

/** The dark page header the marketing pages share, sized for a blog title. */
export default function BlogHero({ eyebrow, heading, description, children }: Props) {
  return (
    <section
      data-nav-theme="dark"
      className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
    >
      <HeroDarkBackdrop />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {eyebrow ? (
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-accent mb-5">{eyebrow}</p>
        ) : null}
        {typeof heading === "string" ? (
          <h1 className={h1Class}>{heading}</h1>
        ) : (
          <div className={h1Class}>{heading}</div>
        )}
        {description ? (
          <p className="text-white/70 text-base md:text-lg font-normal leading-relaxed mt-6 max-w-2xl">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
