import type { Metadata } from "next";
import Link from "next/link";
import ProcessTimeline from "@/components/ProcessTimeline";
import ProcessGantt from "@/components/ProcessGantt";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";

export const metadata: Metadata = {
  title: "Process",
  description:
    "A transparent, six-step engagement (Discover, Diagnose, Design, Build, Launch, Grow) so cybersecurity teams know exactly what happens after they say yes.",
  alternates: { canonical: "/process" },
};

const agenda = [
  { time: "0–5 min", topic: "What you're actually trying to move this quarter" },
  { time: "5–20 min", topic: "Where we'd look first, and what a first step could be" },
  { time: "20–30 min", topic: "Whether we're the right partner, honestly" },
];

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
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-medium leading-[1.05] tracking-tight max-w-4xl">
            You&apos;ll always know{" "}
            <span className="font-serif italic text-[#e9af88] md:block">
              where the work is.
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mt-8 max-w-2xl">
            Ten weeks. Six visible phases. Each with a duration, an owner, and a decision you control, so you never have to guess what&apos;s happening.
          </p>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────────── */}
      <section className="pt-16 md:pt-20 pb-10 md:pb-14 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal variant="up">
            <ProcessGantt variant="full" />
          </Reveal>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────────── */}
      <section aria-label="Timeline" className="pt-16 md:pt-20 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-4xl mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight text-balance">
              From first call to a live growth system.
              <br />
              What we ship keeps compounding.
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

          <Reveal variant="up" delay={160} className="mt-14">
            <div className="mx-auto max-w-2xl border border-border bg-white/70 backdrop-blur-sm rounded-sm p-8 md:p-10">
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.24em] text-primary font-semibold">
                <span className="h-px w-6 bg-accent" aria-hidden />
                Agenda
              </div>
              <ol className="mt-6 space-y-4">
                {agenda.map((item) => (
                  <li
                    key={item.time}
                    className="grid grid-cols-12 gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0"
                  >
                    <span className="col-span-4 md:col-span-3 text-[11px] font-mono uppercase tracking-[0.18em] text-accent pt-1">
                      {item.time}
                    </span>
                    <span className="col-span-8 md:col-span-9 text-[15px] md:text-base text-primary font-light leading-snug">
                      {item.topic}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal variant="up" delay={240} className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
              >
                Book the 30 minutes
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/case-studies"
                className="text-sm text-primary font-medium hover:text-accent transition-colors"
              >
                Or see how a past engagement ran
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
