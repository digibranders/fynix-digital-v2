import type { Metadata } from "next";
import Link from "next/link";
import ProcessTimeline from "@/components/ProcessTimeline";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";

export const metadata: Metadata = {
  title: "Process",
  description:
    "A transparent, six-step engagement (Discover, Diagnose, Design, Build, Launch, Grow) so cybersecurity teams know exactly what happens after they say yes.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[64px] text-white font-medium leading-[1.05] tracking-tight max-w-4xl">
            You&apos;ll always know{" "}
            <span className="font-serif italic text-[#e9af88] md:block">
              where the work is.
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg font-normal leading-relaxed mt-8 max-w-2xl">
            Ten weeks. Six visible phases. Each with a duration, an owner, and a decision you control, so you never have to guess what&apos;s happening.
          </p>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────────── */}
      <section aria-label="Timeline" className="pt-16 md:pt-20 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-4xl mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight text-balance">
              From first call to a live growth system.
            </h2>
          </Reveal>

          <ProcessTimeline />
        </div>
      </section>

      {/* ─── CLOSING CTA ──────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-14 md:pt-20 pb-24 md:pb-32 bg-transparent">
        <PreFooterBackdrop />
        <div className="relative max-w-5xl mx-auto px-6 md:px-12">
          <Reveal className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif italic text-4xl md:text-6xl text-primary font-medium leading-[1.05] tracking-tight">
              A conversation,{" "}
              <span className="font-serif italic">not a pitch.</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={160} className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
            >
              Start the conversation
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
