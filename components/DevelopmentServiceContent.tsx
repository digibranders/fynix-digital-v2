import Link from "next/link";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import DevCardGraphic from "@/components/DevCardGraphic";
import { actAccents } from "@/components/ActsStack";
import {
  AccentBadge,
  AccentDot,
  ServiceAccentBand,
  ServiceHeroFigure,
  type BandPoint,
} from "@/components/ServiceContentKit";
import { siteConfig, type Act } from "@/lib/content";

// Pillar colour signature — the same sage used by the Development act in the stack.
const accent = actAccents.development;

// Editorial pull-quote band that breaks up the text-heavy sections with colour.
const bandEyebrow = "Engineering that keeps the promise";
const bandQuote =
  "A beautiful interface means nothing if it loads slowly, breaks under scale, or exposes your users.";
const bandPoints: BandPoint[] = [
  {
    title: "Sub-second load times",
    text: "Core Web Vitals treated as a feature, so speed compounds into rankings and conversions.",
  },
  {
    title: "Secure by architecture",
    text: "Hardened builds and modern defaults protect your brand and your customers' data.",
  },
  {
    title: "Built to grow with you",
    text: "Scalable foundations that absorb new pages, markets, and traffic without a rebuild.",
  },
];

/**
 * Dedicated Website Development Services page content.
 *
 * Server Component rendered by `/services/[slug]` when the slug is "development".
 * The other acts continue to use the generic service template. Copy is sourced
 * from the Fynix Website Development Services brief and styled to match the
 * site's existing service-page design system (dark hero, editorial serif,
 * copper accent, JSON-LD structured data).
 */

type DevService = {
  name: string;
  tagline: string;
  description: string;
  items: string[];
};

const devServices: DevService[] = [
  {
    name: "Custom Website Development",
    tagline: "Tailored Solutions for Your Business",
    description:
      "We build custom websites that reflect your brand, support your business objectives, and deliver exceptional user experiences.",
    items: [
      "Corporate Websites",
      "B2B Websites",
      "Business Portals",
      "Landing Pages",
      "Custom Functionality",
    ],
  },
  {
    name: "Next.js Development",
    tagline: "Fast, Secure and Future-Ready Websites",
    description:
      "We build high-performance websites with Next.js for faster page loads, stronger security, better search visibility, and scalability.",
    items: [
      "Server-Side Rendering",
      "Static Site Generation",
      "Performance Optimization",
      "API Integrations",
      "SEO-Friendly Architecture",
    ],
  },
  {
    name: "WordPress Development",
    tagline: "Flexible Content Management for Growing Businesses",
    description:
      "We develop secure, scalable WordPress websites that are easy to manage while maintaining excellent performance and search visibility.",
    items: [
      "Custom Theme Development",
      "Custom Plugin Integration",
      "CMS Configuration",
      "Security Hardening",
      "Performance Optimization",
    ],
  },
  {
    name: "Website Migration",
    tagline: "Migrate Without Losing Performance or Visibility",
    description:
      "We manage every stage of migration to protect your search rankings, functionality, and user experience throughout the move.",
    items: [
      "URL Mapping",
      "Redirect Management",
      "Content Migration",
      "SEO Preservation",
      "Quality Assurance",
    ],
  },
  {
    name: "Website Maintenance & Optimization",
    tagline: "Keep Your Website Secure, Fast and Reliable",
    description:
      "We keep your website secure, fast, and reliable with regular updates, monitoring, and continuous performance optimization.",
    items: [
      "Security Updates",
      "Performance Monitoring",
      "Backup Management",
      "Bug Fixes",
      "Uptime Monitoring",
    ],
  },
];

const devProcess: { step: string; text: string }[] = [
  {
    step: "Discover",
    text: "We start by understanding your business goals, users, and technical requirements.",
  },
  {
    step: "Plan",
    text: "We define the website architecture, user journeys, and a scalable technical foundation.",
  },
  {
    step: "Design",
    text: "Our UI/UX team creates intuitive experiences and modern interfaces that reflect your brand.",
  },
  {
    step: "Develop",
    text: "Our developers build secure, responsive, high-performing websites using modern best practices.",
  },
  {
    step: "Launch & Optimize",
    text: "We launch after thorough testing, then keep optimizing based on real user behavior.",
  },
];

const devFaqs: { q: string; a: string }[] = [
  {
    q: "Why should I choose Next.js over a traditional website?",
    a: "Next.js delivers faster performance, stronger security, better SEO, and greater scalability than many traditional website platforms.",
  },
  {
    q: "Can you redesign my existing website?",
    a: "Yes, we redesign outdated websites to improve usability, performance, accessibility, and conversions while preserving your existing search visibility.",
  },
  {
    q: "Do you provide ongoing website maintenance?",
    a: "Yes, our maintenance covers security updates, performance monitoring, backups, bug fixes, and continuous optimization.",
  },
  {
    q: "Do you optimize websites for SEO?",
    a: "Yes, every website is built with SEO best practices, including clean code, structured data, and Core Web Vitals optimization.",
  },
];

// Prose kept as string constants so JSX stays free of unescaped-entity issues.
const heroCopy1 =
  "Your website is your most valuable asset. We build fast, secure sites that strengthen your brand and drive growth.";
const whyCopy1 =
  "Your website is often the first impression customers have of your business, and a slow or outdated one erodes trust and costs valuable opportunities.";
const whyCopy2 =
  "A modern website should load quickly, perform seamlessly across devices, support your marketing efforts, and guide visitors toward meaningful actions.";
const servicesIntro =
  "Every business has unique goals, audiences, and technical requirements. We develop websites that align with your objectives while providing the flexibility to support future growth.";
const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

type Props = { act: Act };

export default function DevelopmentServiceContent({ act }: Props) {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Website Development Services for cybersecurity and B2B companies",
    serviceType: "Website Development",
    description:
      "Custom, Next.js, and WordPress website development for B2B businesses: fast, secure, scalable sites with migration and ongoing maintenance that deliver measurable business value.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Website development offerings",
      itemListElement: devServices.map((s) => ({
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
    mainEntity: devFaqs.map((faq) => ({
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
                Websites Built for{" "}
                <span className="font-serif italic text-[#e9af88] md:block">
                  Business Growth
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
                  Let&apos;s connect
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              {/* Square envelope makes this hero as tall as the SEO hero; the
                  landscape card is scaled up to fill that height so it never
                  floats small. Hero section is overflow-hidden, so the slight
                  horizontal glow spill never causes page scroll. */}
              <div className="relative mx-auto flex aspect-square w-full max-w-[560px] items-center justify-center">
                <div className="w-full origin-center scale-[1.18]">
                  <ServiceHeroFigure accent={accent}>
                    <DevCardGraphic />
                  </ServiceHeroFigure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY WEBSITE DEVELOPMENT MATTERS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Your Website Should Work as Hard as Your Business
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

      {/* OUR WEBSITE DEVELOPMENT SERVICES */}
      <section
        id="development-services"
        className="py-16 md:py-20 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              Modern Websites Built for Performance and Growth
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {servicesIntro}
            </p>
          </Reveal>

          <div className="space-y-6 md:space-y-8">
            {devServices.map((svc, idx) => (
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

      {/* OUR DEVELOPMENT PROCESS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Structured Approach to Building Better Websites
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {devProcess.map((phase, idx) => (
              <li key={phase.step} className="h-full">
                <Reveal delay={idx * 80} className="h-full p-6 border border-border rounded-lg bg-background-soft/40 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 flex flex-col">
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
                </Reveal>
              </li>
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
              {devFaqs.map((faq, idx) => (
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

      <SectionSeam from="soft" to="white" className="-my-5 md:-my-7" />

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden pt-12 md:pt-16 pb-16 md:pb-20 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-3xl md:text-5xl text-primary font-medium leading-tight">
            Ready to Build a Website That Supports Business Growth?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
            >
              Book Your Free Website Consultation
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
