import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import CaseStudyBar from "@/components/CaseStudyBar";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import SectionSeam from "@/components/SectionSeam";
import { siteConfig } from "@/lib/content";

const SLUG = "lead-generation-up";
const TITLE =
  "How we generated 60 sales-qualified meetings for a cloud security company in India";
const DESCRIPTION =
  "An account-based, multi-channel outbound program that booked 60 qualified meetings with CISOs, CTOs, CIOs and senior security leaders across a six-month campaign.";
const OG_IMAGE = `${siteConfig.url}/case-studies/${SLUG}-og.webp`;
const OG_ALT =
  "Lead generation case study — B2B cloud security company, India, 6X ROI.";

export const metadata: Metadata = {
  title: "60 Sales-Qualified Meetings for a Cloud Security Company · Case Study",
  description: DESCRIPTION,
  alternates: { canonical: `/case-studies/${SLUG}` },
  openGraph: {
    title: `${TITLE} · Fynix Case Study`,
    description: DESCRIPTION,
    type: "article",
    url: `${siteConfig.url}/case-studies/${SLUG}`,
    // 1080×1080 square. Twitter's summary_large_image will crop to
    // 1.91:1; the design keeps the badge, headline and 6X inside the
    // safe horizontal band, so the crop still reads.
    images: [
      { url: OG_IMAGE, width: 1080, height: 1080, alt: OG_ALT, type: "image/webp" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} · Fynix Case Study`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

/* ---------------------------------------------------------------- data ---- */

const snapshot = [
  { label: "Client", value: "Cloud Security Company" },
  { label: "Market", value: "India" },
  { label: "Campaign duration", value: "6 months" },
  {
    label: "Target audience",
    value: "CISOs, CTOs, CIOs, IT Directors, Senior Security & Decision Makers",
  },
];

const headlineMetrics = [
  { value: "3,800+", label: "Accounts researched" },
  { value: "9,500+", label: "Decision-makers identified" },
  { value: "6,800+", label: "Prospects contacted" },
  { value: "15,500+", label: "Outreach attempts" },
  { value: "240+", label: "Positive conversations" },
  { value: "60", label: "Meetings" },
];

const challengePoints = [
  "Senior decision-makers were difficult to reach through generic outbound campaigns.",
  "Raw contact volume did not translate reliably into sales opportunities.",
  "The sales team needed better qualification before spending time on meetings.",
  "The campaign needed to focus on companies with a realistic cybersecurity requirement and buying potential.",
];

const decisionRoles = [
  "CISO / Chief Information Security Officer",
  "CTO / Chief Technology Officer",
  "CIO / Chief Information Officer",
  "IT Director / Head of IT",
  "Head of Information Security",
  "Security Director",
  "VP, Information Security",
  "Security Manager",
];

const bant = [
  {
    key: "Budget",
    look: "Potential ability to allocate budget to the requirement.",
  },
  {
    key: "Authority",
    look: "Decision-making power or strong purchasing influence.",
  },
  {
    key: "Need",
    look: "An actual or credible cybersecurity requirement.",
  },
  {
    key: "Timeline",
    look: "A realistic evaluation or purchasing window.",
  },
];

const optimizationSignals = [
  "Response rates",
  "Positive replies",
  "Meetings booked",
  "Persona performance",
  "Industry performance",
  "Messaging performance",
  "Objections and rejection reasons",
];

const funnel = [
  { value: "3,800+", label: "Target companies researched" },
  { value: "9,500+", label: "Decision-makers identified" },
  { value: "6,800+", label: "Prospects contacted" },
  { value: "240+", label: "Positive conversations" },
  { value: "60", label: "Meetings" },
];

const results = [
  { value: "60", label: "Meetings" },
  { value: "6X", label: "Revenue generated" },
];

/** Meetings by decision-maker. Bar width is scaled to the top row (22). */
const decisionMix = [
  { role: "CISO / Chief Security Officer", meetings: 22, share: "37%" },
  { role: "CTO / CIO", meetings: 14, share: "23%" },
  { role: "IT Director / Head of IT", meetings: 11, share: "18%" },
  { role: "Head / Director of Security", meetings: 8, share: "13%" },
  { role: "Other senior security leaders", meetings: 5, share: "9%" },
];

/** Meetings by industry. Bar width is scaled to the highest row. */
const industryMix = [
  { industry: "BFSI / FinTech", meetings: 17 },
  { industry: "SaaS / Technology", meetings: 16 },
  { industry: "Manufacturing", meetings: 8 },
  { industry: "Healthcare", meetings: 7 },
  { industry: "IT Services", meetings: 7 },
  { industry: "Retail / E-commerce", meetings: 5 },
];
const industryMax = Math.max(...industryMix.map((r) => r.meetings));

const process = [
  {
    n: "01",
    title: "Identify the right accounts",
    body: "We started with accounts rather than individual contacts. Roughly 3,800 Indian companies were researched against the ICP. Priority went to organizations with meaningful digital infrastructure, IT and security teams, cloud or hybrid-cloud environments, and a realistic cybersecurity requirement.",
  },
  {
    n: "02",
    title: "Identify the right decision-makers",
    body: "From the target accounts, roughly 9,500 relevant decision-makers were identified. We prioritized people likely to influence security strategy, technology investment, implementation, or vendor selection.",
  },
  {
    n: "03",
    title: "Multi-channel outreach",
    body: "The campaign used LinkedIn, email, account research, and structured follow-ups. Outreach was adapted to the prospect's role, company context, and potential cybersecurity requirement rather than a single generic pitch. Across the campaign, roughly 15,500 outreach attempts reached 6,800+ prioritized prospects.",
  },
  {
    n: "04",
    title: "Qualification before the meeting",
    body: "A calendar booking was never the finish line. We used a BANT framework, Budget, Authority, Need, and Timeline, to raise the quality of every meeting handed to the sales team.",
  },
  {
    n: "05",
    title: "Continuous optimization",
    body: "Performance was reviewed throughout the campaign. Messaging, personas, industries, objections, and qualification criteria were refined based on responses and sales feedback.",
  },
];

const whyItWorked = [
  {
    title: "We focused on accounts, not databases.",
    body: "The campaign started with companies that matched the client's ICP rather than maximizing generic contact volume.",
  },
  {
    title: "We targeted decision-makers.",
    body: "Effort concentrated on CISOs, CTOs, CIOs, IT Directors and Security Leaders.",
  },
  {
    title: "We personalized the outreach.",
    body: "Messaging was adapted to the persona, company context, and potential cybersecurity requirement.",
  },
  {
    title: "We qualified before booking.",
    body: "The objective was qualified meetings, not simply a full calendar.",
  },
  {
    title: "We optimized continuously.",
    body: "Campaign data and sales feedback improved targeting, messaging, and qualification over time.",
  },
];

const revenue = [
  { closed: "3", value: "₹30 lakh" },
  { closed: "6", value: "₹60 lakh" },
  { closed: "9", value: "₹90 lakh" },
  { closed: "12", value: "₹1.2 crore" },
];

/** Icon set for the campaign-snapshot card rows — one per data point. */
function SnapshotIcon({ label }: { label: string }) {
  const shared = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "w-6 h-6",
    "aria-hidden": true,
  };

  switch (label) {
    case "Client":
      // Building — the client organization.
      return (
        <svg {...shared}>
          <rect x="6" y="3" width="12" height="18" rx="1.5" />
          <path d="M9.5 7h1M13.5 7h1M9.5 10.5h1M13.5 10.5h1M9.5 14h1M13.5 14h1" />
          <path d="M10.25 21v-3.5h3.5V21" />
        </svg>
      );
    case "Market":
      // Globe — the geography served.
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17" />
          <path d="M12 3.5c2.6 2.4 4 5.3 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.3-4-8.5s1.4-6.1 4-8.5z" />
        </svg>
      );
    case "Campaign duration":
      // Calendar — the timeframe.
      return (
        <svg {...shared}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 9.5h17" />
          <path d="M8 3v3.5M16 3v3.5" />
          <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01" />
        </svg>
      );
    case "Target audience":
    default:
      // People — the decision-makers reached.
      return (
        <svg {...shared}>
          <circle cx="9" cy="8.5" r="3" />
          <path d="M3.5 19c0-3 2.5-5.25 5.5-5.25S14.5 16 14.5 19" />
          <path d="M16 8.75a2.5 2.5 0 1 0-1.1-4.75" />
          <path d="M16.5 13.75c2.35.35 4 2.35 4 5.25" />
        </svg>
      );
  }
}

/** Icon set for the campaign-results cards matching reference design. */
function ResultIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      // Meetings booked - calendar outline with 6 dots and checkmark badge
      return (
        <div className="inline-flex items-center justify-center w-20 h-20">
          {/* Foreground SVG Icon */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-12 h-12 text-accent"
            aria-hidden
          >
            {/* Calendar Box */}
            <rect
              x="8"
              y="11"
              width="32"
              height="26"
              rx="4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Top Binder Pins */}
            <path
              d="M16 7v6M32 7v6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Top Separator Line */}
            <path
              d="M8 19h32"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Grid Dots: Row 1 */}
            <circle cx="15.5" cy="24.5" r="1.4" fill="currentColor" />
            <circle cx="24" cy="24.5" r="1.4" fill="currentColor" />
            <circle cx="32.5" cy="24.5" r="1.4" fill="currentColor" />
            {/* Grid Dots: Row 2 */}
            <circle cx="15.5" cy="30.5" r="1.4" fill="currentColor" />
            <circle cx="24" cy="30.5" r="1.4" fill="currentColor" />

            {/* Solid Checkmark Circle Badge */}
            <circle
              cx="34"
              cy="32.5"
              r="7.5"
              fill="currentColor"
            />
            <path
              d="M30.5 32.5l2.2 2.2 4.3-4.5"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      );
    case 1:
      // Average meetings / month - two person outline figures
      return (
        <div className="inline-flex items-center justify-center w-20 h-20">
          {/* Foreground SVG Icon */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-12 h-12 text-accent"
            aria-hidden
          >
            {/* Back Figure (Right) */}
            <circle
              cx="33"
              cy="18"
              r="4"
              stroke="currentColor"
              strokeWidth="2.3"
              fill="none"
            />
            <path
              d="M29.5 35c.4-3.5 2.8-6 6.5-6s6.1 2.5 6.5 6"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Front Figure (Left) */}
            <circle
              cx="19"
              cy="15"
              r="5.5"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M9 37c0-5.2 4.2-9.2 10-9.2s10 4 10 9.2"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      );
    case 2:
      // Meeting show rate - 3 rounded vertical bars with a curved upward arrow
      return (
        <div className="inline-flex items-center justify-center w-20 h-20">
          {/* Foreground SVG Icon */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-12 h-12 text-accent"
            aria-hidden
          >
            {/* Bar 1 */}
            <rect
              x="8"
              y="30"
              width="5.5"
              height="9"
              rx="1.5"
              fill="currentColor"
            />
            {/* Bar 2 */}
            <rect
              x="21.2"
              y="22"
              width="5.5"
              height="17"
              rx="1.5"
              fill="currentColor"
            />
            {/* Bar 3 */}
            <rect
              x="34.5"
              y="14"
              width="5.5"
              height="25"
              rx="1.5"
              fill="currentColor"
            />

            {/* Sweeping Curved Arrow */}
            <path
              d="M8.5 26.5 C15.5 20, 25 12.5, 38.5 7.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Arrowhead */}
            <path
              d="M32 7.5 H38.5 V14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      );
    case 3:
    default:
      // Meetings attended - concentric target with arrow entering bullseye
      return (
        <div className="inline-flex items-center justify-center w-20 h-20">
          {/* Foreground SVG Icon */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-12 h-12 text-accent"
            aria-hidden
          >
            {/* Outer Target Circle */}
            <circle
              cx="21"
              cy="27"
              r="13.5"
              stroke="currentColor"
              strokeWidth="2.3"
              fill="none"
            />
            {/* Middle Target Circle */}
            <circle
              cx="21"
              cy="27"
              r="8.2"
              stroke="currentColor"
              strokeWidth="2.3"
              fill="none"
            />
            {/* Center Bullseye Dot */}
            <circle
              cx="21"
              cy="27"
              r="2.8"
              fill="currentColor"
            />

            {/* Arrow Shaft */}
            <path
              d="M37.5 10.5 L24 24"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
            {/* Arrow Head */}
            <path
              d="M27 19.5 L22.5 25.5 L28.5 24"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Feather Fletchings */}
            <path
              d="M33.5 10 L37.5 6 M37 13.5 L41 9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
  }
}

/* ------------------------------------------------------------------ page -- */

export default function MeetingsCaseStudyPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/case-studies/${SLUG}`,
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
        name: "Case Studies",
        item: `${siteConfig.url}/case-studies`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "60 Sales-Qualified Meetings",
        item: `${siteConfig.url}/case-studies/${SLUG}`,
      },
    ],
  };

  return (
    <>
      {/* ------------------------------------------------------------ HERO */}
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-16 md:pb-24 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-6xl mx-auto px-6 md:px-12">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors"
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

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <div className="lg:col-span-8">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-white font-medium leading-[1.12] tracking-tight">
                How we delivered
                <br />
                <span className="font-serif text-accent font-normal text-6xl sm:text-7xl lg:text-[88px] leading-none align-middle">
                  6×
                </span>{" "}
                <span className="font-serif text-accent font-normal text-6xl sm:text-7xl lg:text-[88px] leading-none align-middle">
                  ROI
                </span>{" "}
                for a
                <br />
                cloud security company
                <br />
                in India.
              </h1>
            </div>

            {/* Anchor stat, the number that earns the click. */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="rounded-2xl border border-white/12 bg-white/[0.03] backdrop-blur-sm p-7">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">
                  Return on investment
                </span>
                <div className="mt-2 font-serif text-7xl md:text-8xl text-accent leading-none tracking-tight tabular-nums">
                  <CountUp value="6X" duration={2000} />
                </div>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  estimated return from a six-month program of qualified
                  meetings with senior security decision-makers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- SUMMARY + SNAPSHOT */}
      <section className="relative overflow-hidden pt-8 md:pt-10 pb-16 md:pb-20 bg-background-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">
          <Reveal className="lg:col-span-7">
            <p className="font-serif text-3xl md:text-4xl text-primary font-normal leading-snug tracking-tight">
              A B2B cloud security company
              <br />
              needed a{" "}
              <span className="text-accent font-medium">
                predictable pipeline
              </span>
              <br />
              of qualified sales conversations
              <br />
              in the Indian market.
            </p>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-5">
            <dl className="rounded-2xl border border-border bg-white shadow-[0_4px_24px_rgba(15,30,46,0.05)] p-7 md:p-9 divide-y divide-border">
              {snapshot.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start gap-5 py-6 first:pt-0 last:pb-0"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-primary/70 [&_svg]:w-7 [&_svg]:h-7"
                  >
                    <SnapshotIcon label={row.label} />
                  </span>
                  <div>
                    <dt className="text-xs font-mono uppercase tracking-widest text-text-muted">
                      {row.label}
                    </dt>
                    <dd className="mt-2 text-lg text-primary font-medium leading-snug">
                      {row.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------- HEADLINE METRIC BAND */}
      <section className="pt-6 md:pt-8 pb-16 md:pb-20 bg-background-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium leading-tight tracking-tight">
              Campaign snapshot
            </h2>
          </Reveal>
          <dl className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 border-t border-border pt-12">
            {headlineMetrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 80} className="flex flex-col">
                <dd className="order-1 font-serif italic text-5xl md:text-6xl font-normal text-primary leading-none tracking-tight tabular-nums">
                  <CountUp value={m.value} duration={1800} />
                </dd>
                <dt className="order-2 mt-3 text-sm text-text-muted font-normal leading-snug">
                  {m.label}
                </dt>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* --------------------------------------------------- THE CHALLENGE */}
      <section className="pt-8 md:pt-10 pb-16 md:pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14">
          <Reveal className="md:col-span-5">
            <p className="font-serif text-3xl md:text-4xl text-primary font-normal leading-[1.15] tracking-tight">
              The client did not need a bigger database. They needed{" "}
              <span className="italic text-accent">
                qualified conversations
              </span>{" "}
              with people who could actually buy.
            </p>
          </Reveal>
          <Reveal delay={100} className="md:col-span-7">
            <ul className="space-y-5 md:pt-2">
              {challengePoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 border-b border-border pb-5 last:border-0"
                >
                  <span className="font-mono text-xs text-accent pt-1 tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="text-base md:text-lg text-primary/85 font-normal leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------ POTENTIAL BUSINESS IMPACT */}
      <section
        data-nav-theme="dark"
        className="py-32 md:py-44 bg-primary text-white"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5">
            <p className="font-serif text-2xl md:text-3xl text-white font-normal leading-snug tracking-tight">
              At an average deal size of{" "}
              <span className="italic text-accent whitespace-nowrap">
                ₹10 lakh
              </span>
              , the pipeline compounds quickly.
            </p>
            <p className="mt-5 text-sm text-white/60 font-normal leading-relaxed max-w-md">
              The revenue impact depends on the client&apos;s actual conversion
              rate from meetings to closed customers. The figures below are
              illustrative and are not presented as revenue generated by the
              campaign.
            </p>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-7">
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-accent text-primary">
                    <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest font-semibold">
                      Closed customers
                    </th>
                    <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest font-semibold text-right">
                      Illustrative revenue at ₹10 lakh average deal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {revenue.map((row) => (
                    <tr key={row.closed} className="bg-white/[0.03]">
                      <td className="px-6 py-4 font-serif text-2xl text-white tabular-nums">
                        {row.closed}
                      </td>
                      <td className="px-6 py-4 text-right text-lg text-accent font-semibold tabular-nums">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------- POSITIONING QUOTE */}
      <section className="py-20 md:py-28 bg-background-soft">
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
              We don&apos;t just generate sales leads. We create
              <br />
              high-potential sales opportunities.
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </Reveal>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* ------------------------------------------------------- THE 5-STEP PROCESS */}
      <section className="pt-8 md:pt-10 pb-16 md:pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium leading-tight tracking-tight max-w-3xl">
              From a market of{" "}
              <span className="italic text-accent">3,800+</span> to{" "}
              <span className="italic text-accent">60</span> real
              conversations.
            </h2>
            <p className="mt-5 text-base md:text-lg text-text-muted font-normal leading-relaxed max-w-xl">
              Our five-step lead generation process, start to booked meeting.
            </p>
          </Reveal>

          <div className="mt-14 rounded-xl overflow-hidden border border-border">
            {process.map((step, i) => (
              <Reveal key={step.n} delay={i * 60}>
                <div className="bg-white grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 p-7 md:p-9">
                  <div className="md:col-span-3 flex items-baseline gap-4">
                    <span className="font-serif italic text-4xl md:text-5xl text-accent leading-none tabular-nums">
                      {step.n}
                    </span>
                    <span
                      aria-hidden
                      className="hidden md:block h-px flex-1 bg-border mt-6"
                    />
                  </div>
                  <div className="md:col-span-9">
                    <h3 className="font-serif text-xl md:text-2xl text-primary font-medium">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base text-primary/80 font-normal leading-relaxed max-w-2xl">
                      {step.body}
                    </p>

                    {/* Step 02: the roles we targeted. */}
                    {step.n === "02" && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {decisionRoles.map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center rounded-full border border-border bg-background-soft px-3 py-1.5 text-xs font-mono text-primary"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Step 04: the BANT gate. */}
                    {step.n === "04" && (
                      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {bant.map((b) => (
                          <div
                            key={b.key}
                            className="rounded-lg border border-border bg-background-soft p-4"
                          >
                            <p className="font-serif text-lg text-accent font-medium">
                              {b.key}
                            </p>
                            <p className="mt-1.5 text-xs text-primary/75 font-normal leading-relaxed">
                              {b.look}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step 05: what we watched. */}
                    {step.n === "05" && (
                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                        {optimizationSignals.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-2 text-xs text-primary/70 font-normal"
                          >
                            <span
                              aria-hidden
                              className="h-1 w-1 rounded-full bg-accent"
                            />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- THE FUNNEL */}
      <section
        data-nav-theme="dark"
        className="pt-8 md:pt-10 pb-16 md:pb-24 bg-primary text-white"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-medium leading-tight text-center max-w-2xl mx-auto">
              The lead generation funnel.
            </h2>
            <p className="mt-5 text-base md:text-lg text-white/60 font-normal leading-relaxed text-center max-w-xl mx-auto">
              Every stage narrows toward the only metric that mattered.
            </p>
          </Reveal>

          <div className="mt-14 max-w-4xl mx-auto">
            {funnel.map((stage, i) => {
              // Visual taper: honest ordering, readable proportions.
              const widths = [100, 88, 72, 40, 26];
              const isLast = i === funnel.length - 1;
              return (
                <div key={stage.label} className="flex flex-col items-center">
                  <Reveal delay={i * 90} className="w-full">
                    <div
                      className={`w-full mx-auto min-w-[140px] rounded-xl border px-6 py-6 md:py-7 text-center transition-colors ${
                        isLast
                          ? "border-accent bg-accent text-primary"
                          : "border-white/12 bg-white/[0.03]"
                      }`}
                      style={{ maxWidth: `${widths[i]}%` }}
                    >
                      <div
                        className={`font-serif italic text-4xl md:text-5xl leading-none tabular-nums ${
                          isLast ? "text-primary" : "text-accent"
                        }`}
                      >
                        <CountUp value={stage.value} duration={1600} />
                      </div>
                      <p
                        className={`mt-2 text-sm font-normal ${
                          isLast ? "text-primary/80" : "text-white/70"
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>
                  </Reveal>
                  {!isLast && (
                    // Own Reveal instance - triggers on its own scroll
                    // position instead of riding in on the card above.
                    <Reveal
                      variant="up"
                      distance={14}
                      duration={550}
                      className="my-2.5"
                    >
                      <div
                        aria-hidden
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span className="funnel-dots h-8 w-0.5" />
                        <svg
                          className="w-4 h-4 text-white/60"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v14m0 0l6-6m-6 6l-6-6"
                          />
                        </svg>
                      </div>
                    </Reveal>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------ CAMPAIGN RESULTS */}
      <section className="relative isolate overflow-hidden pt-10 md:pt-12 pb-16 md:pb-24 bg-[#FAF8F5]">
        {/* Section watermark — recreated exactly from reference design:
            circular frame with gaps, rising trendline arrow, and twin 4-point sparkle stars. */}
        <div
          aria-hidden
          className="hidden md:block pointer-events-none select-none absolute right-0 lg:right-6 top-1/2 -translate-y-1/2 z-0"
        >
          <svg
            className="w-[220px] h-[220px] lg:w-[290px] lg:h-[290px] text-[#F5ECE3]"
            viewBox="0 0 200 200"
            fill="none"
          >
            {/* Top ring arc (gap at top-right and bottom-left) */}
            <path
              d="M 155.8 49.8 A 75 75 0 1 0 60.3 163.6"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Bottom ring arc (gap at bottom-left and top-right) */}
            <path
              d="M 32 131.7 A 75 75 0 1 1 173.8 87"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Rising trend line */}
            <path
              d="M 35 160 L 85 110 L 105 130 L 152 72"
              stroke="currentColor"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Clean Arrowhead without stroke artifacts */}
            <path
              d="M 175 44 L 138 64 L 148 76 L 160 84 Z"
              fill="currentColor"
            />

          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
          <Reveal>
            <h2 className="font-sans text-3xl md:text-4xl text-[#0F172A] font-medium leading-tight tracking-tight">
              The numbers
              <br />
              tell the story.
            </h2>
          </Reveal>

          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-8 sm:gap-16">
            {/* Card 1 — Meetings attended, trailed by a scatter of dots. */}
            <Reveal delay={0}>
              <div className="relative isolate overflow-hidden pt-6 border-t border-[#E7E1D8]">
                <div
                  aria-hidden
                  className="absolute -z-10 bottom-0 right-0 w-28 h-24"
                  style={{
                    backgroundImage:
                      "radial-gradient(var(--accent) 2px, transparent 2px)",
                    backgroundSize: "14px 14px",
                    maskImage:
                      "radial-gradient(circle at 100% 100%, black 0%, transparent 70%)",
                    WebkitMaskImage:
                      "radial-gradient(circle at 100% 100%, black 0%, transparent 70%)",
                  }}
                />
                <dd className="font-sans text-6xl font-bold text-[#0F172A] leading-none tracking-tight tabular-nums">
                  <CountUp value={results[0].value} duration={1700} />
                </dd>
                <dt className="mt-4 max-w-[9rem] text-base text-[#475569] font-normal leading-snug">
                  {results[0].label}
                </dt>
              </div>
            </Reveal>

            {/* Card 2 — Revenue generated, trailed by a rising spark-line. */}
            <Reveal delay={80}>
              <div className="relative isolate overflow-hidden pt-6 border-t border-[#E7E1D8]">
                <svg
                  aria-hidden
                  className="absolute -z-10 bottom-0 right-0 w-32 h-20"
                  viewBox="0 0 140 90"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="revenueSparkFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Faint vertical guides beneath the curve. */}
                  <path
                    d="M24 90 V40 M52 90 V32 M80 90 V24 M108 90 V16"
                    stroke="var(--accent)"
                    strokeOpacity="0.15"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <path
                    d="M4 82 C 40 78, 78 60, 104 30 S 128 10, 132 9 V90 H4 Z"
                    fill="url(#revenueSparkFill)"
                  />
                  <path
                    d="M4 82 C 40 78, 78 60, 104 30 S 128 10, 132 9"
                    stroke="var(--accent)"
                    strokeOpacity="0.7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="132" cy="9" r="8" fill="var(--accent)" fillOpacity="0.2" />
                  <circle cx="132" cy="9" r="4" fill="var(--accent)" />
                </svg>
                <dd className="font-sans text-6xl font-bold text-[#0F172A] leading-none tracking-tight tabular-nums">
                  <CountUp value={results[1].value} duration={1700} />
                </dd>
                <dt className="mt-4 max-w-[9rem] text-base text-[#475569] font-normal leading-snug">
                  {results[1].label}
                </dt>
              </div>
            </Reveal>
          </dl>
        </div>
      </section>

      {/* --------------------------------------- WHO WE BOOKED MEETINGS WITH */}
      <section className="pt-8 md:pt-10 pb-16 md:pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_auto] gap-x-12 lg:gap-x-16 gap-y-10">
          <div className="lg:col-span-6 lg:row-start-1">
            <Reveal>
              <p className="font-serif text-2xl md:text-3xl text-primary font-normal leading-snug tracking-tight">
                78% of meetings were with{" "}
                <span className="italic text-accent">
                  C-level
                </span>{" "}
                decision-makers.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:row-start-2">
            <Reveal delay={120}>
              <ul className="space-y-6">
                {decisionMix.map((row, i) => (
                  <li key={row.role}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm md:text-base text-primary font-normal">
                        {row.role}
                      </span>
                      <span className="text-sm font-mono text-text-muted tabular-nums shrink-0">
                        {row.meetings}
                        <span className="text-primary/30"> / </span>
                        {row.share}
                      </span>
                    </div>
                    <CaseStudyBar
                      className="mt-2.5"
                      percent={(row.meetings / 22) * 100}
                      delay={i * 90}
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
            <Reveal delay={80}>
              <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium leading-snug tracking-tight">
                Industry breakdown
              </h3>
              <p className="mt-5 text-base text-primary/75 font-normal leading-relaxed max-w-md">
                The sixty meetings spread across the sectors where cybersecurity
                budgets and buying intent concentrate.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:row-start-2">
            <Reveal delay={160}>
              <ul className="space-y-6">
                {industryMix.map((row, i) => (
                  <li key={row.industry}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm md:text-base text-primary font-normal">
                        {row.industry}
                      </span>
                      <span className="text-sm font-mono text-text-muted tabular-nums shrink-0">
                        {row.meetings}
                      </span>
                    </div>
                    <CaseStudyBar
                      className="mt-2.5"
                      percent={(row.meetings / industryMax) * 100}
                      delay={i * 70}
                      tone="primary"
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------- POSITIONING QUOTE */}
      <section className="relative isolate overflow-hidden py-20 md:py-28 bg-background-soft">
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
              We don&apos;t just generate sales leads. We create
              <br />
              high-potential sales opportunities.
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------- DISABLED: sticky sidebar layout */}
      {false && (
      <section className="py-14 md:py-20 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ---------------------------------------- PERSISTENT SIDEBAR */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl bg-white border border-border p-6">
              <Reveal>
                <div className="relative aspect-[4/5] w-32 sm:w-40 overflow-hidden rounded-xl border border-border">
                  <Image
                    src="/siddique.webp"
                    alt="Siddique Ahmed"
                    fill
                    sizes="(min-width: 1024px) 10rem, 8rem"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <Reveal delay={100}>
                <svg
                  aria-hidden
                  className="w-6 h-6 text-accent mt-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.5 4C6.5 6 5 9 5 13v7h7v-8H8.5c0-2.5 1-4.5 3-6L9.5 4zm9 0c-3 2-4.5 5-4.5 9v7h7v-8h-3.5c0-2.5 1-4.5 3-6L18.5 4z" />
                </svg>
                <blockquote className="mt-4 font-serif italic text-lg md:text-xl text-primary font-medium leading-[1.3] tracking-tight">
                  We don&apos;t just generate sales leads. We create
                  <br />
                  high-potential sales opportunities.
                </blockquote>
                <div className="mt-5">
                  <p className="font-serif text-base text-primary font-medium leading-tight">
                    Siddique Ahmed
                  </p>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-text-muted">
                    Fynix Digital
                  </p>
                </div>
                <a
                  href="https://calendly.com/siddique-fynix/business-introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
                >
                  Let&apos;s book a call
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </Reveal>
            </div>
          </div>

          {/* ------------------------------------------------- BODY CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            {/* --------------------------------------- SUMMARY + SNAPSHOT */}
            <div className="rounded-2xl bg-white border border-border p-7 md:p-10">
              <Reveal>
                <p className="font-serif text-2xl md:text-[28px] text-primary font-normal leading-snug tracking-tight">
                  The client was a B2B cybersecurity company that wanted a{" "}
                  <span className="text-accent font-medium">
                    predictable pipeline
                  </span>{" "}
                  of qualified sales conversations in the Indian market.
                </p>
              </Reveal>

              <Reveal delay={100}>
                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-8">
                  {snapshot.map((row) => (
                    <div key={row.label}>
                      <dt className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                        {row.label}
                      </dt>
                      <dd className="mt-1.5 text-sm text-primary/90 font-normal leading-snug">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            {/* ---------------------------------------- HEADLINE METRIC BAND */}
            <div className="rounded-2xl bg-white border border-border p-7 md:p-10">
              <Reveal>
                <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium leading-tight tracking-tight">
                  Campaign snapshot
                </h2>
              </Reveal>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-8">
                {headlineMetrics.map((m, i) => (
                  <Reveal
                    key={m.label}
                    delay={i * 80}
                    className="flex flex-col"
                  >
                    <dd className="order-1 font-serif italic text-4xl md:text-5xl font-normal text-primary leading-none tracking-tight tabular-nums">
                      <CountUp value={m.value} duration={1800} />
                    </dd>
                    <dt className="order-2 mt-3 text-sm text-text-muted font-normal leading-snug">
                      {m.label}
                    </dt>
                  </Reveal>
                ))}
              </dl>
            </div>

            {/* --------------------------------------------- THE CHALLENGE */}
            <div className="rounded-2xl bg-white border border-border p-7 md:p-10">
              <Reveal>
                <p className="font-serif text-2xl md:text-3xl text-primary font-normal leading-[1.15] tracking-tight">
                  The client did not need a bigger database. They needed{" "}
                  <span className="italic text-accent">
                    qualified conversations
                  </span>{" "}
                  with people who could actually buy.
                </p>
              </Reveal>
              <Reveal delay={100}>
                <ul className="mt-8 space-y-5">
                  {challengePoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 border-b border-border pb-5 last:border-0"
                    >
                      <span className="font-mono text-xs text-accent-strong pt-1 tabular-nums">
                        0{i + 1}
                      </span>
                      <span className="text-base text-primary/85 font-normal leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* ------------------------------------ POTENTIAL BUSINESS IMPACT */}
            <div
              data-nav-theme="dark"
              className="rounded-2xl bg-primary text-white p-7 md:p-10"
            >
              <Reveal>
                <p className="font-serif text-xl md:text-2xl text-white font-normal leading-snug tracking-tight">
                  At an average deal size of{" "}
                  <span className="italic text-accent whitespace-nowrap">
                    ₹10 lakh
                  </span>
                  , the pipeline compounds quickly.
                </p>
                <p className="mt-4 text-sm text-white/60 font-normal leading-relaxed">
                  The revenue impact depends on the client&apos;s actual
                  conversion rate from meetings to closed customers. The
                  figures below are illustrative and are not presented as
                  revenue generated by the campaign.
                </p>
              </Reveal>

              <Reveal delay={100}>
                <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-accent text-primary">
                        <th className="px-5 py-3.5 text-[10px] font-mono uppercase tracking-widest font-semibold">
                          Closed customers
                        </th>
                        <th className="px-5 py-3.5 text-[10px] font-mono uppercase tracking-widest font-semibold text-right">
                          Illustrative revenue at ₹10 lakh average deal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {revenue.map((row) => (
                        <tr key={row.closed} className="bg-white/[0.03]">
                          <td className="px-5 py-3.5 font-serif text-xl text-white tabular-nums">
                            {row.closed}
                          </td>
                          <td className="px-5 py-3.5 text-right text-base text-accent font-semibold tabular-nums">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            </div>

            {/* ---------------------------------------- THE 5-STEP PROCESS */}
            <div className="rounded-2xl bg-white border border-border p-7 md:p-10">
              <Reveal>
                <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium leading-tight tracking-tight">
                  From a market of thousands to sixty real conversations.
                </h2>
                <p className="mt-4 text-base text-text-muted font-normal leading-relaxed">
                  Our five-step lead generation process, start to booked
                  meeting.
                </p>
              </Reveal>

              <div className="mt-10 divide-y divide-border rounded-xl overflow-hidden border border-border">
                {process.map((step, i) => (
                  <Reveal key={step.n} delay={i * 60}>
                    <div className="bg-white grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 p-6 md:p-7">
                      <div className="sm:col-span-3 flex items-baseline gap-4">
                        <span className="font-serif italic text-3xl md:text-4xl text-accent leading-none tabular-nums">
                          {step.n}
                        </span>
                        <span
                          aria-hidden
                          className="hidden sm:block h-px flex-1 bg-border mt-5"
                        />
                      </div>
                      <div className="sm:col-span-9">
                        <h3 className="font-serif text-lg md:text-xl text-primary font-medium">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-sm md:text-base text-primary/80 font-normal leading-relaxed">
                          {step.body}
                        </p>

                        {/* Step 02: the roles we targeted. */}
                        {step.n === "02" && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {decisionRoles.map((r) => (
                              <span
                                key={r}
                                className="inline-flex items-center rounded-full border border-border bg-background-soft px-3 py-1.5 text-xs font-mono text-primary"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Step 04: the BANT gate. */}
                        {step.n === "04" && (
                          <div className="mt-6 grid grid-cols-2 gap-3">
                            {bant.map((b) => (
                              <div
                                key={b.key}
                                className="rounded-lg border border-border bg-background-soft p-4"
                              >
                                <p className="font-serif text-lg text-accent-strong font-medium">
                                  {b.key}
                                </p>
                                <p className="mt-1.5 text-xs text-primary/75 font-normal leading-relaxed">
                                  {b.look}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Step 05: what we watched. */}
                        {step.n === "05" && (
                          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                            {optimizationSignals.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-2 text-xs text-primary/70 font-normal"
                              >
                                <span
                                  aria-hidden
                                  className="h-1 w-1 rounded-full bg-accent"
                                />
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* --------------------------------------------------- THE FUNNEL */}
            <div
              data-nav-theme="dark"
              className="rounded-2xl bg-primary text-white p-7 md:p-10"
            >
              <Reveal>
                <h2 className="font-serif text-2xl md:text-3xl text-white font-medium leading-tight">
                  The lead generation funnel.
                </h2>
                <p className="mt-4 text-base text-white/60 font-normal leading-relaxed">
                  Every stage narrows toward the only metric that mattered.
                </p>
              </Reveal>

              <div className="mt-10 max-w-md mx-auto">
                {funnel.map((stage, i) => {
                  // Visual taper: honest ordering, readable proportions.
                  const widths = [100, 88, 72, 40, 26];
                  const isLast = i === funnel.length - 1;
                  return (
                    <div
                      key={stage.label}
                      className="flex flex-col items-center"
                    >
                      <Reveal delay={i * 90} className="w-full">
                        <div
                          className={`w-full mx-auto min-w-[140px] rounded-xl border px-6 py-5 md:py-6 text-center transition-colors ${
                            isLast
                              ? "border-accent bg-accent text-primary"
                              : "border-white/12 bg-white/[0.03]"
                          }`}
                          style={{ maxWidth: `${widths[i]}%` }}
                        >
                          <div
                            className={`font-serif italic text-3xl md:text-4xl leading-none tabular-nums ${
                              isLast ? "text-primary" : "text-accent"
                            }`}
                          >
                            <CountUp value={stage.value} duration={1600} />
                          </div>
                          <p
                            className={`mt-2 text-sm font-normal ${
                              isLast ? "text-primary/80" : "text-white/70"
                            }`}
                          >
                            {stage.label}
                          </p>
                        </div>
                      </Reveal>
                      {!isLast && (
                        // Own Reveal instance - triggers on its own scroll
                        // position instead of riding in on the card above.
                        <Reveal
                          variant="up"
                          distance={14}
                          duration={550}
                          className="my-2"
                        >
                          <div
                            aria-hidden
                            className="flex flex-col items-center gap-1.5"
                          >
                            <span className="funnel-dots h-7 w-0.5" />
                            <svg
                              className="funnel-arrow w-4 h-4 text-white/60"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v14m0 0l6-6m-6 6l-6-6"
                              />
                            </svg>
                          </div>
                        </Reveal>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ---------------------------------------------- CAMPAIGN RESULTS */}
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#F0EBE6] p-7 md:p-10">
              <Reveal>
                <h2 className="font-sans text-2xl md:text-3xl text-[#0F172A] font-medium leading-tight tracking-tight">
                  Campaign results
                </h2>
              </Reveal>
              <dl className="mt-8 grid grid-cols-2 gap-4">
                {results.map((r, i) => (
                  <Reveal key={r.label} delay={i * 80}>
                    <div className="rounded-2xl border border-[#F0EBE6] bg-white py-7 px-4 h-full flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <ResultIcon index={i} />
                      <dd className="mt-4 font-sans text-4xl md:text-5xl font-medium text-[#0F172A] leading-none tracking-tight tabular-nums">
                        <CountUp value={r.value} duration={1700} />
                      </dd>
                      <dt className="mt-3 text-xs md:text-sm text-[#475569] font-normal leading-snug">
                        {r.label}
                      </dt>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>

            {/* ----------------------------------- WHO WE BOOKED MEETINGS WITH */}
            <div className="rounded-2xl bg-white border border-border p-7 md:p-10">
              <Reveal>
                <p className="font-serif text-xl md:text-2xl text-primary font-normal leading-snug tracking-tight">
                  78% of meetings were with{" "}
                  <span className="italic text-accent">
                    C-level or Director-level
                  </span>{" "}
                  decision-makers.
                </p>
              </Reveal>

              <Reveal delay={80}>
                <ul className="mt-8 space-y-6">
                  {decisionMix.map((row, i) => (
                    <li key={row.role}>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-primary font-normal">
                          {row.role}
                        </span>
                        <span className="text-sm font-mono text-text-muted tabular-nums shrink-0">
                          {row.meetings}
                          <span className="text-primary/30"> / </span>
                          {row.share}
                        </span>
                      </div>
                      <CaseStudyBar
                        className="mt-2.5"
                        percent={(row.meetings / 22) * 100}
                        delay={i * 90}
                      />
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120}>
                <h3 className="mt-12 font-serif text-xl md:text-2xl text-primary font-medium leading-snug tracking-tight">
                  Industry breakdown
                </h3>
                <p className="mt-4 text-sm md:text-base text-primary/75 font-normal leading-relaxed">
                  The sixty meetings spread across the sectors where
                  cybersecurity budgets and buying intent concentrate.
                </p>
              </Reveal>

              <Reveal delay={160}>
                <ul className="mt-8 space-y-6">
                  {industryMix.map((row, i) => (
                    <li key={row.industry}>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-primary font-normal">
                          {row.industry}
                        </span>
                        <span className="text-sm font-mono text-text-muted tabular-nums shrink-0">
                          {row.meetings}
                        </span>
                      </div>
                      <CaseStudyBar
                        className="mt-2.5"
                        percent={(row.meetings / industryMax) * 100}
                        delay={i * 70}
                        tone="primary"
                      />
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* ---------------------------------------------- WHY IT WORKED */}
            <div className="rounded-2xl bg-white border border-border p-7 md:p-10">
              <Reveal>
                <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium leading-tight tracking-tight">
                  Why the campaign worked
                </h2>
              </Reveal>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {whyItWorked.map((item, i) => (
                  <Reveal key={item.title} delay={i * 70}>
                    <div className="h-full rounded-xl border border-border bg-background-soft p-6">
                      <span className="font-mono text-xs text-accent-strong tabular-nums">
                        0{i + 1}
                      </span>
                      <h3 className="mt-4 font-serif text-lg text-primary font-medium leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm text-primary/75 font-normal leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
