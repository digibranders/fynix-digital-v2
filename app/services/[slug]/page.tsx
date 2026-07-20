import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { acts, type Act } from "@/lib/content";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";

type Params = { slug: Act["slug"] };

export function generateStaticParams(): Params[] {
  return acts.map((act) => ({ slug: act.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const act = acts.find((a) => a.slug === slug);
  if (!act) return {};

  return {
    title: act.title,
    description: act.headline,
    alternates: { canonical: `/services/${act.slug}` },
    openGraph: {
      title: `${act.title} · ${act.subtitle}`,
      description: act.headline,
    },
  };
}

export default async function ServiceDetailPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const act = acts.find((a) => a.slug === slug);
  if (!act) notFound();

  const others = acts.filter((a) => a.slug !== act.slug);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden pt-12 md:pt-20 pb-24 md:pb-32 bg-gradient-to-b from-white to-background-soft">
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <Reveal variant="left" className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-mono text-accent font-semibold uppercase tracking-widest">
                Act {act.num}
              </span>
              <span className="h-px w-10 bg-border" aria-hidden />
              <Link
                href="/services"
                className="text-xs font-mono uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
              >
                All Services
              </Link>
            </div>

            <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
              {act.subtitle}
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-primary font-normal tracking-tight leading-[1.08] mt-4">
              {act.title}
            </h1>

            <p className="font-serif text-xl md:text-2xl text-primary/80 font-normal italic leading-snug mt-8 max-w-3xl">
              &ldquo;{act.headline}&rdquo;
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200 text-center"
              >
                Start with {act.title}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
              <Link
                href="/case-studies"
                className="inline-flex items-center justify-center px-8 py-4 text-primary hover:text-accent font-medium rounded-full border border-border bg-white hover:bg-background-soft cta-secondary transition-all duration-200 text-center"
              >
                See Related Work
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NARRATIVE */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
                Why It Matters
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-normal mt-3 leading-tight">
                The moment behind the discipline.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={120}>
              <p className="font-serif text-xl md:text-2xl text-primary font-normal leading-relaxed">
                {act.content}
              </p>
              <p className="text-base md:text-lg text-text-muted font-light leading-relaxed mt-6">
                {act.bullets}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="py-24 md:py-32 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
              Scope of Delivery
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-normal mt-2 max-w-2xl">
              Everything included under {act.title}.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {act.deliverables.map((item, idx) => (
              <Reveal key={item} delay={idx * 60}>
                <div className="h-full p-6 border border-border rounded-lg bg-white hover:border-accent/40 hover:-translate-y-1 transition-all duration-300">
                  <span className="text-xs font-mono text-accent font-semibold tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-xl text-primary font-medium mt-3">
                    {item}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OTHER ACTS */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
              Connected System
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-normal mt-2 max-w-2xl">
              {act.title} is one act. The full outcome comes from all four working together.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {others.map((other, idx) => (
              <Reveal key={other.slug} delay={idx * 100}>
                <Link
                  href={`/services/${other.slug}`}
                  className="h-full p-6 border border-border rounded-lg bg-background-soft/40 hover:bg-background-soft hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-xs font-mono text-accent font-semibold">
                      {other.num}
                    </span>
                    <h3 className="font-serif text-xl text-primary font-medium mt-3 group-hover:text-accent transition-colors">
                      {other.title}
                    </h3>
                    <p className="text-sm text-text-muted font-light mt-3 leading-relaxed">
                      {other.subtitle}
                    </p>
                  </div>
                  <span className="text-xs uppercase font-semibold text-accent tracking-widest mt-8 inline-flex items-center gap-2">
                    Explore <span aria-hidden>&rarr;</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden py-24 md:py-32 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
            Initiation
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-primary font-normal leading-tight mt-3">
            Ready to move on {act.title.toLowerCase()}?
          </h2>
          <p className="text-text-muted text-base font-light leading-relaxed mt-6 max-w-2xl mx-auto">
            Most engagements begin with a{" "}
            <strong className="font-medium text-primary">short discovery conversation</strong>.
            We&apos;ll map where {act.title} sits inside your current pipeline and where it would
            create the <strong className="font-medium text-primary">most lift</strong>.
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
            >
              Book a discovery call
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
