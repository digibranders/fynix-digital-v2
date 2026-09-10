import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { acts, caseStudies, faqs, siteConfig, type Act } from "@/lib/content";
import { emphasize } from "@/lib/emphasize";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import SectionSeam from "@/components/SectionSeam";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import PillarDiagnosticWidget from "@/components/PillarDiagnosticWidget";
import SeoServiceContent from "@/components/SeoServiceContent";
import UiUxServiceContent from "@/components/UiUxServiceContent";
import DevelopmentServiceContent from "@/components/DevelopmentServiceContent";
import LeadGenServiceContent from "@/components/LeadGenServiceContent";

type Params = { slug: Act["slug"] };

export function generateStaticParams(): Params[] {
  return acts.map((act) => ({ slug: act.slug }));
}

const serviceTitles: Record<Act["slug"], string> = {
  "ui-ux": "UI/UX Design & Product Strategy",
  development: "Custom Web Development & Core Web Vitals",
  seo: "Technical SEO & Answer Engine Optimisation (AEO)",
  "lead-generation": "B2B Lead Generation & Demand Gen",
};

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const act = acts.find((a) => a.slug === slug);
  if (!act) return {};

  const fullTitle = serviceTitles[act.slug] || act.title;

  return {
    title: fullTitle,
    description: act.headline,
    alternates: { canonical: `/services/${act.slug}` },
    openGraph: {
      title: `${fullTitle} · ${act.subtitle}`,
      description: act.headline,
    },
  };
}

function stripEmphasis(text: string): string {
  return text.replace(/\*\*/g, "");
}

export default async function ServiceDetailPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const act = acts.find((a) => a.slug === slug);
  if (!act) notFound();

  // These acts have dedicated, content-rich pages; the remaining acts share the
  // generic service template below.
  if (act.slug === "seo") return <SeoServiceContent act={act} />;
  if (act.slug === "ui-ux") return <UiUxServiceContent act={act} />;
  if (act.slug === "development") return <DevelopmentServiceContent act={act} />;
  if (act.slug === "lead-generation") return <LeadGenServiceContent act={act} />;

  const others = acts.filter((a) => a.slug !== act.slug);
  const relatedStudies = act.proof.relatedCaseStudySlugs
    .map((s) => caseStudies.find((c) => c.slug === s))
    .filter((c): c is (typeof caseStudies)[number] => Boolean(c));
  const actFaqs = act.faqIndexes
    .map((i) => faqs[i])
    .filter((f): f is (typeof faqs)[number] => Boolean(f));

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${act.title} for cybersecurity companies`,
    serviceType: act.title,
    description: act.headline,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${act.title} deliverables`,
      itemListElement: act.deliverables.map((d) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: d.title,
          description: d.description,
        },
      })),
    },
  };

  const faqJsonLd = actFaqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: actFaqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripEmphasis(f.a),
          },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${siteConfig.url}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: act.title,
        item: `${siteConfig.url}/services/${act.slug}`,
      },
    ],
  };

  return (
    <>
      {/* HERO */}
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[64px] text-white font-medium tracking-tight leading-[1.08] text-balance">
              Growth goes{" "}
              <span className="font-serif italic font-medium text-[#e9af88] md:block">
                beyond traffic
              </span>
            </h1>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/contact"
                className="cta-glide inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#e9af88] to-[#ffd2b3] text-[#0C1E2E] hover:brightness-105 font-bold rounded-full shadow-sm text-center"
              >
                Let&apos;s connect
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
          </div>
        </div>
      </section>

      {/* NARRATIVE */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                The moment behind the discipline.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={120}>
              <p className="font-serif text-xl md:text-2xl text-primary font-normal leading-relaxed">
                {emphasize(act.content, "font-medium text-accent-hover")}
              </p>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
                {emphasize(act.bullets)}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* INTERACTIVE PILLAR DIAGNOSTIC */}
      <section className="py-16 md:py-24 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal>
            <PillarDiagnosticWidget actSlug={act.slug} actTitle={act.title} />
          </Reveal>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section
        id="proof"
        className="py-16 md:py-20 bg-background-soft"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <Reveal className="lg:col-span-4">
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                Evidence
              </span>
              <div className="mt-6">
                <div className="font-serif text-6xl md:text-7xl text-primary font-medium tabular-nums leading-none">
                  {act.proof.metric.value}
                </div>
                <div className="mt-4 text-base md:text-lg text-primary font-medium">
                  {act.proof.metric.label}
                </div>
                {act.proof.metric.sub ? (
                  <div className="mt-1 text-sm text-text-muted font-normal">
                    {act.proof.metric.sub}
                  </div>
                ) : null}
              </div>
              <p className="mt-8 text-sm text-text-muted font-normal leading-relaxed max-w-sm">
                A sample of engagements where {act.title} carried the outcome.
              </p>
            </Reveal>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedStudies.map((study, idx) => (
                <Reveal key={study.slug} delay={idx * 100}>
                  <Link
                    href={`/case-studies/${study.slug}`}
                    className="h-full p-6 border border-border rounded-lg bg-white hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                        Case Study
                      </span>
                      <h3 className="font-serif text-xl text-primary font-medium mt-3 group-hover:text-accent transition-colors">
                        {study.name}
                      </h3>
                      <p className="text-sm text-text-muted font-normal mt-3 leading-relaxed">
                        {study.description}
                      </p>
                    </div>
                    {study.metric ? (
                      <div className="mt-6 pt-4 border-t border-border">
                        <div className="font-serif text-2xl text-primary font-medium tabular-nums">
                          {study.metric.value}
                        </div>
                        <div className="text-xs text-text-muted font-normal mt-1">
                          {study.metric.label}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 pt-4 border-t border-border text-xs uppercase font-semibold text-accent tracking-widest inline-flex items-center gap-2">
                        Read the work <span aria-hidden>&rarr;</span>
                      </div>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* DELIVERABLES */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              Scope of work
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl mt-4">
              Everything included under {act.title}.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {act.deliverables.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 60}>
                <div className="h-full p-6 border border-border rounded-lg bg-background-soft/30 hover:border-accent/40 hover:bg-background-soft transition-all duration-300">
                  <span className="text-xs font-mono text-accent font-semibold tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-xl text-primary font-medium mt-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-muted font-normal mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* HOW THIS ACT RUNS */}
      <section className="py-16 md:py-20 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              How this act runs
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl mt-4">
              Three phases, one accountable team.
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {act.howItRuns.map((step, idx) => (
              <li key={step.title} className="h-full">
                <Reveal delay={idx * 100} className="h-full p-6 border border-border rounded-lg bg-white flex flex-col">
                  <span className="text-xs font-mono text-accent font-semibold tabular-nums">
                    Phase {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-xl text-primary font-medium mt-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-muted font-normal mt-3 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-text-muted font-semibold">
                      Deliverable
                    </div>
                    <div className="text-sm text-primary font-medium mt-1">
                      {step.deliverable}
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* FAQ */}
      {actFaqs.length ? (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <Reveal className="lg:col-span-4">
                <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                  Buyer questions
                </span>
                <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight mt-4">
                  The questions we&apos;re asked most about {act.title}.
                </h2>
                <Link
                  href="/faqs"
                  className="mt-6 inline-flex items-center gap-2 text-xs uppercase font-semibold text-accent tracking-widest"
                >
                  All FAQs <span aria-hidden>&rarr;</span>
                </Link>
              </Reveal>
              <div className="lg:col-span-8 divide-y divide-border border-t border-border">
                {actFaqs.map((faq, idx) => (
                  <Reveal key={faq.q} delay={idx * 80}>
                    <div className="py-8">
                      <h3 className="font-serif text-xl md:text-2xl text-primary font-medium leading-snug">
                        {faq.q}
                      </h3>
                      <p className="text-base text-text-muted font-normal leading-relaxed mt-4">
                        {emphasize(faq.a)}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* OTHER ACTS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-primary font-medium max-w-2xl text-balance line-clamp-2">
              {act.title} is one act. Real outcomes take all four.
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
                    <p className="text-sm text-text-muted font-normal mt-3 leading-relaxed">
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
      <section className="relative isolate overflow-hidden py-16 md:py-20 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-3xl md:text-5xl text-primary font-medium leading-tight">
            Ready to move on {act.title}?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
    </>
  );
}
