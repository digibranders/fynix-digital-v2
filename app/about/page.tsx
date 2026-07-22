import type { Metadata } from "next";
import Link from "next/link";
import PhilosophyDiagram from "@/components/PhilosophyDiagram";
import Reveal from "@/components/Reveal";
import TeamGrid from "@/components/TeamGrid";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";

export const metadata: Metadata = {
  title: "Philosophy",
  description:
    "Most agencies deliver activities. Fynix builds systems for growth: a unified UX, engineering, SEO, and lead-generation pipeline for cybersecurity companies.",
  alternates: { canonical: "/about" },
};

const pillars: { numeral: string; title: string; body: React.ReactNode }[] = [
  {
    numeral: "I",
    title: "Sector focus",
    body: (
      <>
        We work{" "}
        <strong className="font-medium text-primary">
          almost exclusively with cybersecurity companies
        </strong>
        . Messaging, sales-cycle understanding, and buyer research are calibrated to that
        market.
      </>
    ),
  },
  {
    numeral: "II",
    title: "One team",
    body: (
      <>
        Design, engineering, SEO, and demand generation share a single roadmap.{" "}
        <strong className="font-medium text-primary">
          No agency handoffs, no context loss
        </strong>
        , no finger-pointing when metrics move.
      </>
    ),
  },
  {
    numeral: "III",
    title: "Outcome contracts",
    body: (
      <>
        Every engagement is anchored to a pipeline outcome: qualified conversations, sourced
        opportunities, or booked revenue.{" "}
        <strong className="font-medium text-primary">
          Not the number of assets delivered.
        </strong>
      </>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl md:text-6xl text-white font-medium leading-tight tracking-tight max-w-4xl text-balance">
            Activities aren&apos;t growth.{" "}
            <span className="font-serif italic text-[#e9af88] md:block">
              Systems are.
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg font-normal leading-relaxed mt-8 max-w-2xl">
            Activity without alignment is noise. Real momentum shows up when every
            discipline runs on one continuous pipeline, owned by one team.
          </p>
        </div>
      </section>

      {/* ─── PIPELINE DIAGRAM ─────────────────────────────────── */}
      <section
        aria-label="Growth pipeline"
        className="pt-16 md:pt-24 pb-10 md:pb-14 bg-background-soft"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-2xl mb-14 md:mb-16">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium leading-[1.1] tracking-tight">
              Four disciplines,{" "}
              <span className="font-serif italic text-accent-hover">
                one continuous loop.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <PhilosophyDiagram />
          </Reveal>
        </div>
      </section>

      {/* ─── COMMITMENTS ─────────────────────────────────────── */}
      <section
        aria-label="Working commitments"
        className="pt-10 md:pt-14 pb-16 md:pb-24 bg-background-soft"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-2xl mb-16 md:mb-20">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium leading-[1.1] tracking-tight">
              Three commitments that shape every engagement.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12">
            {pillars.map((p, idx) => (
              <Reveal key={p.title} delay={idx * 120} className="h-full">
                <div className="h-full pt-8 border-t border-primary/70 flex flex-col">
                  <span
                    aria-hidden
                    className="font-serif italic text-4xl text-accent-hover leading-none block"
                  >
                    {p.numeral}.
                  </span>
                  <h3 className="font-serif text-2xl text-primary font-medium mt-5 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-[15px] text-text-muted font-normal leading-relaxed mt-4 flex-1">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─────────────────────────────────────────────── */}
      <TeamGrid />

      {/* ─── CLOSING CTA ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-16 md:pt-24 pb-24 md:pb-32 bg-transparent">
        <PreFooterBackdrop />
        <div className="relative max-w-4xl mx-auto px-6 md:px-12 text-center">
          <Reveal>
            <h2 className="font-serif italic text-4xl md:text-6xl text-primary font-medium leading-[1.05] tracking-tight">
              Ready to see what this looks like for you?
            </h2>
          </Reveal>

          <Reveal variant="up" delay={160} className="mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
              >
                Start a conversation
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/case-studies"
                className="inline-flex items-center justify-center px-8 py-4 text-primary hover:text-accent font-medium rounded-full border border-border bg-white hover:bg-background-soft cta-secondary transition-all duration-200"
              >
                See our case studies
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
