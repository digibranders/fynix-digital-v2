import Link from "next/link";
import { engagementModels } from "@/lib/content";
import Reveal from "./Reveal";

export default function EngagementModels() {
  return (
    <section
      aria-labelledby="engagement-heading"
      className="pt-16 md:pt-20 pb-16 md:pb-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-4xl">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
              How to work with us
            </span>
            <h2
              id="engagement-heading"
              className="font-serif text-4xl md:text-5xl text-primary font-normal mt-3 leading-tight text-balance"
            >
              Three ways to start. Every one, anchored to pipeline.
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {engagementModels.map((model, idx) => (
            <Reveal key={model.name} delay={idx * 100}>
              <article
                className={`h-full flex flex-col p-8 rounded-xl border transition-all duration-300 ${
                  model.featured
                    ? "bg-primary text-white border-primary shadow-md md:-translate-y-2"
                    : "bg-white text-primary border-border hover:border-accent/40"
                }`}
              >
                {model.featured ? (
                  <span className="self-start text-xs font-mono uppercase tracking-widest text-accent bg-white/10 border border-white/20 px-2 py-1 rounded mb-6">
                    Most chosen
                  </span>
                ) : (
                  <span className="self-start text-xs font-mono uppercase tracking-widest text-text-muted mb-6">
                    Engagement
                  </span>
                )}

                <h3 className="font-serif text-2xl font-normal">{model.name}</h3>

                <div
                  className={`mt-4 pb-4 border-b flex items-baseline justify-between gap-4 ${
                    model.featured ? "border-white/15" : "border-border"
                  }`}
                >
                  <span
                    className={`text-sm font-mono uppercase tracking-widest ${
                      model.featured ? "text-white/60" : "text-text-muted"
                    }`}
                  >
                    {model.price}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      model.featured ? "text-accent" : "text-accent"
                    }`}
                  >
                    {model.duration}
                  </span>
                </div>

                <p
                  className={`text-sm mt-4 font-light leading-relaxed ${
                    model.featured ? "text-white/80" : "text-text-muted"
                  }`}
                >
                  <span
                    className={`text-xs uppercase font-mono tracking-widest block mb-2 ${
                      model.featured ? "text-white/60" : "text-text-muted/80"
                    }`}
                  >
                    Best for
                  </span>
                  {model.bestFor}
                </p>

                <ul
                  className={`mt-6 pt-6 border-t space-y-3 text-sm font-light ${
                    model.featured ? "border-white/15 text-white/85" : "border-border text-text-muted"
                  }`}
                >
                  {model.scope.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span
                        aria-hidden
                        className={`h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 ${
                          model.featured ? "bg-accent" : "bg-accent/60"
                        }`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`mt-8 inline-flex items-center justify-center py-3 rounded-full font-semibold text-xs uppercase tracking-widest transition-colors duration-200 ${
                    model.featured
                      ? "bg-accent text-primary hover:bg-accent-hover"
                      : "border border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  Enquire
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
