import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import SocialAdsCardGraphic from "@/components/SocialAdsCardGraphic";
import {
  AccentBadge,
  AccentDot,
  ServiceHeroFigure,
  type Accent,
} from "@/components/ServiceContentKit";
import { siteConfig } from "@/lib/content";

// Pillar colour signature for social media advertising: a muted berry-rose that
// sits beside the four growth-act accents, the LinkedIn steel-blue, and the
// social-media violet-plum without repeating any of them.
const accent: Accent = { from: "#b06a86", to: "#f2dde6", ink: "#4a1f30" };

export const metadata: Metadata = {
  title: "Social Media Advertising",
  description:
    "Targeted social media advertising for local businesses. End-to-end paid campaign management across two platforms: strategy, audience targeting, ad creative, A/B testing, and continuous optimisation that drives enquiries, leads, and conversions.",
  alternates: { canonical: "/services/social-media-advertisement" },
  openGraph: {
    title: "Social Media Advertising · Reach the Right Customers",
    description:
      "Paid social campaigns managed end to end: strategy, targeting, creative, testing, and optimisation. One team focused on turning ad spend into measurable business outcomes.",
  },
};

type ScopeService = {
  name: string;
  tagline: string;
  description: string;
  items: string[];
};

const scopeServices: ScopeService[] = [
  {
    name: "Advertising Strategy",
    tagline: "A Plan Built Around Your Business",
    description:
      "We develop a paid social advertising strategy shaped by your objectives, audience, offer, and budget, focused on reaching relevant people and driving measurable outcomes.",
    items: [
      "Business Objectives",
      "Target Audience",
      "Products and Services",
      "Location Focus",
      "Customer Profile",
      "Marketing Goals",
      "Advertising Budget",
    ],
  },
  {
    name: "Campaign Setup and Management",
    tagline: "Two Platforms, Fully Managed",
    description:
      "We run campaigns across two platforms selected based on where your audience is most active, handling structure, targeting, placements, and budget from setup through to optimisation.",
    items: [
      "Campaign Structure and Setup",
      "Objective Selection",
      "Audience Targeting",
      "Geographic Targeting",
      "Interest and Demographic Targeting",
      "Retargeting Opportunities",
      "Ad Placement Selection",
      "Budget Allocation",
    ],
  },
  {
    name: "Audience Targeting",
    tagline: "Spend Focused on the Right People",
    description:
      "We identify and target the audiences most relevant to your business, so advertising budget is focused on people with a higher likelihood of taking action rather than wasted on the wrong reach.",
    items: [
      "Demographics",
      "Location",
      "Interests and Behaviours",
      "Customer Profiles",
      "Custom Audiences",
      "Website Visitors",
      "Engagement Audiences",
      "Retargeting Audiences",
    ],
  },
  {
    name: "Ad Creative and Copy Strategy",
    tagline: "Messaging Built to Convert",
    description:
      "We plan creatives and messaging around the campaign objective, with ad copy developed for clarity, relevance, engagement, and conversion.",
    items: [
      "Promotional Creatives",
      "Product and Service Creatives",
      "Lead Generation Creatives",
      "Offer-Based Creatives",
      "Educational Creatives",
      "Testimonial-Based Creatives",
      "Short-Form Video Ads",
    ],
  },
  {
    name: "Monitoring and Optimisation",
    tagline: "Refined Against Real Performance",
    description:
      "Campaigns are continuously monitored so we can act on what the data shows, adjusting audiences, budgets, creatives, and structure to improve results over time.",
    items: [
      "Impressions and Reach",
      "Clicks and Engagement",
      "Cost per Click",
      "Click-Through Rate",
      "Leads and Cost per Lead",
      "Conversions",
      "Budget and Bidding Adjustments",
      "Overall Campaign Performance",
    ],
  },
  {
    name: "A/B Testing",
    tagline: "Improve What Actually Works",
    description:
      "Where appropriate, we test different campaign elements to identify what performs better and gradually improve campaign efficiency and performance.",
    items: [
      "Different Audiences",
      "Ad Creatives",
      "Headlines",
      "Ad Copy",
      "Offers",
      "Calls to Action",
      "Campaign Objectives",
    ],
  },
  {
    name: "Performance Reporting",
    tagline: "Clear Insight, Every Cycle",
    description:
      "We provide regular insight into how campaigns are performing, what is working, and where the opportunities are, so you always understand the return on your advertising.",
    items: [
      "Campaign Performance",
      "Audience Performance",
      "Lead Generation",
      "Advertising Spend",
      "Cost per Result",
      "Best-Performing Campaigns",
      "Areas for Improvement",
      "Recommended Optimisations",
    ],
  },
];

// The campaign cycle the engagement runs on.
const processCycle: { step: string; text: string }[] = [
  {
    step: "Strategy",
    text: "We build the advertising strategy around your objectives, audience, offer, and budget before anything goes live.",
  },
  {
    step: "Setup",
    text: "We structure and launch campaigns across two platforms with the right objectives, placements, and budgets.",
  },
  {
    step: "Target",
    text: "We focus spend on the audiences most relevant to your business, including custom and retargeting audiences.",
  },
  {
    step: "Optimise",
    text: "We monitor performance daily and refine audiences, creatives, copy, and budgets to improve results.",
  },
  {
    step: "Report",
    text: "We report on performance and cost per result, then agree the next round of optimisations with you.",
  },
];

const outcomes: string[] = [
  "Greater brand visibility",
  "More customer enquiries",
  "A steady flow of qualified leads",
  "Better return on advertising spend",
  "Audiences focused on the right people",
  "Creatives that communicate and convert",
  "Campaigns refined against real results",
  "Clearer insight into what is working",
];

const heroCopy =
  "We manage targeted paid campaigns end to end, turning your ad spend into enquiries, leads, and conversions.";
const objectiveCopy1 =
  "Boosting posts without a plan spends budget on the wrong people and rarely produces the enquiries a business is looking for. Reach without relevance is activity, not results.";
const objectiveCopy2 =
  "We take a different approach. Strategy, audience targeting, creative, testing, and optimisation are managed together, so every campaign is focused on relevant audiences and measurable business outcomes.";
const scopeIntro =
  "One connected engagement covering everything from advertising strategy to reporting, managed by our team across two platforms selected around your audience.";
const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

export default function SocialMediaAdvertisingPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Social Media Advertising",
    serviceType: "Social Media Advertising",
    description:
      "End-to-end paid social media advertising: strategy, campaign setup and management, audience targeting, ad creative and copy, monitoring and optimisation, A/B testing, and performance reporting across two platforms.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Social media advertising scope of work",
      itemListElement: scopeServices.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.description,
        },
      })),
    },
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
        name: "Social Media Advertising",
        item: `${siteConfig.url}/services/social-media-advertisement`,
      },
    ],
  };

  const bandInk: CSSProperties = { color: accent.ink };
  const bandBorder = `color-mix(in srgb, ${accent.ink} 22%, transparent)`;

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
              <h1 className="font-serif text-white font-medium tracking-tight leading-[1.06] whitespace-nowrap text-[clamp(1.9rem,6.4vw,4.1rem)]">
                <span className="block">Social Media Ads</span>
                <span className="block font-serif italic text-[#e9af88]">
                  That Win Customers
                </span>
              </h1>

              <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mt-8 max-w-2xl">
                {heroCopy}
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
              <div className="relative mx-auto flex aspect-square w-full max-w-[560px] items-center justify-center">
                <div className="w-full origin-center scale-[1.18]">
                  <ServiceHeroFigure accent={accent}>
                    <SocialAdsCardGraphic />
                  </ServiceHeroFigure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OBJECTIVE */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Helping Local Businesses Reach the Right Customers
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={120}>
              <p className="font-serif text-xl md:text-2xl text-primary font-normal leading-relaxed">
                {objectiveCopy1}
              </p>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
                {objectiveCopy2}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* SCOPE OF WORK */}
      <section
        id="scope-of-work"
        className="py-12 md:py-16 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-10 md:mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              Everything Included in the Engagement
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {scopeIntro}
            </p>
          </Reveal>

          <div className="space-y-6 md:space-y-8">
            {scopeServices.map((svc, idx) => (
              <Reveal key={svc.name} delay={idx * 50}>
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

                    <div className="hidden sm:block lg:col-span-7 lg:border-l lg:border-border lg:pl-12">
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

      {/* KEY DIFFERENTIATOR BAND */}
      <section aria-label="Key differentiator" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(130% 130% at 6% 0%, ${accent.from} 0%, ${accent.to} 44%, ${accent.to} 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-overlay opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.55), transparent 55%), radial-gradient(circle at 88% 88%, rgba(0,0,0,0.22), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 22px)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <Reveal>
            <blockquote
              className="font-serif italic text-3xl md:text-5xl font-medium leading-[1.15] max-w-4xl text-balance"
              style={bandInk}
            >
              The objective is not simply more reach, but relevant audiences, lower wasted
              spend, and campaigns that drive action.
            </blockquote>
          </Reveal>

          <div
            className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 border-t pt-10"
            style={{ borderColor: bandBorder }}
          >
            {[
              {
                title: "Targeted Spend",
                text: "Budget focused on the audiences most likely to enquire, buy, or convert.",
              },
              {
                title: "Tested and Refined",
                text: "Creatives, audiences, and copy tested continuously to improve performance.",
              },
              {
                title: "Measured on Results",
                text: "Campaigns judged on cost per result and business outcomes, not vanity metrics.",
              },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div style={bandInk}>
                  <div className="font-serif text-xl md:text-2xl font-medium leading-snug">
                    {p.title}
                  </div>
                  <p className="text-sm md:text-base mt-2.5 leading-relaxed opacity-75">
                    {p.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ADVERTISING BUDGET AND HONEST EXPECTATIONS */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-10 md:mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
              How the Budget and Results Work
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              Clear expectations from the start, so you know exactly what advertising spend
              covers and what our management commitment is.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <Reveal className="h-full">
              <div
                className="h-full rounded-lg border p-8 md:p-10"
                style={{
                  borderColor: `color-mix(in srgb, ${accent.from} 45%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accent.to} 40%, white)`,
                }}
              >
                <h3 className="font-serif text-2xl text-primary font-medium">
                  Advertising Budget
                </h3>
                <p className="text-sm md:text-base text-primary/85 font-normal leading-relaxed mt-5">
                  The advertising budget is set around your objectives, audience, campaign
                  requirements, and desired reach. It is separate from the advertising
                  management fee, and the recommended budget is discussed and finalised
                  with you before any campaigns launch.
                </p>
                <ul className="mt-6 space-y-3.5">
                  {[
                    "Budget shaped around your goals and reach",
                    "Ad spend kept separate from the management fee",
                    "Recommended budget agreed before launch",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm md:text-base text-primary/90 font-normal"
                    >
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0"
                        style={{ color: accent.ink }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120} className="h-full">
              <div className="h-full rounded-lg border border-border bg-background-soft/40 p-8 md:p-10">
                <h3 className="font-serif text-2xl text-primary font-medium">
                  An Honest Note on Results
                </h3>
                <p className="text-sm md:text-base text-primary/85 font-normal leading-relaxed mt-5">
                  Advertising performance depends on your industry, audience, offer,
                  competition, creative quality, landing page experience, budget, and market
                  response. Because of this, specific numbers of leads, sales, followers, or
                  revenue cannot be guaranteed.
                </p>
                <p className="text-sm md:text-base text-text-muted font-normal leading-relaxed mt-4">
                  Our commitment is strategic campaign management, relevant audience
                  targeting, continuous monitoring, and ongoing optimisation to help your
                  business achieve better results from social media advertising.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* PROCESS CYCLE */}
      <section className="py-12 md:py-16 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-10 md:mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Managed Campaign Cycle, Refined Continuously
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {processCycle.map((phase, idx) => (
              <li key={phase.step} className="h-full">
                <Reveal delay={idx * 80} className="h-full p-6 border border-border rounded-lg bg-white hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 flex flex-col">
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

      <SectionSeam from="soft" to="white" />

      {/* EXPECTED OUTCOMES */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-10 md:mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
              What the Engagement Is Built to Achieve
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              Results depend on your market, offer, and budget, so specific numbers cannot be
              guaranteed. Our responsibility is relevant targeting, strong creative, careful
              management, and continuous optimisation.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {outcomes.map((item, idx) => (
              <Reveal key={item} delay={idx * 50}>
                <div className="flex items-start gap-3 h-full p-5 border border-border rounded-lg bg-background-soft/30 hover:bg-background-soft transition-colors duration-300">
                  <AccentBadge accent={accent} className="h-7 w-7 text-[11px]">
                    {String(idx + 1).padStart(2, "0")}
                  </AccentBadge>
                  <span className="text-sm md:text-base text-primary/90 font-normal leading-relaxed">
                    {item}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* PRE-FOOTER POSITIONING QUOTE */}
      <section className="relative isolate overflow-hidden py-14 md:py-20 bg-background-soft">
        <div
          className="absolute inset-0 -z-10"
          style={{
            maskImage:
              "linear-gradient(to right, black 0%, black 30%, transparent 43%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black 30%, transparent 43%)",
          }}
        >
          <PreFooterBackdrop />
        </div>
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto lg:mx-0 overflow-hidden rounded-2xl border border-border">
              <Image
                src="/siddique.webp"
                alt="Siddique Ahmed"
                fill
                sizes="(min-width: 1024px) 24rem, 20rem"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-7">
            <svg
              aria-hidden
              className="w-10 h-10 text-accent"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9.5 4C6.5 6 5 9 5 13v7h7v-8H8.5c0-2.5 1-4.5 3-6L9.5 4zm9 0c-3 2-4.5 5-4.5 9v7h7v-8h-3.5c0-2.5 1-4.5 3-6L18.5 4z" />
            </svg>
            <blockquote className="mt-8 font-serif italic text-3xl md:text-4xl text-primary font-medium leading-[1.25] tracking-tight">
              We don&apos;t just spend your budget on reach. We put your ads in
              front of the right customers and turn spend into real results.
            </blockquote>
            <div className="mt-8">
              <p className="font-serif text-lg text-primary font-medium leading-tight">
                Siddique Ahmed
              </p>
              <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-text-muted">
                Fynix Digital
              </p>
            </div>
            <a
              href="https://calendly.com/siddique-fynix/business-introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
            >
              Let&apos;s book a call
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
              </svg>
            </a>
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
