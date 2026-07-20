import type { Metadata } from "next";
import Link from "next/link";
import ProcessTimeline from "@/components/ProcessTimeline";
import ProcessGantt from "@/components/ProcessGantt";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";

export const metadata: Metadata = {
  title: "Process",
  description:
    "A transparent, six-step engagement (Discover, Diagnose, Design, Build, Launch, Grow) so cybersecurity teams know exactly what happens after they say yes.",
  alternates: { canonical: "/process" },
};

const principles = [
  {
    numeral: "I",
    title: "One team, end to end",
    body: "The people who discover the problem are the people who design and ship the fix. No agency handoffs, no context loss.",
  },
  {
    numeral: "II",
    title: "Weekly demo cadence",
    body: "Every Friday you see progress in real interfaces, not slide decks. Feedback captured live, decisions logged.",
  },
  {
    numeral: "III",
    title: "Outcome-anchored",
    body: "Every workstream defends itself against a pipeline outcome. If a deliverable doesn't move a number, we don't build it.",
  },
];

const stats = [
  { value: "10", label: "Weeks, start to launch" },
  { value: "6", label: "Visible phases · 5 client gates" },
  { value: "40+", label: "Artifacts you keep, forever" },
];

const trades = [
  {
    give: "Access to product, sales, and marketing stakeholders",
    get: "Twelve interviews synthesised into a single buyer map",
  },
  {
    give: "Analytics, CRM, and existing brand assets",
    get: "A single source of truth about where pipeline actually leaks",
  },
  {
    give: "One decision-maker on your side for approvals",
    get: "Weekly decisions closed inside a single one-hour session",
  },
];

const notNeeded = [
  "A finished brief",
  "Existing wireframes",
  "Internal alignment before we start",
  "Approval from six committees",
];

const agenda = [
  { time: "0–5 min", topic: "What you're actually trying to move this quarter" },
  { time: "5–20 min", topic: "Where we'd look first, and what a first step could be" },
  { time: "20–30 min", topic: "Whether we're the right partner, honestly" },
];

export default function ProcessPage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-16 md:pt-24 pb-10 md:pb-14 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal variant="left">
            <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.22em]">
              <span className="text-accent font-semibold">Process</span>
              <span className="h-px w-8 bg-border" aria-hidden />
              <span className="text-text-muted">A ten-week engagement</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-primary font-normal mt-6 leading-[1.05] tracking-tight max-w-4xl">
              You&apos;ll always know{" "}
              <span className="font-serif italic text-accent-hover md:block">
                where the work is.
              </span>
            </h1>
            <p className="text-text-muted text-base md:text-lg font-light leading-relaxed mt-8 max-w-2xl">
              Ten weeks. Six visible phases. Each with a duration, an owner, a deliverable, and{" "}
              <span className="md:block">
                <span className="text-primary font-medium">
                  a decision you control at the end of it
                </span>
                , so you never have to guess{" "}
              </span>
              <span className="md:block">what is happening or when.</span>
            </p>
          </Reveal>

          <Reveal variant="up" delay={200} className="mt-14 md:mt-20">
            <div className="border-t border-border pt-10 md:pt-12">
              <ProcessGantt variant="compact" />
            </div>
          </Reveal>

          <Reveal variant="up" delay={280} className="mt-14 md:mt-16">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-border pt-10">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-4">
                  <dt className="font-serif italic text-5xl md:text-6xl text-primary leading-none tabular-nums">
                    <CountUp value={s.value} />
                  </dt>
                  <dd className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-muted leading-snug max-w-[10rem]">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ─── PRINCIPLES ────────────────────────────────────────── */}
      <section aria-label="Working principles" className="pt-16 md:pt-20 pb-16 md:pb-20 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-2xl mb-16 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold font-mono">
              How we work
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-normal mt-4 leading-[1.1] tracking-tight">
              Three commitments that shape every week.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12">
            {principles.map((p, idx) => (
              <Reveal key={p.title} delay={idx * 120} className="h-full">
                <div className="h-full pt-8 border-t border-primary/70 flex flex-col">
                  <span
                    aria-hidden
                    className="font-serif italic text-4xl text-accent-hover leading-none block"
                  >
                    {p.numeral}.
                  </span>
                  <h3 className="font-serif text-2xl text-primary font-normal mt-5 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-[15px] text-text-muted font-light leading-relaxed mt-4 flex-1">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────────── */}
      <section aria-label="Timeline" className="pt-16 md:pt-20 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-4xl mb-16">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
              Six steps · Ten weeks
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-normal mt-3 leading-tight text-balance">
              From first call to a live growth system.
              <br />
              What we ship keeps compounding.
            </h2>
          </Reveal>

          <ProcessTimeline />
        </div>
      </section>

      {/* ─── TRADE TABLE ──────────────────────────────────────── */}
      <section aria-label="What we need from you" className="pt-12 md:pt-16 pb-14 md:pb-20 bg-background-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal variant="left" className="max-w-3xl mb-14 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold font-mono">
              Your side of the table
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-normal mt-4 leading-[1.1] tracking-tight">
              A short list from you.{" "}
              <span className="font-serif italic text-accent-hover md:block">
                A growth system back.
              </span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={120}>
            <div className="border-t border-primary/70">
              <div className="grid grid-cols-12 py-4 text-[10px] font-mono uppercase tracking-[0.24em] text-text-muted border-b border-border">
                <div className="col-span-12 md:col-span-5">You bring</div>
                <div className="hidden md:block col-span-1 text-center">→</div>
                <div className="col-span-12 md:col-span-6 mt-2 md:mt-0">We turn it into</div>
              </div>
              {trades.map((t, i) => (
                <div
                  key={t.give}
                  className="grid grid-cols-12 py-6 md:py-8 border-b border-border items-baseline"
                >
                  <div className="col-span-12 md:col-span-5 flex gap-4">
                    <span className="font-mono text-[11px] text-accent tabular-nums pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base md:text-lg text-primary font-light leading-snug">
                      {t.give}
                    </span>
                  </div>
                  <div
                    className="hidden md:flex col-span-1 justify-center text-accent font-mono text-sm pt-1"
                    aria-hidden
                  >
                    →
                  </div>
                  <div className="col-span-12 md:col-span-6 mt-3 md:mt-0">
                    <p className="font-serif text-lg md:text-xl text-primary/90 leading-snug italic">
                      {t.get}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal variant="up" delay={200} className="mt-12 md:mt-16">
            <div className="border border-dashed border-border bg-background-soft/40 rounded-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8">
                <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary font-semibold flex-shrink-0">
                  What you don&apos;t need
                </span>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted font-light">
                  {notNeeded.map((n) => (
                    <li key={n} className="flex items-center gap-2">
                      <span className="text-accent" aria-hidden>×</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── CLOSING CTA ──────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-14 md:pt-20 pb-24 md:pb-32 bg-transparent">
        <PreFooterBackdrop />
        <div className="relative max-w-5xl mx-auto px-6 md:px-12">
          <Reveal className="text-center max-w-3xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold font-mono">
              Thirty minutes
            </span>
            <h2 className="font-serif text-4xl md:text-6xl text-primary font-normal leading-[1.05] tracking-tight mt-5">
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
                href="/work"
                className="text-sm text-primary font-medium underline underline-offset-4 decoration-accent decoration-2 hover:decoration-primary transition-colors"
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
