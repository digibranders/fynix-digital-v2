import { type CompareCard, freeWebsiteContent } from "./free-business-website";

/**
 * Content for /digital-growth-team: the website, SEO, LinkedIn management, outreach and paid ads as one outsourced team.
 * It reuses the free business website page's plan cards, minus every price, tag and "extra" bar. Nothing on the page is
 * priced; every button goes to the contact page.
 */
export const DIGITAL_GROWTH_TEAM_PATH = "/digital-growth-team";

/** Where every button on the page, and the header's, sends a visitor. */
export const DIGITAL_GROWTH_TEAM_CTA = { label: "Get my website", href: "/contact" } as const;

/** One line of the hero's split-flap board: a channel and the statuses its status column flips through, first one first. */
export interface BoardRow {
  readonly channel: string;
  readonly statuses: readonly [string, ...string[]];
}

const [websiteCard, , outreachCard, advertisingCard] = freeWebsiteContent.compare.cards;

const linkedInCard: CompareCard = {
  name: "LinkedIn management",
  intro:
    "We run your personal LinkedIn account by hand, with no bots and no automation, so your profile builds trust and starts real conversations.",
  columns: [
    {
      items: [
        { label: "Profile optimisation", icon: "document" },
        { label: "Targeted networking with the right people", icon: "target" },
        { label: "Personalised connection requests and outreach", icon: "mail" },
        { label: "Thoughtful comments on the right conversations", icon: "marketing" },
      ],
    },
  ],
};

const seoCard: CompareCard = {
  name: "SEO and AEO",
  intro:
    "We help customers find you on Google and in AI answers such as ChatGPT. Search is a long-term strategy, so rankings build over several months.",
  columns: [
    {
      items: [
        { label: "Keyword and competitor research", icon: "target" },
        { label: "Technical SEO and site structure", icon: "gear" },
        { label: "Content written for search and AI answers", icon: "document" },
        { label: "Google Business Profile optimisation", icon: "google-business" },
        { label: "Monthly ranking and traffic report", icon: "reporting" },
      ],
    },
  ],
};

export const digitalGrowthTeamContent = {
  meta: {
    title: "Your Outsourced Digital Growth Team",
    description:
      "One team for your website, SEO, LinkedIn, outreach and paid ads. We build it, run it and keep it moving so you can focus on your business.",
  },
  hero: {
    title: "Your Outsourced",
    accent: "Digital Growth Team",
    lede: "A website, SEO, LinkedIn, outreach and paid ads, all run by one team.",
  },
  compare: {
    title: "One team. Every channel.",
    lede: "We build your website and run SEO, LinkedIn, outreach and paid ads for you.",
    cards: [
      { name: websiteCard.name, columns: websiteCard.columns },
      seoCard,
      linkedInCard,
      { name: outreachCard.name, intro: outreachCard.intro, columns: outreachCard.columns },
      { name: "Paid ads management", intro: advertisingCard.intro, columns: advertisingCard.columns },
    ] satisfies readonly CompareCard[],
  },
  /** Siddique Ahmed's line under the cards. */
  quote: "Think of us as the growth team you did not have to hire. We run your website, SEO, LinkedIn, outreach and ads so you can run the business.",
  /** The hero's departures board: one row per card below, in the same order. */
  board: {
    columns: ["Channel", "Status"] as const,
    rows: [
      { channel: "WEBSITE", statuses: ["LIVE", "SECURE", "UPDATED"] },
      { channel: "SEO", statuses: ["RANKING", "INDEXED", "RISING"] },
      { channel: "LINKEDIN", statuses: ["ACTIVE", "GROWING", "ON IT"] },
      { channel: "OUTREACH", statuses: ["SENDING", "REPLIED", "BOOKED"] },
      { channel: "PAID ADS", statuses: ["RUNNING", "TUNED", "LEADS"] },
    ] satisfies readonly BoardRow[],
    note: "Run by the Fynix growth team",
    /** What a screen reader hears in place of the flipping letters. */
    summary: "Your website, SEO, LinkedIn, outreach and paid ads, each run by the Fynix growth team.",
  },
};
