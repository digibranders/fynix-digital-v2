import Link from "next/link";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import UiUxHeroAnimation from "@/components/UiUxHeroAnimation";
import { actAccents } from "@/components/ActsStack";
import {
  AccentBadge,
  AccentDot,
  ServiceAccentBand,
  ServiceHeroFigure,
  type BandPoint,
} from "@/components/ServiceContentKit";
import { siteConfig, type Act } from "@/lib/content";

// Pillar colour signature — the same gold used by the UI/UX act in the stack.
const accent = actAccents["ui-ux"];

// Editorial pull-quote band that breaks up the text-heavy sections with colour.
const bandEyebrow = "Why design decides the outcome";
const bandQuote =
  "Design is the fastest way to earn a buyer's trust, and the quickest way to lose it.";
const bandPoints: BandPoint[] = [
  {
    title: "Research-led decisions",
    text: "Every screen is grounded in real user behaviour, not opinion or guesswork.",
  },
  {
    title: "Interfaces that convert",
    text: "Clear hierarchy and effortless flows move visitors toward action with confidence.",
  },
  {
    title: "Systems built to scale",
    text: "Reusable components and documentation keep quality consistent as you grow.",
  },
];

/**
 * Dedicated UI/UX Design Services page content.
 *
 * Server Component rendered by `/services/[slug]` when the slug is "ui-ux".
 * The other acts continue to use the generic service template. Copy is sourced
 * from the Fynix UI/UX Design Services brief and styled to match the site's
 * existing service-page design system (dark hero, editorial serif, copper
 * accent, JSON-LD structured data).
 */

type UiUxService = {
  name: string;
  tagline: string;
  description: string;
  items: string[];
};

const uiuxServices: UiUxService[] = [
  {
    name: "UX Research",
    tagline: "Design Based on User Insights",
    description:
      "We uncover user needs, pain points, and behaviors so every design decision is backed by evidence, not assumptions.",
    items: [
      "Customer Interviews",
      "User Personas",
      "Journey Mapping",
      "Competitive Analysis",
      "Usability Studies",
    ],
  },
  {
    name: "User Experience Design",
    tagline: "Create Seamless Customer Journeys",
    description:
      "We design logical flows and intuitive experiences that reduce friction and help users reach their goals faster.",
    items: [
      "Information Architecture",
      "User Flows",
      "Wireframing",
      "Interaction Design",
      "Accessibility Best Practices",
    ],
  },
  {
    name: "User Interface Design",
    tagline: "Build Interfaces That Inspire Confidence",
    description:
      "We craft clean, modern, consistent interfaces that strengthen your brand and make products easy to use.",
    items: [
      "Website Interface Design",
      "SaaS Dashboard Design",
      "Mobile App Design",
      "Design Systems",
      "Prototyping",
    ],
  },
  {
    name: "UX Audit",
    tagline: "Identify Opportunities to Improve Performance",
    description:
      "We pinpoint the usability issues, friction points, and conversion barriers holding your product back.",
    items: [
      "Heuristic Evaluation",
      "Accessibility Assessment",
      "Mobile Experience Review",
      "Conversion Analysis",
      "Actionable Recommendations",
    ],
  },
];

const designProcess: { step: string; text: string }[] = [
  { step: "Discover", text: "We learn about your business, users, objectives, and challenges." },
  { step: "Research", text: "We gather insights through research, analytics, and competitor analysis." },
  { step: "Design", text: "We create wireframes, prototypes, and interfaces focused on usability and outcomes." },
  { step: "Validate", text: "We test designs with users, collect feedback, and refine the experience." },
  { step: "Deliver", text: "We hand over scalable, developer-ready designs with documentation." },
];

const uiuxFaqs: { q: string; a: string }[] = [
  {
    q: "Why is UI/UX important for business growth?",
    a: "A well-designed experience makes it easier for customers to understand your products and make decisions, driving higher engagement, trust, and conversions.",
  },
  {
    q: "Do you redesign existing websites?",
    a: "Yes. We modernize outdated websites by improving usability, navigation, accessibility, and conversion performance.",
  },
  {
    q: "Do you design SaaS platforms and dashboards?",
    a: "Yes. We design intuitive SaaS applications, dashboards, and customer portals that simplify complex workflows.",
  },
  {
    q: "Do you work with developers?",
    a: "Yes. We deliver developer-ready designs with reusable components, design systems, and detailed specifications.",
  },
];

// Prose kept as string constants so JSX stays free of unescaped-entity issues.
const heroCopy1 =
  "Great digital experiences are built with purpose. We design intuitive UI/UX that improves usability, builds trust, and drives growth.";
const whyCopy1 =
  "Your website or application is often a customer's first interaction with your brand, and a confusing interface or poor experience drives them away.";
const whyCopy2 =
  "Effective UI/UX helps visitors find information faster, complete tasks with confidence, and trust your business, driving higher engagement and better conversions.";
const servicesIntro =
  "Every business and customer journey is different. We design experiences that match your users' expectations while supporting your objectives.";

const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

type Props = { act: Act };

export default function UiUxServiceContent({ act }: Props) {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "UI/UX Design Services for cybersecurity and B2B companies",
    serviceType: "UI/UX Design",
    description:
      "User-centered UI/UX design for B2B businesses: UX research, user experience design, interface design, and UX audits that improve usability, trust, and conversions.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "UI/UX design offerings",
      itemListElement: uiuxServices.map((s) => ({
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
    mainEntity: uiuxFaqs.map((faq) => ({
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
                Design with{" "}
                <span className="font-serif italic text-[#e9af88] md:block">
                  Clear Purpose
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
                    <UiUxHeroAnimation />
                  </ServiceHeroFigure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY UI/UX MATTERS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Great Design Creates Better Business Outcomes
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

      {/* OUR UI/UX SERVICES */}
      <section
        id="uiux-services"
        className="py-16 md:py-20 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              End-to-End Design Solutions
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {servicesIntro}
            </p>
          </Reveal>

          <div className="space-y-6 md:space-y-8">
            {uiuxServices.map((svc, idx) => (
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

      {/* OUR DESIGN PROCESS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Structured Approach to Better Experiences
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {designProcess.map((phase, idx) => (
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
              {uiuxFaqs.map((faq, idx) => (
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
            Ready to Create Better Digital Experiences?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
            >
              Book Your Free UI/UX Consultation
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
