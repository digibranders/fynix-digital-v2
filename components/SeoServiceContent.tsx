import Link from "next/link";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import { siteConfig, type Act } from "@/lib/content";

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
  result: string;
};

const seoServices: SeoService[] = [
  {
    name: "Semantic SEO",
    tagline: "Build Topical Authority, Not Just Rankings",
    description:
      "Modern search engines understand relationships between topics, entities, and user intent. Our Semantic SEO strategies help your business become an authoritative source by creating interconnected content that answers customer questions across every stage of the buying journey.",
    items: [
      "Topic Cluster Strategy",
      "Entity-Based Optimization",
      "Search Intent Mapping",
      "Content Architecture",
      "Internal Linking Strategy",
      "Knowledge Graph Optimization",
      "AI Search Readiness",
      "Content Gap Analysis",
    ],
    result:
      "The result is stronger topical authority, improved rankings across related searches, and greater visibility in both traditional and AI-powered search experiences.",
  },
  {
    name: "Technical SEO",
    tagline: "Build a Strong Foundation for Search Performance",
    description:
      "Even the best content cannot perform without a technically sound website. We optimize the technical health of your website to ensure search engines can efficiently crawl, understand, and index your content while providing visitors with a fast and reliable user experience.",
    items: [
      "Website Audits",
      "Core Web Vitals Optimization",
      "Site Speed Improvements",
      "Crawlability & Indexation",
      "XML Sitemap & Robots.txt Optimization",
      "Schema Markup",
      "Canonicalization",
      "Redirect Management",
      "Mobile Optimization",
      "Structured Data Implementation",
      "JavaScript SEO",
      "Website Migrations",
    ],
    result:
      "A technically optimized website not only performs better in search but also improves user satisfaction and conversion rates.",
  },
  {
    name: "Local SEO",
    tagline: "Reach Customers in the Markets That Matter",
    description:
      "For businesses serving specific cities, regions, or multiple locations, local visibility is essential. We help businesses improve their presence across Google Search, Google Maps, and location-based search results, making it easier for nearby customers to discover and trust your business.",
    items: [
      "Google Business Profile Optimization",
      "Local Citation Management",
      "Location Landing Pages",
      "Local Keyword Research",
      "Review Strategy",
      "Local Schema",
      "NAP Consistency",
      "Local Content Strategy",
      "Multi-Location SEO",
    ],
    result:
      "Our goal is simple. Increase your visibility where your customers are actively looking for your services.",
  },
  {
    name: "Enterprise SEO",
    tagline: "Scale Organic Growth Across Large Websites",
    description:
      "Large websites require a different SEO approach. Our Enterprise SEO services are designed for businesses managing hundreds or thousands of pages, multiple business units, international markets, or complex website structures. We focus on building scalable SEO frameworks that improve efficiency while maintaining content quality and technical performance.",
    items: [
      "Enterprise SEO Audits",
      "Information Architecture",
      "Scalable Internal Linking",
      "Large-Scale Technical Optimization",
      "Content Governance",
      "International SEO",
      "Hreflang Strategy",
      "Log File Analysis",
      "Automation Workflows",
      "SEO Performance Reporting",
    ],
    result:
      "Enterprise SEO helps organizations grow organic visibility at scale while maintaining consistency across large digital ecosystems.",
  },
];

const seoProcess: { step: string; text: string }[] = [
  {
    step: "Discover",
    text: "We understand your business, industry, competitors, audience, and growth objectives.",
  },
  {
    step: "Audit",
    text: "We evaluate your website's technical health, content quality, authority, and search performance to uncover opportunities.",
  },
  {
    step: "Strategy",
    text: "Based on our findings, we create a tailored SEO roadmap aligned with your business goals and customer journey.",
  },
  {
    step: "Optimize",
    text: "We improve your technical foundation, content strategy, website architecture, and authority signals.",
  },
  {
    step: "Measure",
    text: "SEO is never static. We continuously monitor performance, refine strategies, and identify new opportunities for sustainable growth.",
  },
];

const seoMetrics: string[] = [
  "Qualified Organic Traffic",
  "Search Visibility",
  "Topical Authority",
  "Lead Generation",
  "Customer Acquisition",
  "Revenue Growth",
];

const seoFaqs: { q: string; a: string }[] = [
  {
    q: "How long does SEO take to show results?",
    a: "SEO is a long-term investment. While technical improvements can deliver early gains, meaningful business results typically become visible within 3 to 6 months, depending on your industry, competition, and website authority.",
  },
  {
    q: "Do you optimize for AI-powered search?",
    a: "Yes. Our strategies include semantic SEO, entity optimization, structured data, and content architecture designed to improve visibility across AI-powered search experiences in addition to traditional search engines.",
  },
  {
    q: "Can you work with enterprise websites?",
    a: "Absolutely. We help businesses manage SEO across large websites, multiple markets, and complex digital ecosystems through scalable enterprise SEO strategies.",
  },
  {
    q: "Is SEO suitable for local businesses?",
    a: "Yes. Local SEO helps businesses improve visibility within specific geographic markets, making it easier for nearby customers to find and contact your business.",
  },
];

// Prose kept as string constants so JSX stays free of unescaped-entity issues.
const heroCopy1 =
  "Search success goes beyond rankings. Our data-driven SEO strategies improve visibility, build authority, and drive measurable business growth.";
// const heroCopy2 =
//   "Whether you're looking to dominate local search, scale enterprise websites, improve technical performance, or prepare for AI-powered search experiences, our SEO strategies are built to create sustainable, long-term growth.";
const whyCopy1 =
  "Your customers are searching for answers, solutions, and providers every day. If your business isn't visible when those searches happen, you're losing valuable opportunities to competitors.";
const whyCopy2 =
  "Our SEO approach goes beyond rankings. We focus on increasing qualified organic traffic, improving user experience, strengthening your digital authority, and turning search demand into business opportunities.";
const whyCopy3 =
  "With search engines increasingly powered by entities, context, and AI, successful SEO requires much more than keywords. It requires building authority around the topics that matter most to your customers.";
const servicesIntro =
  "Every business has different goals, markets, and challenges. That's why we develop SEO strategies tailored to your business objectives and growth stage.";
const whyChooseIntro =
  "At Fynix Digital, we don't measure success by rankings alone. We focus on the metrics that matter most to your business:";
const whyChooseOutro =
  "Our strategies combine technical expertise, content intelligence, AI search readiness, and continuous optimization to help your business build long-term digital authority.";
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
          <div className="max-w-4xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[67.2px] text-white font-medium tracking-tight leading-[1.08] text-balance">
              SEO That Drives{" "}
              <span className="font-serif italic text-[#e9af88] md:block">
                Qualified Growth
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mt-8 max-w-2xl">
              {heroCopy1}
            </p>
            {/* <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mt-5 max-w-2xl">
              {heroCopy2}
            </p> */}

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
        </div>
      </section>

      {/* WHY SEO MATTERS */}
      <section className="py-24 md:py-32 bg-white">
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
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
                {whyCopy3}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* OUR SEO SERVICES */}
      <section
        id="seo-services"
        className="py-24 md:py-32 bg-background-soft scroll-mt-24"
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
                <article className="rounded-lg border border-border bg-white p-8 md:p-12 hover:border-accent/40 transition-colors duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-5">
                      <span className="text-xs font-mono text-accent font-semibold tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-3">
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
                            <span
                              aria-hidden
                              className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-text-muted text-sm font-normal leading-relaxed mt-8 pt-6 border-t border-border">
                        {svc.result}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* OUR SEO PROCESS */}
      <section className="py-24 md:py-32 bg-white">
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
                  <span className="text-xs font-mono text-accent font-semibold tabular-nums">
                    Step {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-xl text-primary font-medium mt-3">
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

      {/* WHY CHOOSE FYNIX */}
      <section className="py-24 md:py-32 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                More Than Rankings. We Build Sustainable Growth.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={120}>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed">
                {whyChooseIntro}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {seoMetrics.map((metric) => (
                  <li
                    key={metric}
                    className="flex items-center gap-3 rounded-lg border border-border bg-white px-5 py-4 text-primary font-medium"
                  >
                    <span aria-hidden className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                    {metric}
                  </li>
                ))}
              </ul>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-8">
                {whyChooseOutro}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* FAQ */}
      <section className="py-24 md:py-32 bg-white">
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

      <SectionSeam from="white" to="white" />

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden py-24 md:py-32 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-3xl md:text-5xl text-primary font-medium leading-tight">
            Ready to Grow Through Search?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
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
