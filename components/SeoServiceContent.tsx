import Link from "next/link";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import SeoHeroAnimation from "@/components/SeoHeroAnimation";
import { actAccents } from "@/components/ActsStack";
import {
  AccentBadge,
  AccentDot,
  ServiceAccentBand,
  type BandPoint,
} from "@/components/ServiceContentKit";
import { siteConfig, type Act } from "@/lib/content";

// Pillar colour signature — the same rose used by the SEO act in the stack.
const accent = actAccents.seo;

// Editorial pull-quote band that breaks up the text-heavy sections with colour.
const bandEyebrow = "Visibility with real intent";
const bandQuote =
  "Rankings are vanity. Qualified pipeline is the metric that actually pays.";
const bandPoints: BandPoint[] = [
  {
    title: "Topical authority",
    text: "Entity-driven content clusters that make you the trusted answer across the buying journey.",
  },
  {
    title: "Technical foundation",
    text: "A fast, crawlable, well-structured site that search engines can read without friction.",
  },
  {
    title: "AI-search ready",
    text: "Structured data and semantic depth built to surface in AI and traditional search alike.",
  },
];

/**
 * Dedicated SEO Services page content.
 *
 * Server Component rendered by `/services/[slug]` when the slug is "seo".
 * The other three acts continue to use the generic service template.
 * Copy is sourced from the Fynix SEO Services brief and styled to match the
 * site's existing service-page design system (dark hero, editorial serif,
 * copper accent, JSON-LD structured data).
 */

type SeoService = {
  name: string;
  tagline: string;
  description: string;
  items: string[];
};

const seoServices: SeoService[] = [
  {
    name: "Semantic SEO",
    tagline: "Build Topical Authority, Not Just Rankings",
    description:
      "We build interconnected, entity-driven content that establishes your business as an authoritative source across every stage of the buying journey.",
    items: [
      "Topic Cluster Strategy",
      "Entity-Based Optimization",
      "Search Intent Mapping",
      "Internal Linking Strategy",
      "AI Search Readiness",
    ],
  },
  {
    name: "Technical SEO",
    tagline: "Build a Strong Foundation for Search Performance",
    description:
      "We optimize your website's technical health so search engines can efficiently crawl, understand, and index every page without friction.",
    items: [
      "Website Audits",
      "Core Web Vitals Optimization",
      "Crawlability & Indexation",
      "Schema Markup",
      "Mobile Optimization",
    ],
  },
  {
    name: "Local SEO",
    tagline: "Reach Customers in the Markets That Matter",
    description:
      "We strengthen your presence across Google Search and Maps so nearby customers can easily discover and trust your business.",
    items: [
      "Google Business Profile Optimization",
      "Local Citation Management",
      "Location Landing Pages",
      "Review Strategy",
      "NAP Consistency",
    ],
  },
  {
    name: "Enterprise SEO",
    tagline: "Scale Organic Growth Across Large Websites",
    description:
      "We build scalable SEO frameworks for large websites, multiple markets, and complex structures without sacrificing quality or performance.",
    items: [
      "Enterprise SEO Audits",
      "Information Architecture",
      "Scalable Internal Linking",
      "International SEO",
      "SEO Performance Reporting",
    ],
  },
];

const seoProcess: { step: string; text: string }[] = [
  { step: "Discover", text: "We learn about your business, industry, competitors, and growth objectives." },
  { step: "Audit", text: "We evaluate your technical health, content quality, and search performance to uncover opportunities." },
  { step: "Strategy", text: "We build a tailored SEO roadmap aligned with your business goals and customer journey." },
  { step: "Optimize", text: "We strengthen your technical foundation, content, architecture, and authority signals." },
  { step: "Measure", text: "We continuously monitor performance and refine strategies for sustainable growth." },
];

const seoFaqs: { q: string; a: string }[] = [
  {
    q: "How long does SEO take to show results?",
    a: "SEO is a long-term investment, and while technical fixes deliver early gains, meaningful business results typically appear within 3 to 6 months.",
  },
  {
    q: "Do you optimize for AI-powered search?",
    a: "Yes, our semantic SEO, entity optimization, and structured data are built to improve visibility across AI-powered and traditional search.",
  },
  {
    q: "Can you work with enterprise websites?",
    a: "Absolutely, we manage SEO across large websites, multiple markets, and complex digital ecosystems with scalable enterprise strategies.",
  },
  {
    q: "Is SEO suitable for local businesses?",
    a: "Yes, local SEO improves your visibility within specific geographic markets so nearby customers can find and contact you.",
  },
];

// Prose kept as string constants so JSX stays free of unescaped-entity issues.
const heroCopy1 =
  "Search success goes beyond rankings. Our data-driven SEO strategies improve visibility, build authority, and drive measurable business growth.";
const whyCopy1 =
  "Your customers search for solutions every day, and if your business isn't visible when they do, you're handing valuable opportunities to competitors.";
const whyCopy2 =
  "Our approach goes beyond rankings to grow qualified organic traffic, strengthen your digital authority, and turn search demand into business opportunities.";
const servicesIntro =
  "Every business has different goals, markets, and challenges. That's why we develop SEO strategies tailored to your business objectives and growth stage.";
const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

type Props = { act: Act };

export default function SeoServiceContent({ act }: Props) {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "SEO Services for cybersecurity and B2B companies",
    serviceType: "Search Engine Optimization",
    description:
      "Data-driven SEO for B2B businesses: semantic SEO, technical SEO, local and enterprise search, and AI search readiness that turn visibility into qualified pipeline.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "SEO service offerings",
      itemListElement: seoServices.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.description,
        },
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seoFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[67.2px] text-white font-medium tracking-tight leading-[1.08] text-balance">
                SEO That Drives{" "}
                <span className="font-serif italic text-[#e9af88] md:block">
                  Qualified Growth
                </span>
              </h1>

              <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mt-8 max-w-2xl">
                {heroCopy1}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/contact"
                  className="cta-glide inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#e9af88] to-[#ffd2b3] text-[#0C1E2E] hover:brightness-105 font-bold rounded-full shadow-sm text-center"
                >
                  Book an SEO Strategy Call
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <SeoHeroAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* WHY SEO MATTERS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Turn Search Visibility Into Business Growth
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={120}>
              <p className="font-serif text-xl md:text-2xl text-primary font-normal leading-relaxed">
                {whyCopy1}
              </p>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
                {whyCopy2}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* OUR SEO SERVICES */}
      <section
        id="seo-services"
        className="py-16 md:py-20 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              Comprehensive SEO Solutions Built for Growth
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {servicesIntro}
            </p>
          </Reveal>

          <div className="space-y-6 md:space-y-8">
            {seoServices.map((svc, idx) => (
              <Reveal key={svc.name} delay={idx * 60}>
                <article className="group relative overflow-hidden rounded-lg border border-border bg-white p-8 md:p-12 hover:border-accent/40 transition-colors duration-300">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-full w-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to bottom, ${accent.from}, ${accent.to})` }}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-5">
                      <AccentBadge accent={accent} className="h-9 w-9 text-sm">
                        {String(idx + 1).padStart(2, "0")}
                      </AccentBadge>
                      <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-4">
                        {svc.name}
                      </h3>
                      <p className="font-serif italic text-lg text-primary/55 mt-2 leading-snug">
                        {svc.tagline}
                      </p>
                      <p className="text-text-muted text-base font-normal leading-relaxed mt-5">
                        {svc.description}
                      </p>
                    </div>

                    <div className="lg:col-span-7 lg:border-l lg:border-border lg:pl-12">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {svc.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2.5 text-sm text-primary/85 font-normal"
                          >
                            <AccentDot accent={accent} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ACCENT PULL-QUOTE BAND */}
      <ServiceAccentBand
        accent={accent}
        eyebrow={bandEyebrow}
        quote={bandQuote}
        points={bandPoints}
      />

      {/* OUR SEO PROCESS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Proven Framework for Sustainable Organic Growth
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {seoProcess.map((phase, idx) => (
              <Reveal key={phase.step} delay={idx * 80}>
                <li className="h-full p-6 border border-border rounded-lg bg-background-soft/40 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="flex items-center gap-3">
                    <AccentBadge accent={accent} className="h-8 w-8 text-xs">
                      {String(idx + 1).padStart(2, "0")}
                    </AccentBadge>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted font-semibold">
                      Step
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-primary font-medium mt-4">
                    {phase.step}
                  </h3>
                  <p className="text-sm text-text-muted font-normal mt-3 leading-relaxed">
                    {phase.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* FAQ */}
      <section className="pt-16 md:pt-20 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Frequently Asked Questions
              </h2>
              <Link
                href="/faqs"
                className="mt-6 inline-flex items-center gap-2 text-xs uppercase font-semibold text-accent tracking-widest"
              >
                All FAQs <span aria-hidden>&rarr;</span>
              </Link>
            </Reveal>
            <div className="lg:col-span-8 divide-y divide-border border-t border-border">
              {seoFaqs.map((faq, idx) => (
                <Reveal key={faq.q} delay={idx * 80}>
                  <details className="group py-6">
                    <summary className="flex items-start justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <h3 className="font-serif text-xl md:text-2xl text-primary font-medium leading-snug transition-colors group-hover:text-accent">
                        {faq.q}
                      </h3>
                      <span
                        aria-hidden
                        className="mt-1 shrink-0 text-accent transition-transform duration-300 group-open:rotate-45"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="hidden group-open:block text-base text-text-muted font-normal leading-relaxed mt-4 max-w-2xl">
                      {faq.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden pt-12 md:pt-16 pb-16 md:pb-20 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-3xl md:text-5xl text-primary font-medium leading-tight">
            Ready to Grow Through Search?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
            >
              Book Your Free SEO Consultation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
