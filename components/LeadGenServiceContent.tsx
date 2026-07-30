import Link from "next/link";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import PipelineCardGraphic from "@/components/PipelineCardGraphic";
import { actAccents } from "@/components/ActsStack";
import {
  AccentBadge,
  AccentDot,
  ServiceAccentBand,
  ServiceHeroFigure,
  type BandPoint,
} from "@/components/ServiceContentKit";
import { siteConfig, type Act } from "@/lib/content";

// Pillar colour signature — the same muted violet used by the Lead Generation act in the stack.
const accent = actAccents["lead-generation"];

// Editorial pull-quote band that breaks up the text-heavy sections with colour.
const bandEyebrow = "Pipeline over vanity metrics";
const bandQuote =
  "A full inbox is not a full pipeline. The only lead that matters is one your sales team can actually close.";
const bandPoints: BandPoint[] = [
  {
    title: "Built on real intent",
    text: "Targeting grounded in firmographic and buyer-signal data, not spray-and-pray contact lists.",
  },
  {
    title: "Owned by revenue",
    text: "Every campaign measured against sourced pipeline and booked meetings, never impressions.",
  },
  {
    title: "Tuned every month",
    text: "Sequences, offers, and targeting refined against what actually converts to conversations.",
  },
];

/**
 * Dedicated Lead Generation Services page content.
 *
 * Server Component rendered by `/services/[slug]` when the slug is
 * "lead-generation". The other acts continue to use the generic service
 * template. Copy follows the Fynix Lead Generation brief and is styled to match
 * the site's existing service-page design system (dark hero, editorial serif,
 * copper accent, per-act violet pillar signature, JSON-LD structured data).
 */

type LeadGenService = {
  name: string;
  tagline: string;
  description: string;
  items: string[];
};

const leadGenServices: LeadGenService[] = [
  {
    name: "ICP & Account Research",
    tagline: "Target the Accounts Most Likely to Buy",
    description:
      "We define who is worth pursuing and build verified account lists from firmographic, technographic, and buyer-signal data.",
    items: [
      "Ideal Customer Profile Definition",
      "Firmographic & Technographic Targeting",
      "Buyer Intent Signals",
      "Verified Contact Lists",
      "Total Addressable Market Mapping",
    ],
  },
  {
    name: "Outbound Prospecting",
    tagline: "Start Conversations With High-Intent Buyers",
    description:
      "We run multi-channel outreach that reaches decision-makers with relevant messaging tied to one specific intent.",
    items: [
      "Email Sequences",
      "LinkedIn Outreach",
      "Cold Calling",
      "Multi-Channel Cadences",
      "Personalized Messaging",
    ],
  },
  {
    name: "Demand Generation",
    tagline: "Create Awareness That Converts to Pipeline",
    description:
      "We build demand against a defined pipeline target using content, paid media, and events, not vanity impression counts.",
    items: [
      "Paid Media Campaigns",
      "Content Syndication",
      "Webinars & Events",
      "Retargeting",
      "High-Intent Lead Magnets",
    ],
  },
  {
    name: "Conversion Landing Pages",
    tagline: "Turn Clicks Into Booked Meetings",
    description:
      "We build purpose-built pages for each campaign and optimize them from first click through to a booked meeting.",
    items: [
      "Campaign Landing Pages",
      "Conversion Rate Optimization",
      "A/B Testing",
      "Form & Offer Optimization",
      "Tracking & Attribution",
    ],
  },
  {
    name: "Lead Qualification & Nurturing",
    tagline: "Hand Sales Only the Leads Worth Their Time",
    description:
      "We qualify and nurture every lead so your sales team spends time on conversations that are ready to progress.",
    items: [
      "Lead Scoring",
      "SDR Handoff Scripts",
      "Discovery Frameworks",
      "Nurture Sequences",
      "CRM Integration",
    ],
  },
];

const leadGenProcess: { step: string; text: string }[] = [
  { step: "Discover", text: "We learn your business goals, sales cycle, and what a qualified opportunity really looks like." },
  { step: "Target", text: "We define your ICP, build verified account lists, and validate offers against real deals in your CRM." },
  { step: "Launch", text: "We build and launch multi-channel campaigns and landing pages wired into the tools you already use." },
  { step: "Qualify", text: "We score replies, book meetings, and hand off only leads your sales team can trust." },
  { step: "Optimize", text: "We review sourced pipeline monthly and refine targeting, offers, and sequences against revenue targets." },
];

const leadGenFaqs: { q: string; a: string }[] = [
  {
    q: "How is B2B lead generation different for cybersecurity companies?",
    a: "Cybersecurity buyers are senior, technical, and skeptical, with long, committee-driven sales cycles. Our programs are built around that reality, focusing on trust, precise targeting, and relevance rather than volume.",
  },
  {
    q: "Do you replace or work alongside our sales team?",
    a: "We work alongside your team. We source, engage, and qualify opportunities, then hand off sales-ready meetings so your reps can focus on discovery and closing.",
  },
  {
    q: "How quickly will we start seeing qualified meetings?",
    a: "First conversations typically begin within the first few weeks of launch, while predictable, repeatable pipeline builds over the first quarter as targeting and messaging are refined.",
  },
  {
    q: "Which channels do you use for outreach?",
    a: "We combine email, LinkedIn, and calling with demand generation, then concentrate effort on the channels where your specific buyers respond and convert.",
  },
];

// Prose kept as string constants so JSX stays free of unescaped-entity issues.
const heroCopy1 =
  "Traffic is not the finish line. We turn qualified interest into booked meetings with systematic outreach, high-intent offers, and pipeline you can measure.";
const whyCopy1 =
  "The right buyers find you, read the work, then leave without ever starting a conversation, and that silent gap is where most pipeline quietly disappears.";
const whyCopy2 =
  "Effective lead generation closes that gap with precise targeting, relevant offers, and clear qualification, so every campaign is measured by the meetings and pipeline it creates.";
const servicesIntro =
  "Every cybersecurity company sells to a different buyer, sales cycle, and market. We build lead generation programs around how your customers actually evaluate and buy.";
const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

type Props = { act: Act };

export default function LeadGenServiceContent({ act }: Props) {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "B2B Lead Generation Services for cybersecurity companies",
    serviceType: "Lead Generation",
    description:
      "B2B lead generation for cybersecurity companies: ICP research, outbound prospecting, demand generation, conversion landing pages, and lead qualification that turn interest into sourced pipeline.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Lead generation offerings",
      itemListElement: leadGenServices.map((s) => ({
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
    mainEntity: leadGenFaqs.map((faq) => ({
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
                Leads That Build{" "}
                <span className="font-serif italic text-[#e9af88] md:block">
                  Real Pipeline
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
                  Book a Pipeline Strategy Call
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <ServiceHeroFigure accent={accent}>
                <PipelineCardGraphic />
              </ServiceHeroFigure>
            </div>
          </div>
        </div>
      </section>

      {/* WHY LEAD GENERATION MATTERS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Turn Qualified Interest Into Real Pipeline
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

      {/* OUR LEAD GENERATION SERVICES */}
      <section
        id="lead-generation-services"
        className="py-16 md:py-20 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              End-to-End Demand and Pipeline Generation
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {servicesIntro}
            </p>
          </Reveal>

          <div className="space-y-6 md:space-y-8">
            {leadGenServices.map((svc, idx) => (
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

      {/* OUR LEAD GENERATION PROCESS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Systematic Path From Target to Booked Meeting
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {leadGenProcess.map((phase, idx) => (
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
              {leadGenFaqs.map((faq, idx) => (
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
      <section className="relative isolate overflow-hidden pt-12 md:pt-16 pb-24 md:pb-32 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-3xl md:text-5xl text-primary font-medium leading-tight">
            Ready to Build Predictable Pipeline?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
            >
              Book Your Free Pipeline Consultation
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
