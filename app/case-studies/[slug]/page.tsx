import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import SpotlightBackdrop from "@/components/SpotlightBackdrop";
import DossierTile from "@/components/DossierTile";
import { caseStudies, type CaseStudy } from "@/lib/content";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return caseStudies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) return {};
  return {
    title: `${study.name} · Case Study`,
    description: study.description,
    alternates: { canonical: `/case-studies/${study.slug}` },
    openGraph: {
      title: `${study.name} · Fynix Case Study`,
      description: study.description,
      images: [{ url: study.image }],
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) notFound();

  const orderIndex = caseStudies.findIndex((s) => s.slug === slug) + 1;
  const primaryTag = study.tags[0];
  const sameTag = caseStudies.filter(
    (s) => s.slug !== slug && s.tags.includes(primaryTag),
  );
  const fallback = caseStudies.filter((s) => s.slug !== slug);
  const related = (sameTag.length >= 2 ? sameTag : fallback).slice(0, 2);

  return (
    <>
      {/* HEADER */}
      <section className="relative isolate overflow-hidden pt-12 md:pt-16 pb-10 md:pb-14 bg-transparent">
        <SpotlightBackdrop />
        <div className="relative max-w-6xl mx-auto px-6 md:px-12">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7 7-7M3 12h18"
              />
            </svg>
            All Case Studies
          </Link>

          <Reveal className="mt-10">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
                Case Study · Nº{String(orderIndex).padStart(2, "0")}
              </span>
              <span className="hidden sm:block h-px w-8 bg-border" aria-hidden />
              <span className="text-xs font-mono text-text-muted">
                Live at {study.domain}
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-6xl text-primary font-normal mt-4 leading-[1.05] tracking-tight max-w-4xl">
              {study.name}
            </h1>

            <p className="text-text-muted text-lg md:text-xl font-light leading-relaxed mt-6 max-w-2xl">
              {study.description}.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {study.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* HERO SCREENSHOT */}
      <section className="bg-background-soft pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal>
            <div className="group relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border shadow-[0_30px_80px_-40px_rgba(12,30,46,0.25)]">
              <DossierTile
                domain={study.domain}
                name={study.name}
                iconUrl={study.iconUrl}
                index={orderIndex}
                size="lg"
                showName
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* DETAILS + CTA */}
      <section className="pb-24 md:pb-32 bg-background-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <span className="text-[10px] uppercase tracking-widest text-accent font-semibold font-mono">
              Overview
            </span>
            <p className="mt-4 text-base md:text-lg text-primary/90 font-light leading-relaxed">
              {study.description}. Shipped and live in production at{" "}
              <a
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-accent text-primary hover:text-accent transition-colors"
              >
                {study.domain}
              </a>
              .
            </p>

            <div className="mt-10">
              <a
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
              >
                Visit the live site
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 3h7v7M10 14L21 3M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5"
                  />
                </svg>
              </a>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-5">
            <dl className="rounded-xl border border-border bg-white p-6 md:p-8 divide-y divide-border">
              <div className="pb-5">
                <dt className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                  Client
                </dt>
                <dd className="mt-1 font-serif italic text-2xl text-primary">
                  {study.name}
                </dd>
              </div>
              <div className="py-5">
                <dt className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                  Live at
                </dt>
                <dd className="mt-1 text-sm font-mono text-primary">
                  <a
                    href={study.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {study.domain} ↗
                  </a>
                </dd>
              </div>
              {study.industry && (
                <div className="py-5">
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                    Industry
                  </dt>
                  <dd className="mt-1 text-sm text-primary/90 font-light">
                    {study.industry}
                  </dd>
                </div>
              )}
              <div className="py-5">
                <dt className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                  Categories
                </dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {study.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-primary"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
              {study.metric && (
                <div className="pt-5">
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                    Result
                  </dt>
                  <dd className="mt-2 flex items-baseline gap-3">
                    <span className="font-serif text-4xl text-primary leading-none">
                      {study.metric.value}
                    </span>
                    <span className="text-xs font-light text-text-muted">
                      {study.metric.label}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* NARRATIVE - Challenge / Solution / Execution / Results */}
      {(study.challenge ||
        study.solution?.length ||
        study.execution?.length ||
        study.results?.length) && (
        <section className="py-20 md:py-28 bg-white border-t border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 gap-16 md:gap-20">
            {study.challenge && (
              <NarrativeBlock eyebrow="The Challenge">
                <p className="font-serif text-2xl md:text-3xl text-primary font-normal leading-snug tracking-tight max-w-3xl">
                  {study.challenge}
                </p>
              </NarrativeBlock>
            )}

            {study.solution && study.solution.length > 0 && (
              <NarrativeBlock eyebrow="Our Solution">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 max-w-4xl">
                  {study.solution.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 text-base md:text-lg text-primary/85 font-light leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </NarrativeBlock>
            )}

            {study.execution && study.execution.length > 0 && (
              <NarrativeBlock eyebrow="Execution">
                <div className="flex flex-wrap gap-3 max-w-4xl">
                  {study.execution.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-border bg-background-soft px-4 py-2 text-sm font-mono text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </NarrativeBlock>
            )}

            {study.results && study.results.length > 0 && (
              <NarrativeBlock eyebrow="Results">
                <ul className="grid grid-cols-1 gap-3 max-w-3xl">
                  {study.results.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 text-base md:text-lg text-primary font-normal leading-relaxed border-l-2 border-accent pl-5 py-1"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </NarrativeBlock>
            )}
          </div>
        </section>
      )}

      {/* RELATED WORK */}
      {related.length > 0 && (
        <section className="py-16 md:py-24 bg-background-soft border-t border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
                  More work
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-primary font-normal mt-2">
                  Related case studies
                </h2>
              </div>
              <Link
                href="/case-studies"
                className="text-xs font-semibold uppercase tracking-widest text-accent border-b border-accent pb-1 hover:text-primary hover:border-primary cta-underline transition-all duration-200"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {related.map((r) => (
                <RelatedCard key={r.slug} study={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRE-FOOTER CTA */}
      <section className="relative isolate overflow-hidden py-24 md:py-32 bg-transparent">
        <SpotlightBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
            Initiation
          </span>
          <h2 className="font-serif italic text-3xl md:text-5xl text-primary font-normal leading-tight mt-3">
            Have a project like {study.name}?
          </h2>
          <p className="text-text-muted text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl mx-auto">
            If this looks like something you&apos;re trying to build, let&apos;s
            talk about what your version could look like.
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
            >
              Start The Conversation
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
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

function NarrativeBlock({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
        <div className="md:col-span-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
            {eyebrow}
          </span>
          <span
            aria-hidden
            className="hidden md:block h-px w-8 bg-border mt-3"
          />
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </Reveal>
  );
}

function RelatedCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      className="group flex flex-col bg-white border border-border rounded-lg overflow-hidden hover:shadow-sm hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <DossierTile
          domain={study.domain}
          name={study.name}
          iconUrl={study.iconUrl}
          size="lg"
          showName
        />
      </div>
      <div className="flex flex-col p-6">
        <h3 className="font-serif text-xl md:text-2xl text-primary group-hover:text-accent transition-colors">
          {study.name}
        </h3>
        <span className="mt-1 text-xs font-mono text-text-muted">
          {study.domain}
        </span>
        <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent">
          <span className="border-b border-accent pb-0.5 transition-colors group-hover:text-primary group-hover:border-primary">
            Read Case Study
          </span>
          <svg
            className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
