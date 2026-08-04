import { stats } from "@/lib/content";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

export default function ImpactStats() {
  return (
    <section
      aria-labelledby="impact-heading"
      data-nav-theme="dark"
      className="py-16 md:py-20 bg-primary text-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <h2
              id="impact-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium leading-[1.1] tracking-tight text-balance"
            >
              Real outcomes,{" "}
              <span className="font-serif italic text-accent font-normal">
                measurable impact.
              </span>
            </h2>
          </div>
        </Reveal>

        <dl className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 border-t border-white/10 pt-12">
          {stats.map((stat, idx) => (
            <Reveal key={stat.label} delay={idx * 100}>
              <div className="flex flex-col">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-serif italic text-5xl sm:text-6xl md:text-7xl font-normal text-accent leading-none tracking-tight tabular-nums">
                  <CountUp value={stat.value} duration={1800} />
                </dd>
                <span className="text-sm md:text-base text-white/85 mt-4 font-normal leading-snug">
                  {stat.label}
                </span>
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
