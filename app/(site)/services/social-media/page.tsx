import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import SocialMediaCardGraphic from "@/components/SocialMediaCardGraphic";
import {
  AccentBadge,
  AccentDot,
  ServiceHeroFigure,
  type Accent,
} from "@/components/ServiceContentKit";
import { siteConfig } from "@/lib/content";

// Pillar colour signature for social media management: a muted violet-plum that
// sits beside the four growth-act accents and the LinkedIn steel-blue without
// repeating any of them.
const accent: Accent = { from: "#9285b8", to: "#e7e2f1", ink: "#33294d" };

export const metadata: Metadata = {
  title: "Social Media Management",
  description:
    "End-to-end social media management for growing businesses. Content planning, audience-focused creatives, raw video editing, and paid campaign management across two platforms, delivered as one managed service.",
  alternates: { canonical: "/services/social-media" },
  openGraph: {
    title: "Social Media Management · Managed End to End",
    description:
      "Content planning, creative development, video editing, publishing, and paid campaigns. One team handling your social media so you can run your business.",
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
    name: "Social Media Management",
    tagline: "A Consistent, Professional Presence",
    description:
      "We manage two social media platforms end to end, with content planned around your business, target audience, products, and marketing objectives.",
    items: [
      "Monthly Content Planning",
      "Content Calendar Creation",
      "Post Scheduling and Publishing",
      "Profile and Page Management",
      "Audience-Focused Strategy",
      "Engagement Monitoring",
      "Basic Community Management",
      "Performance Monitoring",
    ],
  },
  {
    name: "Content Creation",
    tagline: "12 Posts per Platform, Every Month",
    description:
      "You receive 12 posts per month on each platform, 24 in total, created to communicate your brand effectively and keep the presence consistent.",
    items: [
      "Educational Content",
      "Promotional Content",
      "Industry-Related Content",
      "Brand-Focused Content",
      "Customer-Focused Content",
      "Service and Product Highlights",
      "Tips and Insights",
      "Offers and Campaigns",
      "Relevant Trends and Occasions",
    ],
  },
  {
    name: "Audience-Focused Creatives",
    tagline: "Built to Communicate and Convert",
    description:
      "The goal is not simply attractive designs, but creatives built around the audience you want to reach, so the content communicates clearly and drives action.",
    items: [
      "Relevant to Your Audience",
      "Consistent With Your Brand",
      "Easy to Understand",
      "Visually Engaging",
      "Aligned to Objectives",
      "Designed to Drive Action",
    ],
  },
  {
    name: "Raw Video Editing",
    tagline: "You Film It, We Shape It",
    description:
      "Provide raw footage and we edit it into social-media-ready content, so you capture the moment while we handle the preparation and formatting.",
    items: [
      "Video Trimming",
      "Removing Unnecessary Sections",
      "Text and Captions",
      "Basic Transitions",
      "Branding Elements",
      "Social Media Formatting",
      "Short-Form Video Content",
    ],
  },
  {
    name: "Ad Account Management and Optimisation",
    tagline: "Paid Media, Actively Managed",
    description:
      "We manage your advertising accounts and use paid campaigns to support visibility, engagement, lead generation, or other agreed business objectives.",
    items: [
      "Ad Account Management",
      "Campaign Setup",
      "Audience Targeting",
      "Creative Selection",
      "Campaign Monitoring",
      "Performance Analysis",
      "Budget Optimisation",
      "Creative and Audience Testing",
    ],
  },
  {
    name: "Paid Campaign Management",
    tagline: "Organic and Paid, Working Together",
    description:
      "Organic content and paid advertising work as one strategy, with the right content promoted to the right audiences and campaigns refined against results.",
    items: [
      "Content Selected for Promotion",
      "Campaign Structures",
      "Relevant Audience Definition",
      "Campaign Performance Monitoring",
      "Result-Based Optimisation",
      "Improvement Opportunities",
    ],
  },
];

// The monthly deliverables snapshot from the scope of work.
const deliverables: { label: string; value: string }[] = [
  { label: "Social Media Platforms", value: "2" },
  { label: "Posts per Platform", value: "12" },
  { label: "Total Posts", value: "24" },
  { label: "Audience-Focused Creatives", value: "Included" },
  { label: "Raw Video Editing", value: "Included" },
  { label: "Social Media Management", value: "Included" },
  { label: "Ad Account Management", value: "Included" },
  { label: "Paid Campaign Management", value: "Included" },
  { label: "Advertising Allocation", value: "10% of monthly fee" },
  { label: "Performance Monitoring", value: "Included" },
];

// The monthly cycle the engagement runs on.
const processCycle: { step: string; text: string }[] = [
  {
    step: "Plan",
    text: "We build the monthly content plan and calendar around your business, audience, and marketing objectives.",
  },
  {
    step: "Create",
    text: "We design audience-focused creatives and edit your raw footage into social-ready posts and short-form video.",
  },
  {
    step: "Publish",
    text: "We schedule and publish across both platforms, manage the profiles, and keep the presence consistent.",
  },
  {
    step: "Promote",
    text: "We set up and run paid campaigns, promoting the right content to the right audiences to support your goals.",
  },
  {
    step: "Optimise",
    text: "We monitor performance and refine content, creatives, and campaigns based on what is actually working.",
  },
];

const outcomes: string[] = [
  "A consistent, professional social presence",
  "Stronger brand visibility",
  "Higher audience engagement",
  "A clear, audience-focused content strategy",
  "Creatives that communicate and convert",
  "Paid campaigns aligned to your objectives",
  "More customer conversations",
  "Steady social growth over time",
];

const heroCopy =
  "We build a consistent social media presence that grows brand visibility, engagement, and customers, run by one team.";
const objectiveCopy1 =
  "A scattered, inconsistent presence rarely builds trust or attention. Posting without a plan produces activity, not results, and it rarely earns the engagement a business is looking for.";
const objectiveCopy2 =
  "We take the opposite approach. Content planning, creative development, video editing, publishing, and paid campaigns are handled together, so the presence stays consistent and every post works toward your objectives.";
const scopeIntro =
  "One connected engagement covering everything from how content is planned to how paid campaigns are run, all managed by our team across two platforms.";
const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

export default function SocialMediaPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Social Media Management",
    serviceType: "Social Media Management",
    description:
      "End-to-end social media management: content planning, audience-focused creatives, raw video editing, publishing, ad account management, and paid campaign management across two platforms.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Social media management scope of work",
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
        name: "Social Media Management",
        item: `${siteConfig.url}/services/social-media`,
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
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[67.2px] text-white font-medium tracking-tight leading-[1.08] text-balance">
                Social Media,{" "}
                <span className="font-serif italic text-[#e9af88] md:block">
                  Managed End to End
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
                    <SocialMediaCardGraphic />
                  </ServiceHeroFigure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OBJECTIVE */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Helping Businesses Grow Through Social Media
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
        className="py-12 md:py-20 bg-background-soft scroll-mt-24"
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

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
          <Reveal>
            <blockquote
              className="font-serif italic text-3xl md:text-5xl font-medium leading-[1.15] max-w-4xl text-balance"
              style={bandInk}
            >
              The objective is not simply to create attractive designs, but content that
              communicates and converts.
            </blockquote>
          </Reveal>

          <div
            className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 border-t pt-10"
            style={{ borderColor: bandBorder }}
          >
            {[
              {
                title: "Planned Around You",
                text: "Content built around your business, audience, products, and marketing objectives.",
              },
              {
                title: "Organic Plus Paid",
                text: "Consistent posting and managed campaigns working together as one strategy.",
              },
              {
                title: "One Managed Team",
                text: "Planning, creative, video, publishing, and ads handled end to end by us.",
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

      {/* MONTHLY DELIVERABLES */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-12 md:mb-10 md:mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
              What You Get Every Month
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              A clear monthly scope so you always know what is included. The two platforms
              are selected based on where your audience is most active and agreed before
              the engagement begins.
            </p>
          </Reveal>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deliverables.map((row, idx) => (
              <Reveal key={row.label} delay={idx * 40}>
                <div className="flex items-center justify-between gap-4 h-full p-5 border border-border rounded-lg bg-background-soft/30 hover:bg-background-soft transition-colors duration-300">
                  <dt className="text-sm md:text-base text-primary/85 font-normal leading-snug">
                    {row.label}
                  </dt>
                  <dd
                    className="shrink-0 font-serif text-lg md:text-xl font-medium"
                    style={{ color: accent.ink }}
                  >
                    {row.value}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* PROCESS CYCLE */}
      <section className="py-12 md:py-20 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-10 md:mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Managed Cycle, Refined Every Month
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
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-12 md:mb-10 md:mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
              What the Engagement Is Built to Achieve
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              Results depend on your industry, audience, offer, competition, and budget, so
              specific numbers cannot be guaranteed. Our responsibility is consistent
              execution, audience-focused content, professional management, and continuous
              optimisation.
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
      <section className="relative isolate overflow-hidden py-14 md:py-28 bg-background-soft">
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
              We don&apos;t just fill your feed with posts. We build a consistent
              presence that keeps your business in front of the customers who
              matter.
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
