import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import BeforeAfter from "@/components/free-business-website/BeforeAfter";
import FaqAccordion from "@/components/FaqAccordion";
import CardStack from "@/components/free-business-website/CardStack";
import MarketSwitch from "@/components/free-business-website/MarketSwitch";
import PlanCard from "@/components/free-business-website/PlanCard";
import { StackArt } from "@/components/free-business-website/StackArt";
import WhatsAppButton from "@/components/free-business-website/WhatsAppButton";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import Reveal from "@/components/Reveal";
import SectionSeam from "@/components/SectionSeam";
import { siteConfig } from "@/lib/content";
import { FREE_WEBSITE_CONTENT, MARKET_PATHS, type Market, signUpUrl } from "@/lib/free-business-website";

/** The share card both markets use: "Get Your Business Website for FREE" with FREE in split-flap tiles. */
const SHARE_IMAGE = {
  // Bump the version when the image changes: WhatsApp and LinkedIn cache previews by image URL.
  url: `${siteConfig.url}/free-business-website/og-card.png?v=2`,
  width: 1200,
  height: 630,
  alt: "Get your business website for free. Built for you. Live 24/7. Fynix Digital",
} as const;

/**
 * The page's metadata for one market. Each market's page names the other as its alternate, so search engines show
 * Indian searchers the rupee page and US searchers the dollar page; the US page stands in for every other country.
 */
export function freeWebsiteMetadata(market: Market): Metadata {
  const { meta } = FREE_WEBSITE_CONTENT[market];
  const path = MARKET_PATHS[market];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: path,
      languages: { "en-IN": MARKET_PATHS.in, "en-US": MARKET_PATHS.us, "x-default": MARKET_PATHS.us },
    },
    openGraph: {
      title: `${meta.title} | ${siteConfig.name}`,
      description: meta.description,
      url: `${siteConfig.url}${path}`,
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
}

export const PRIMARY_BUTTON_ON_DARK =
  "inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 font-medium text-primary shadow-sm transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * The "Our work" band: a light wash of the brand peach that fades in from the soft section above and out to the white
 * one below over a long, eased run, so there is no visible edge and no separate strip between sections.
 */
const PEACH = "color-mix(in srgb, var(--accent) 22%, var(--background))";
const WORK_BACKGROUND = {
  background: [
    "linear-gradient(to bottom",
    "var(--background-soft) 0",
    `color-mix(in srgb, ${PEACH} 12%, var(--background-soft)) 40px`,
    `color-mix(in srgb, ${PEACH} 45%, var(--background-soft)) 90px`,
    `${PEACH} 150px`,
    `${PEACH} calc(100% - 150px)`,
    `color-mix(in srgb, ${PEACH} 45%, var(--background)) calc(100% - 90px)`,
    `color-mix(in srgb, ${PEACH} 12%, var(--background)) calc(100% - 40px)`,
    "var(--background) 100%)",
  ].join(", "),
} as const;

export function Arrow(): ReactElement {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** A tick in a ring: one thing the plan includes. */
function Tick({ className = "text-accent" }: { readonly className?: string }): ReactElement {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={`mt-0.5 size-5 shrink-0 ${className}`} fill="none">
      <circle cx="10" cy="10" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.4l2.6 2.6L14 7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The free business website page, in one market's prices. */
export default function FreeWebsitePage({ market }: { readonly market: Market }): ReactElement {
  const page = FREE_WEBSITE_CONTENT[market];
  const path = MARKET_PATHS[market];
  const careUrl = signUpUrl("care");
  const hero = page.hero;
  const featured = page.work.sites[0];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Free business website", item: `${siteConfig.url}${path}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.items.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a.replaceAll("**", "") },
        })),
      },
    ],
  };

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        className="relative isolate -mt-20 overflow-hidden bg-primary pt-28 pb-12 text-white md:-mt-24 md:pt-40 md:pb-20"
      >
        <HeroDarkBackdrop />
        {/* From 1280px the words stand on the left and the slider beside them, level with the headline; below that the slider follows them. */}
        <div className="relative mx-auto grid max-w-7xl gap-x-12 gap-y-8 px-6 md:gap-y-12 md:px-12 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] xl:items-start">
          <div>
            {/* The site's own heading size (64px from lg, as on every Fynix page), two lines, a few words. */}
            <h1 className="font-serif text-[32px] leading-tight font-medium text-balance sm:text-5xl lg:text-[64px] lg:leading-[1.25]">
              {hero.title} <span className="block font-serif text-[#e9af88] italic">{hero.accent}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-normal text-white/70 md:mt-6 md:text-lg md:leading-relaxed">{hero.lede}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <a href={careUrl} className={`${PRIMARY_BUTTON_ON_DARK} max-sm:px-6 max-sm:py-3 max-sm:text-[15px]`}>
                {hero.primaryCta}
                <Arrow />
              </a>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-xs text-white/70 sm:gap-x-7 sm:text-[15px] md:mt-8">
              {hero.assurances.map((item) => (
                <li key={item} className="flex items-center gap-1.5 sm:gap-2">
                  <svg aria-hidden viewBox="0 0 20 20" className="size-3.5 text-accent sm:size-4" fill="none">
                    <path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {featured ? (
            <Reveal variant="right" className="xl:mt-3">
              <BeforeAfter image={featured.image} host={new URL(featured.url).hostname.replace(/^www\./, "")} />
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* ─── PLAN ─────────────────────────────────────────────── */}
      {/* The deal comes first, in one card: the build costs nothing, the monthly plan keeps it running, and every other cost
          sits at the card's foot. The add-ons follow it. */}
      <section id="compare" aria-labelledby="compare-title" className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <Reveal className="max-w-3xl">
            <h2 id="compare-title" className="font-serif text-4xl leading-tight font-medium text-balance text-primary md:text-5xl">
              {page.ticket.title}{" "}
              <span className="font-serif text-accent-strong italic md:block">{page.ticket.accent}</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">{page.ticket.lede}</p>
          </Reveal>

          {/* Desktop: the build column on the left with the button under it, the monthly plan on the right. On a phone the button
              moves to the end of the card, so the monthly price is read before it. */}
          <Reveal className="mt-10">
            <div className="grid overflow-hidden rounded-xl bg-primary text-white shadow-[0_28px_36px_-24px_rgba(12,30,46,0.45)] lg:grid-cols-[21.5rem_minmax(0,1fr)] lg:grid-rows-[1fr_auto]">
              <div className="grid content-start gap-6 border-b border-dashed border-white/30 p-7 sm:p-9 lg:border-r lg:border-b-0 lg:pb-7">
                <p className="font-mono text-xs tracking-widest text-white/70 uppercase">{page.ticket.build.label}</p>
                <div className="grid gap-2">
                  <p className="font-serif text-6xl leading-none font-medium tracking-tight text-accent tabular-nums">
                    {page.ticket.build.price}
                  </p>
                  <p className="font-mono text-xs tracking-widest text-white/70 uppercase">{page.ticket.build.priceLine}</p>
                  <p className="text-[15px] leading-snug text-white/80">{page.ticket.build.note}</p>
                </div>
                <ul className="grid gap-3">
                  {page.ticket.build.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-base leading-snug">
                      <Tick />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid content-start gap-6 p-7 sm:p-9 lg:row-span-2">
                <h3 className="font-mono text-xs tracking-widest text-white/70 uppercase">{page.ticket.care.label}</h3>
                <div className="grid gap-2">
                  <p className="font-serif text-6xl leading-none font-medium tracking-tight tabular-nums">{page.ticket.care.price}</p>
                  <p className="font-mono text-xs tracking-widest text-white/70 uppercase">{page.ticket.care.priceLine}</p>
                  <p className="text-[15px] leading-snug text-white/80">{page.ticket.care.note}</p>
                </div>
                {/* Two columns sized to their words, so no benefit wraps. */}
                <ul className="grid gap-x-6 gap-y-3.5 border-t border-white/10 pt-6 sm:grid-cols-[max-content_max-content] sm:justify-between">
                  {page.ticket.care.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-base leading-snug">
                      <Tick />
                      {benefit}
                    </li>
                  ))}
                </ul>
                {/* The two costs the plan does not include: labelled, not ticked, so they never read as included. */}
                <dl className="grid gap-2.5 rounded-xl bg-white/[0.06] px-5 py-4 text-[15px] leading-snug">
                  <div className="flex items-baseline gap-4">
                    <dt className="w-16 shrink-0 text-[11px] font-semibold tracking-widest text-accent uppercase">Extra</dt>
                    <dd className="text-white/85">{page.ticket.extra}</dd>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <dt className="w-16 shrink-0 text-[11px] font-semibold tracking-widest text-accent uppercase">Domain</dt>
                    <dd className="text-white/85">{page.ticket.domain}</dd>
                  </div>
                </dl>
              </div>

              <div className="px-7 pb-7 sm:px-9 sm:pb-9 lg:col-start-1 lg:row-start-2 lg:border-r lg:border-dashed lg:border-white/30">
                <a href={careUrl} className={`${PRIMARY_BUTTON_ON_DARK} w-full sm:w-auto`}>
                  {page.ticket.care.cta}
                  <Arrow />
                </a>
              </div>
            </div>
          </Reveal>

          {/* The add-ons stack as the services page does: the heading and each card stick under the site header, and the next card slides
              over the last, so the heading and each card's title strip stay in view while the stack scrolls. The first card in the
              content is the website plan itself, which the card above already covers, so the stack starts at the second. */}
          <CardStack className="relative mt-14 -mb-[calc(120vh+48px)] grid gap-6 [--stack-head:64px]">
            {/* The heading rides on top of the first card, so it leaves with the stack when the stack scrolls away. */}
            <div data-stack-item className="z-10 grid gap-0 md:sticky md:top-20">
              <h3 className="flex h-16 items-center bg-background text-[26px] leading-tight font-semibold text-primary sm:text-[30px]">
                <span>
                  {page.compare.addonsIntro.title}{" "}
                  <span className="font-serif text-[32px] font-medium text-accent-strong italic sm:text-[38px]">{page.compare.addonsIntro.accent}</span>
                </span>
              </h3>
              <PlanCard card={page.compare.cards[1]} priceLine={page.compare.priceLine} />
            </div>
            {page.compare.cards.slice(2).map((card, index) => (
              <PlanCard key={card.name} card={card} priceLine={page.compare.priceLine} stackIndex={index + 1} />
            ))}
          </CardStack>

          <Reveal className="mt-10 flex flex-wrap gap-4">
            <a href={careUrl} className={PRIMARY_BUTTON}>
              {page.compare.careCta}
              <Arrow />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ─── JOURNEY ──────────────────────────────────────────── */}
      <section id="journey" aria-labelledby="journey-title" className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal className="max-w-3xl">
            <h2 id="journey-title" className="font-serif text-4xl leading-tight font-medium text-primary md:text-5xl">
              {page.journey.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">{page.journey.lede}</p>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-[5fr_1.6fr]">
            <div className="relative rounded-xl border border-border bg-white p-6 pt-10 sm:p-8 sm:pt-12">
              <p className="absolute top-0 left-6 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 font-mono text-[11px] tracking-widest text-white uppercase sm:left-8">
                {page.journey.buildLabel}
              </p>
              <ol className="grid gap-8 lg:grid-cols-5 lg:gap-5">
                {page.journey.steps.map((step, index) => (
                  <li key={step.title} className="grid content-start gap-3 lg:border-t lg:border-border lg:pt-5">
                    <span className="font-serif text-2xl font-medium text-accent-strong tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="grid gap-1.5">
                      <h3 className="font-serif text-xl leading-snug font-medium text-primary">{step.title}</h3>
                      <p className="text-[15px] leading-relaxed text-text-muted">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative grid content-start gap-4 rounded-xl bg-primary p-6 pt-10 text-white sm:p-8 sm:pt-12">
              <p className="absolute top-0 left-6 -translate-y-1/2 rounded-full bg-accent px-4 py-1.5 font-mono text-[11px] tracking-widest text-primary uppercase sm:left-8">
                {page.journey.careLabel}
              </p>
              <span className="font-serif text-2xl font-medium text-accent tabular-nums">06</span>
              <div className="grid gap-1.5">
                <h3 className="font-serif text-xl leading-snug font-medium">{page.journey.care.title}</h3>
                <p className="text-[15px] leading-relaxed text-white/70">{page.journey.care.detail}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* ─── INCLUDED ─────────────────────────────────────────── */}
      <section id="included" aria-labelledby="included-title" className="bg-background-soft py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal className="max-w-3xl">
            <h2 id="included-title" className="font-serif text-4xl leading-tight font-medium text-primary md:text-5xl">
              {page.included.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">{page.included.lede}</p>
          </Reveal>

          <ol className="mt-10 grid gap-6 md:grid-cols-2">
            {page.included.layers.map((layer, index) => (
              <li key={layer.name}>
                <Reveal delay={(index % 2) * 100} className="h-full">
                  <article className="grid h-full content-start gap-6 rounded-xl border border-border bg-white p-5 sm:p-7">
                    <div className="rounded-lg bg-background-soft p-4 sm:p-6">
                      {layer.image ? (
                        <Image
                          src={layer.image.src}
                          width={layer.image.width}
                          height={layer.image.height}
                          alt={layer.image.alt}
                          sizes="(min-width: 768px) 40vw, 90vw"
                          className="mx-auto h-auto w-full max-w-md"
                        />
                      ) : (
                        <StackArt layer={layer.id} className="mx-auto max-w-md" />
                      )}
                    </div>
                    <div>
                      <p className="font-serif text-lg font-medium text-accent-strong tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl leading-tight font-medium text-primary">{layer.name}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{layer.summary}</p>
                    </div>
                    <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      {layer.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm leading-snug text-foreground">
                          <Tick className="size-4 text-accent-strong" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── WORK ─────────────────────────────────────────────── */}
      <section id="work" aria-labelledby="work-title" style={WORK_BACKGROUND} className="pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal className="max-w-3xl">
            <h2 id="work-title" className="font-serif text-4xl leading-tight font-medium text-primary md:text-5xl">
              {page.work.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">{page.work.lede}</p>
          </Reveal>

          <ul className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {page.work.sites.map((site, index) => (
              <li key={site.title}>
                <Reveal delay={index * 100} className="h-full">
                  <Link
                    href={`/free-business-website/live/${site.slug}`}
                    className="group grid h-full content-start gap-5 rounded-xl border border-border bg-white p-4 transition-shadow duration-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <Image
                      src={site.image.src}
                      width={site.image.width}
                      height={site.image.height}
                      alt={site.image.alt}
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                      className="aspect-[16/10] w-full rounded-lg object-cover object-top"
                    />
                    <div className="grid gap-1.5 px-2 pb-2">
                      <p className="font-mono text-[11px] tracking-widest text-text-muted uppercase">{site.category}</p>
                      <h3 className="font-serif text-xl font-medium text-primary">{site.title}</h3>
                      <p className="text-[15px] leading-relaxed text-text-muted">{site.summary}</p>
                      <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 group-hover:underline">
                        Explore the website
                        <Arrow />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" aria-labelledby="faq-title" className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6 md:px-12">
          <Reveal>
            <h2 id="faq-title" className="mb-10 font-serif text-4xl leading-tight font-medium text-primary md:text-5xl">
              {page.faq.title}
            </h2>
          </Reveal>
          <FaqAccordion faqs={page.faq.items} />
        </div>
      </section>

      {/* ─── CLOSING ──────────────────────────────────────────── */}
      <section data-nav-theme="dark" className="relative isolate overflow-hidden bg-primary py-16 text-white md:py-24">
        <HeroDarkBackdrop />
        <Reveal className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-4xl leading-tight font-medium text-balance md:text-5xl">{page.closing.title}</h2>
          <p className="mt-4 text-base text-white/70 md:text-lg">{page.closing.line}</p>
          <div className="mt-10">
            <a href={careUrl} className={PRIMARY_BUTTON_ON_DARK}>
              {page.closing.cta}
              <Arrow />
            </a>
          </div>
          <p className="mt-6 font-mono text-xs tracking-widest text-white/60 uppercase">
            {page.closing.note}
          </p>
        </Reveal>
      </section>

      <WhatsAppButton />

      {page.marketSwitch ? (
        <MarketSwitch href={MARKET_PATHS[page.marketSwitch.market]} label={page.marketSwitch.label} cta={page.marketSwitch.cta} />
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </>
  );
}
