import { stats } from "@/lib/content";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

export default function ImpactStats() {
  return (
    <section
      aria-labelledby="impact-heading"
      data-nav-theme="dark"
      className="py-24 md:py-32 bg-primary text-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <h2
              id="impact-heading"
              className="font-serif text-2xl sm:text-3xl md:text-5xl font-medium leading-tight text-balance"
            >
              Five years, measurable outcomes.
            </h2>
          </div>
        </Reveal>

        <dl className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 border-t border-white/10 pt-12">
          {stats.map((stat, idx) => (
            <Reveal key={stat.label} delay={idx * 100}>
              <div className="flex flex-col">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-serif text-5xl md:text-6xl font-normal text-accent leading-none tabular-nums">
                  <CountUp value={stat.value} duration={1800} />
                </dd>
                <span className="text-sm text-white mt-4 font-medium">{stat.label}</span>
                {stat.sub ? (
                  <span className="text-xs uppercase tracking-widest text-white/50 font-mono mt-2">
                    {stat.sub}
                  </span>
                ) : null}
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
