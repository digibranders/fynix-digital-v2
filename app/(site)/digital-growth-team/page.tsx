import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import DeparturesBoard from "@/components/digital-growth-team/DeparturesBoard";
import CardStack from "@/components/free-business-website/CardStack";
import { Arrow, PRIMARY_BUTTON, PRIMARY_BUTTON_ON_DARK } from "@/components/free-business-website/FreeWebsitePage";
import PlanCard from "@/components/free-business-website/PlanCard";
import FounderQuote from "@/components/FounderQuote";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import Reveal from "@/components/Reveal";
import SectionSeam from "@/components/SectionSeam";
import { siteConfig } from "@/lib/content";
import { DIGITAL_GROWTH_TEAM_CTA, DIGITAL_GROWTH_TEAM_PATH, digitalGrowthTeamContent } from "@/lib/digital-growth-team";

const { meta, hero, compare, quote, board } = digitalGrowthTeamContent;

/** The share card: the hero heading, with GROWTH TEAM in split-flap tiles. */
const SHARE_IMAGE = {
  url: `${siteConfig.url}${DIGITAL_GROWTH_TEAM_PATH}/og-card.png`,
  width: 1200,
  height: 630,
  alt: "Your Outsourced Digital Growth Team. Fynix Digital",
} as const;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: DIGITAL_GROWTH_TEAM_PATH },
  openGraph: {
    title: `${meta.title} | ${siteConfig.name}`,
    description: meta.description,
    url: `${siteConfig.url}${DIGITAL_GROWTH_TEAM_PATH}`,
    siteName: siteConfig.name,
    type: "website",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${meta.title} | ${siteConfig.name}`,
    description: meta.description,
    images: [SHARE_IMAGE.url],
  },
};

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
    { "@type": "ListItem", position: 2, name: meta.title, item: `${siteConfig.url}${DIGITAL_GROWTH_TEAM_PATH}` },
  ],
};

export default function DigitalGrowthTeamPage(): ReactElement {
  return (
    <>
      <section
        data-nav-theme="dark"
        className="relative isolate -mt-20 overflow-hidden bg-primary pt-28 pb-12 text-white md:-mt-24 md:pt-40 md:pb-20"
      >
        <HeroDarkBackdrop />
        <div className="relative mx-auto grid max-w-7xl gap-x-12 gap-y-8 px-6 md:gap-y-12 md:px-12 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] xl:items-center">
          <div>
            <h1 className="font-serif text-[32px] leading-tight font-medium text-balance sm:text-5xl lg:text-[64px] lg:leading-[1.25]">
              {hero.title} <span className="block font-serif text-[#e9af88] italic">{hero.accent}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-normal text-white/70 md:mt-6 md:text-lg md:leading-relaxed">{hero.lede}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <Link href={DIGITAL_GROWTH_TEAM_CTA.href} className={`${PRIMARY_BUTTON_ON_DARK} max-sm:px-6 max-sm:py-3 max-sm:text-[15px]`}>
                {DIGITAL_GROWTH_TEAM_CTA.label}
                <Arrow />
              </Link>
            </div>
          </div>

          <Reveal variant="right" className="xl:justify-self-end">
            <DeparturesBoard rows={board.rows} columns={board.columns} note={board.note} summary={board.summary} />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="team-title" className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <Reveal className="max-w-3xl">
            <h2 id="team-title" className="font-serif text-4xl leading-tight font-medium text-primary md:text-5xl">
              {compare.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">{compare.lede}</p>
          </Reveal>

          {/* Every card stacks as the add-ons do on the free website page: each sticks under the site header and the next slides over it. */}
          <CardStack className="relative mt-10 -mb-[calc(120vh+48px)] grid gap-6">
            {compare.cards.map((card, index) => (
              <PlanCard key={card.name} card={card} stackIndex={index} />
            ))}
          </CardStack>

          <Reveal className="mt-10 flex flex-wrap gap-4">
            <Link href={DIGITAL_GROWTH_TEAM_CTA.href} className={PRIMARY_BUTTON}>
              {DIGITAL_GROWTH_TEAM_CTA.label}
              <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      <FounderQuote quote={quote} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    </>
  );
}
