import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SpotlightBackdrop from "@/components/SpotlightBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import LinkedInCardGraphic from "@/components/LinkedInCardGraphic";
import {
  AccentBadge,
  AccentDot,
  ServiceHeroFigure,
  type Accent,
} from "@/components/ServiceContentKit";
import { siteConfig } from "@/lib/content";

// Pillar colour signature for LinkedIn management: a muted steel-blue that sits
// beside the four growth-act accents without repeating any of them.
const accent: Accent = { from: "#6f8fae", to: "#dce6f0", ink: "#22384c" };

export const metadata: Metadata = {
  title: "LinkedIn Personal Account Management",
  description:
    "Human-led LinkedIn personal account management. 100% manual profile optimisation, targeted networking, and personalised outreach that build a credible personal brand and real business conversations. No bots, no automation.",
  alternates: { canonical: "/services/linkedin-personal-account" },
  openGraph: {
    title: "LinkedIn Personal Account Management · Human-Led, 100% Manual",
    description:
      "Quality connections, meaningful conversations, and long-term relationships built entirely by hand. No bots. No automation. No mass activity.",
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
    name: "Profile Optimisation",
    tagline: "Make Every Profile Visit Count",
    description:
      "We position the profile so a prospect instantly understands who the person is, what they do, and why a conversation is worth their time.",
    items: [
      "Headline Positioning",
      "About Section Rewrite",
      "Experience Optimisation",
      "Featured Section Curation",
      "Keyword Alignment",
      "Value Proposition Clarity",
    ],
  },
  {
    name: "Building the Right Network",
    tagline: "Relevance Over Raw Numbers",
    description:
      "We build a network of people who matter to the business, reviewing every profile for relevance before a request is ever sent.",
    items: [
      "ICP-Matched Prospects",
      "Founders & Business Owners",
      "CXOs & Senior Decision-Makers",
      "Strategic Partners",
      "Industry Professionals",
      "Relevant Influencers",
    ],
  },
  {
    name: "Daily Connection Activity",
    tagline: "Consistent, Strategic, Hand-Run",
    description:
      "Networking is carried out manually every day, with personalised requests sent to the right people rather than bulk invitations at scale.",
    items: [
      "Prospect Identification",
      "Profile Review Before Connecting",
      "Personalised Connection Requests",
      "Following Relevant Professionals",
      "Response Monitoring",
      "Steady Account Activity",
    ],
  },
  {
    name: "Commenting Strategy",
    tagline: "Visibility Through Genuine Participation",
    description:
      "We use context-driven comments on the right conversations to put the profile in front of the target audience, never generic one-line replies.",
    items: [
      "Target Prospect Posts",
      "Industry Leader Threads",
      "Decision-Maker Conversations",
      "Strategic Account Activity",
      "Meaningful, Context-Led Comments",
      "Authority Building",
    ],
  },
  {
    name: "Relationship Building",
    tagline: "A Connection Is Only the Beginning",
    description:
      "We nurture relevant connections over time with a relationship-first approach, so trust is established well before any pitch.",
    items: [
      "Engaging With Connections",
      "Interacting With Their Posts",
      "Sharing Useful Information",
      "Starting Contextual Conversations",
      "Nurturing High-Value Contacts",
      "Spotting Collaboration Openings",
    ],
  },
  {
    name: "Strategic Outreach",
    tagline: "Personalised, Relevant, Manual",
    description:
      "Once relationships are established, we run targeted outreach built on understanding each prospect, never generic mass messaging.",
    items: [
      "High-Potential Targeting",
      "Prospect & Business Research",
      "Personalised Messaging",
      "Contextual Conversations",
      "Considered Follow-Ups",
      "Qualified Business Discussions",
    ],
  },
  {
    name: "Network Expansion",
    tagline: "Grow Into the Right Market",
    description:
      "We continuously find new, relevant people to connect with so the network keeps growing in both quality and business relevance.",
    items: [
      "New Prospect Segments",
      "Second-Degree Connections",
      "Engaged Content Audiences",
      "New Target Accounts",
      "Referral Partners",
      "Relevant Communities",
    ],
  },
  {
    name: "Measure & Improve",
    tagline: "Refined Against Real Signals",
    description:
      "We review activity regularly and improve targeting, engagement, and outreach based on what is actually generating conversations.",
    items: [
      "Profile Views & Search Appearances",
      "Connection Growth & Acceptance Rate",
      "Post & Comment Engagement",
      "Outreach Response Rate",
      "Conversations Generated",
      "Qualified Prospects",
    ],
  },
];

// The relationship-led cycle the engagement runs on.
const processCycle: { step: string; text: string }[] = [
  {
    step: "Targeting",
    text: "We define the ideal audience and identify the specific people worth a genuine connection.",
  },
  {
    step: "Networking",
    text: "We review each profile and send personalised requests by hand, one relevant person at a time.",
  },
  {
    step: "Engagement",
    text: "We comment, interact, and participate in the conversations your buyers actually pay attention to.",
  },
  {
    step: "Outreach",
    text: "We open relevant, personalised conversations with the prospects most likely to become opportunities.",
  },
  {
    step: "Relationships",
    text: "We nurture high-value contacts over time and move qualified conversations toward a business discussion.",
  },
];

const willNot: string[] = [
  "LinkedIn automation bots",
  "Automated connection-request tools",
  "Automated profile-viewing tools",
  "Automated commenting or messaging tools",
  "Bulk connection software",
  "Any tool that imitates LinkedIn activity",
];

const willUse: string[] = [
  "Manual profile research",
  "Manual connection requests",
  "Manual commenting and engagement",
  "Personalised, human-written messaging",
  "Relationship-led outreach",
  "LinkedIn's own native features",
];

const outcomes: string[] = [
  "A stronger LinkedIn personal brand",
  "Higher visibility among the target audience",
  "A relevant professional network",
  "Stronger relationships with decision-makers",
  "Increased and more meaningful engagement",
  "More real conversations",
  "Potential sales opportunities",
  "Long-term professional authority",
];

const heroCopy =
  "We build a credible personal brand through human engagement and personalised outreach that turns into real conversations.";
const whyCopy1 =
  "Automation floods the wrong people with generic requests and puts the account at risk. It builds volume, not trust, and it rarely produces a conversation worth having.";
const whyCopy2 =
  "We take the opposite approach. Every activity is performed by hand, so interactions stay authentic, communication stays personalised, and the network you build is genuinely relevant to your business.";
const scopeIntro =
  "One connected engagement covering everything from how the profile is positioned to how qualified conversations are opened, all performed manually by our team.";
const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

export default function LinkedInManagementPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "LinkedIn Personal Account Management",
    serviceType: "LinkedIn Personal Account Management",
    description:
      "Human-led, 100% manual LinkedIn personal account management: profile optimisation, targeted networking, commenting, relationship building, and personalised outreach. No bots, no automation, no mass activity.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "LinkedIn management scope of work",
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
        name: "LinkedIn Personal Account Management",
        item: `${siteConfig.url}/services/linkedin-personal-account`,
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
                <span className="block">A LinkedIn Presence</span>
                <span className="block font-serif italic text-[#e9af88]">
                  Built by Hand
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
                    <LinkedInCardGraphic />
                  </ServiceHeroFigure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY MANUAL */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                100% Manual LinkedIn Management
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

      {/* SCOPE OF WORK */}
      <section
        id="scope-of-work"
        className="py-12 md:py-20 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
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

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
          <Reveal>
            <blockquote
              className="font-serif italic text-3xl md:text-5xl font-medium leading-[1.15] max-w-4xl text-balance"
              style={bandInk}
            >
              No bots. No automation. No mass activity. Just human-led networking that
              builds a genuine professional network.
            </blockquote>
          </Reveal>

          <div
            className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 border-t pt-10"
            style={{ borderColor: bandBorder }}
          >
            {[
              {
                title: "Quality Connections",
                text: "Every request goes to the right person, reviewed for relevance before it is sent.",
              },
              {
                title: "Meaningful Conversations",
                text: "Context-led comments and personalised outreach that earn genuine responses.",
              },
              {
                title: "Long-Term Relationships",
                text: "A relationship-first approach that builds trust and lasting business value.",
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

      {/* MANUAL PROCESS & ACCOUNT SAFETY */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              Manual Process and Account Safety
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              Account safety is a priority throughout the engagement. Activity stays
              human, contextual, and fully under our control.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <Reveal className="h-full">
              <div className="h-full rounded-lg border border-border bg-background-soft/40 p-8 md:p-10">
                <h3 className="font-serif text-2xl text-primary font-medium">
                  What We Will Not Use
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {willNot.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm md:text-base text-primary/85 font-normal">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120} className="h-full">
              <div
                className="h-full rounded-lg border p-8 md:p-10"
                style={{
                  borderColor: `color-mix(in srgb, ${accent.from} 45%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accent.to} 40%, white)`,
                }}
              >
                <h3 className="font-serif text-2xl text-primary font-medium">
                  What We Will Use
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {willUse.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm md:text-base text-primary/90 font-normal">
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
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* PROCESS CYCLE */}
      <section className="py-12 md:py-20 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Relationship-Led Cycle, Refined Every Month
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                What the Engagement Is Built to Achieve
              </h2>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
                Growth cannot be guaranteed, because it depends on your market, profile,
                and audience. Our responsibility is consistent, strategic, personalised,
                and completely manual management.
              </p>
            </Reveal>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* FOUNDER POSITIONING QUOTE */}
      <section className="relative isolate overflow-hidden py-12 md:py-20 bg-background-soft">
        <SpotlightBackdrop />
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
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
              We don&apos;t automate your LinkedIn. We build real relationships by
              hand, so the right people actually want to talk to you.
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
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden
              >
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
