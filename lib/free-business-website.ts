import type { PlanIconKey } from "@/components/free-business-website/PlanIcon";
import type { Faq } from "@/lib/content";
import { type WorkSite, workSites } from "./work-sites";

/**
 * Content for the free business website pages: the website Fynix builds for a local business at no development fee,
 * and the monthly plan that keeps it running. There is one page per market, each at its own address so search engines
 * index both: /free-business-website for India (rupees, GST) and /us/free-business-website for the US (dollars).
 * India's sign-up buttons go to the plan's sign-up in the business dashboard (app.fynix.digital, where one plan is sold
 * with add-ons) once NEXT_PUBLIC_LOCAL_BUSINESS_URL says the dashboard is live. Until then, and always in the US for now,
 * they go to the contact page, so no visitor lands on an address that does not exist or a price that is not charged.
 */

/** The page the sign-up buttons use while the dashboard is not live. */
export const CONTACT_PATH = "/contact";

/**
 * Where the business dashboard lives, or null while it is not switched on: set NEXT_PUBLIC_LOCAL_BUSINESS_URL to its
 * origin (https://app.fynix.digital in production, http://app.localhost:3098 locally) to turn it on.
 */
export function localBusinessOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_LOCAL_BUSINESS_URL?.trim();
  return configured === undefined || configured === "" ? null : configured.replace(/\/+$/, "");
}

export type LocalBusinessPlan = "care";

/** The dashboard's create-account page with a plan already chosen, or the contact page while the dashboard is not live. */
export function signUpUrl(plan: LocalBusinessPlan): string {
  const origin = localBusinessOrigin();
  return origin === null ? CONTACT_PATH : `${origin}/login?plan=${plan}`;
}

/** The markets the page is sold in: India in rupees with GST, the US in dollars. */
export type Market = "in" | "us";

export const MARKET_PATHS: Readonly<Record<Market, string>> = {
  in: "/free-business-website",
  us: "/us/free-business-website",
};

/** Where a market's sign-up buttons go. */
export function marketSignUpUrl(market: Market): string {
  // shortcut: the dashboard cannot charge the US prices yet (it has no USD add-ons, and its USD plan is not $75), so US
  // sign-ups go to the contact page. Send them to signUpUrl("care") once the dashboard sells this US price list.
  return market === "us" ? CONTACT_PATH : signUpUrl("care");
}

/**
 * Whether the browser's clock is set to a US time zone. IANA zones are per country (Canada has America/Toronto, not
 * America/New_York), so this tells a US visitor apart from the rest of the Americas without asking the server.
 * Browsers report some zones by their older names (Chrome says America/Indianapolis, and Asia/Calcutta for Kolkata),
 * so those are listed too.
 */
const US_TIME_ZONE =
  /^(America\/(New_York|Detroit|Kentucky\/.+|Indiana\/.+|Indianapolis|Fort_Wayne|Louisville|Knox_IN|Chicago|Menominee|North_Dakota\/.+|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak|Atka)|Pacific\/Honolulu|US\/.+|Navajo)$/;

export function isUsTimeZone(zone: string): boolean {
  return US_TIME_ZONE.test(zone);
}

/** The monthly plan's price, before GST, as the dashboard charges it (₹2,999 + 18% GST). */
export const CARE_MONTHLY_PRICE = "₹2,999";
export const GST_NOTE = "+ 18% GST";
/** The three add-ons sold on top of the monthly plan, a month before GST. */
export const SOCIAL_ADDON_PRICE = "₹1,999";
export const OUTREACH_ADDON_PRICE = "₹4,999";
export const ADVERTISING_ADDON_PRICE = "₹5,999";
export const CARE_MONTHLY_TEXT = `${CARE_MONTHLY_PRICE} a month ${GST_NOTE}`;

/** One column inside a plan card: a head (a numbered circle or a product mark) over a short list of what it covers. */
export interface CompareColumn {
  readonly title?: string;
  readonly subtitle?: string;
  readonly lead?: { readonly number: number } | { readonly icon: PlanIconKey };
  readonly items: readonly { readonly label: string; readonly icon: PlanIconKey }[];
}

/** The plan, or one add-on, as a card: a dark header with its name and price, columns of what is included, and what costs extra. */
export interface CompareCard {
  readonly name: string;
  readonly tag: string;
  readonly price: string;
  readonly intro?: string;
  readonly columns: readonly CompareColumn[];
  /** What costs extra on top of the price, on its own bar at the foot of the card so it is read. */
  readonly extra?: string;
}

interface TitledLine {
  readonly title: string;
  readonly detail: string;
}

/** One layer of what every website includes: an image when there is one, otherwise a drawn scene (StackArt). */
export interface IncludedLayer {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly items: readonly string[];
  readonly image?: { readonly src: string; readonly width: number; readonly height: number; readonly alt: string };
}

/** Everything one market's page shows. */
export interface FreeWebsiteContent {
  readonly market: Market;
  readonly meta: { readonly title: string; readonly description: string };
  readonly hero: {
    readonly title: string;
    readonly accent: string;
    readonly lede: string;
    readonly primaryCta: string;
    readonly assurances: readonly string[];
  };
  readonly ticket: {
    readonly title: string;
    readonly accent: string;
    readonly lede: string;
    readonly build: { readonly label: string; readonly price: string; readonly priceLine: string; readonly points: readonly string[] };
    readonly care: {
      readonly label: string;
      readonly price: string;
      readonly priceLine: string;
      readonly benefits: readonly TitledLine[];
      readonly cta: string;
    };
  };
  readonly compare: {
    readonly title: string;
    readonly lede: string;
    readonly priceLine: string;
    readonly addonsIntro: string;
    readonly cards: readonly CompareCard[];
    readonly careCta: string;
  };
  readonly journey: {
    readonly title: string;
    readonly lede: string;
    readonly buildLabel: string;
    readonly careLabel: string;
    readonly steps: readonly TitledLine[];
    readonly care: TitledLine;
  };
  readonly included: { readonly title: string; readonly lede: string; readonly layers: readonly IncludedLayer[] };
  readonly work: { readonly title: string; readonly lede: string; readonly sites: readonly WorkSite[] };
  /** `**phrase**` in an answer is shown bold. */
  readonly faq: { readonly title: string; readonly items: Faq[] };
  readonly closing: { readonly title: string; readonly line: string; readonly cta: string; readonly note: string };
  /** A note pointing visitors from another market to their own page, shown only to them. */
  readonly marketSwitch?: { readonly market: Market; readonly label: string; readonly cta: string };
}

/** The questions both pages answer; only the monthly price and how build time is counted differ. */
function freeWebsiteFaqs({ monthly, buildDays }: { readonly monthly: string; readonly buildDays: string }): Faq[] {
  return [
    {
      q: "Is the website really free?",
      a: `Yes. There is no design or build fee: you pay nothing for us to build your website. You pay the monthly plan, ${monthly}, which **keeps it hosted, secure and up to date**.`,
    },
    {
      q: "What do I pay for every month?",
      a: "Keeping your website running: hosting and SSL, security, updates and upkeep, monitoring all month, a monthly health report and the OyeChats chatbot. **The build itself is free.**",
    },
    {
      q: "Is there anything to pay up front?",
      a: `Only your first month. Your first payment is ${monthly} and it covers your first month. **There is no separate build fee.**`,
    },
    {
      q: "How long does it take to build my website?",
      a: `Once you have sent your details and made your first payment, your website goes live **within ${buildDays}**. It can take a little longer if we are waiting on feedback or content from you, or on your domain being connected.`,
    },
    {
      q: "How many pages do I get?",
      a: "Up to 5 pages. More pages or bigger features can be added for an extra fee, and we always confirm the price before doing anything.",
    },
    {
      q: "Do I pay for hosting separately?",
      a: "No. **Hosting is included** in the monthly plan.",
    },
    {
      q: "Who owns the domain and the content?",
      a: "You register and pay for your own domain, so it is always in your name. No domain yet? We will set your website up on a temporary domain for free until you have one. The design and the content we write stay with Fynix and are provided as a hosted service while you are subscribed.",
    },
    {
      q: "Can I make changes later?",
      a: "Yes. Send any change from your dashboard. We always tell you the cost before we start anything that costs extra.",
    },
    {
      q: "Can I cancel?",
      a: "Yes, anytime, with no notice period. Your website stays online until the end of the month you have already paid for, and your domain stays yours. We remind you before every renewal, so you are never charged by surprise.",
    },
    {
      q: "What happens if a payment fails?",
      a: "Your website is taken offline as soon as a payment is due and unpaid; there is no grace period. Your content is kept safe, and the website comes back as soon as the payment goes through.",
    },
    {
      q: "What technology is my website built on?",
      a: "Next.js: a modern, fast and scalable foundation.",
    },
  ];
}

export const freeWebsiteContent: FreeWebsiteContent = {
  market: "in",
  meta: {
    title: "Get your business website free",
    description:
      "A professional website for your local business with no development fee, live in 7 working days. Design, hosting, security and upkeep in one monthly plan.",
  },
  hero: {
    title: "Your first impression.",
    accent: "Make it count.",
    lede: "We build your website free and look after it every month.",
    primaryCta: "Get my free website",
    assurances: ["Your business", "Your website", "We keep it running"],
  },
  ticket: {
    title: "You do not pay to build it.",
    accent: "You pay to keep it running.",
    lede: "We design and build your website for free. Once it is live, one monthly price keeps it hosted, secure and up to date.",
    build: {
      label: "We build it",
      price: "₹0",
      priceLine: "Development fee",
      points: [
        "Professional design",
        "Up to 5 pages",
        "Works on every phone",
        "Enquiry forms and click-to-call",
        "Local SEO foundation",
      ],
    },
    care: {
      label: "We keep it running",
      price: CARE_MONTHLY_PRICE,
      priceLine: `a month ${GST_NOTE}`,
      benefits: [
        { title: "Hosting and SSL", detail: "Your website is hosted for you and kept online." },
        { title: "Security", detail: "Your website is protected and kept secure." },
        { title: "Updates and upkeep", detail: "Maintenance, updates and speed, all handled." },
        { title: "Monitoring", detail: "Your website is watched all month, so problems are caught early." },
        { title: "Monthly health report", detail: "A short report on how your website is doing." },
        { title: "OyeChats professional chatbot", detail: "A professional chatbot on your website." },
      ],
      cta: "Get my free website",
    },
  },
  /**
   * The one monthly plan and the three add-ons bought on top of it, as one table in bands. Each band has
   * its own name and price on a dark header row; every row under a band is included in that band, so a tick means
   * "you get this". There is no other plan.
   */
  compare: {
    title: "One plan. Add what you need.",
    lede: "One monthly plan keeps your website, hosting and chatbot running. Add social media, outreach or advertising on top when you want them.",
    priceLine: `a month ${GST_NOTE}`,
    addonsIntro: "Optional add-ons",
    cards: [
      {
        name: "Website",
        tag: "Your plan",
        price: CARE_MONTHLY_PRICE,
        columns: [
          {
            title: "Next.js business website",
            subtitle: "A professional, mobile-friendly website to help you get enquiries online.",
            lead: { number: 1 },
            items: [
              { label: "Professional design", icon: "monitor" },
              { label: "Up to 5 pages", icon: "document" },
              { label: "Mobile-friendly (works on all devices)", icon: "mobile" },
              { label: "Enquiry forms and click-to-call", icon: "phone" },
              { label: "Local SEO foundation", icon: "pin" },
              { label: "OyeChats professional chatbot", icon: "chatbot" },
            ],
          },
          {
            title: "Website maintenance",
            subtitle: "We keep your website secure, updated and running smoothly.",
            lead: { number: 2 },
            items: [
              { label: "Security monitoring", icon: "shield" },
              { label: "Performance monitoring", icon: "bars" },
              { label: "Hosting and uptime monitoring", icon: "server" },
              { label: "Routine updates and upkeep", icon: "gear" },
              { label: "Monthly health report", icon: "document" },
            ],
          },
        ],
        extra: "Content updates and new pages: ₹500 an hour.",
      },
      {
        name: "Social media management",
        tag: "Add-on",
        price: SOCIAL_ADDON_PRICE,
        intro:
          "We publish two audience-targeted posts per week to keep your social media accounts relevant and informative. As this is an organic growth strategy, increased engagement takes time and consistent effort.",
        columns: [
          {
            title: "Facebook account management",
            lead: { icon: "facebook" },
            items: [
              { label: "2 targeted posts per week", icon: "document" },
              { label: "Account management", icon: "gear" },
            ],
          },
          {
            title: "Instagram account management",
            lead: { icon: "instagram" },
            items: [
              { label: "2 targeted posts per week", icon: "document" },
              { label: "Account management", icon: "gear" },
            ],
          },
        ],
        extra: "Extra video editing for Reels: ₹500 an hour.",
      },
      {
        name: "Outreach and lead generation",
        tag: "Add-on",
        price: OUTREACH_ADDON_PRICE,
        intro:
          "If your potential customers can be approached through LinkedIn and email, this is for you.\nWe reach out to potential clients for you and schedule the meetings directly on your Calendly.",
        columns: [
          {
            items: [
              { label: "Reach out to potential clients by email and LinkedIn", icon: "mail" },
              { label: "Schedule meetings directly on your Calendly", icon: "calendar" },
            ],
          },
        ],
      },
      {
        name: "Paid advertising",
        tag: "Add-on",
        price: ADVERTISING_ADDON_PRICE,
        intro: "We manage your paid campaigns on Facebook and Instagram.",
        columns: [
          {
            items: [
              { label: "Meta Ads management (Facebook and Instagram)", icon: "meta-ads" },
              { label: "Lead generation and conversion optimisation", icon: "target" },
              { label: "Ad campaign tracking and performance reporting", icon: "reporting" },
            ],
          },
        ],
        extra: "Advertising spend is charged separately.",
      },
    ],
    careCta: "Get my free website",
  },
  journey: {
    title: "From hello to live.",
    lede: "Five steps to a live website, then it is looked after every month.",
    buildLabel: "We build it · ₹0",
    careLabel: "Monthly plan",
    steps: [
      { title: "Tell us about your business", detail: "Sign up and send your details from your dashboard." },
      { title: "We get to know it", detail: "We learn what you sell, who you sell to and what you want customers to do." },
      { title: "We build your site", detail: "Design, pages, forms and local SEO, built for your business." },
      { title: "You review it", detail: "Ask for changes until you are happy with it." },
      { title: "It goes live", detail: "Within 7 working days of your details and first payment." },
    ],
    care: { title: "We keep it running", detail: `Hosting, security, updates and monitoring for ${CARE_MONTHLY_TEXT}.` },
  },
  included: {
    title: "Everything your website needs.",
    lede: "A complete digital foundation, built for growth.",
    layers: [
      {
        id: "experience",
        name: "Experience",
        summary: "A website that looks right and is easy to use on every screen.",
        items: ["Responsive design", "Clear navigation", "Sticky navigation", "Custom 404", "Favicon", "Contact forms", "Accessibility"],
        image: {
          src: "/free-business-website/experience.webp",
          width: 1536,
          height: 1024,
          alt: "The same website shown on a laptop and a phone, laid out for each screen.",
        },
      },
      {
        id: "performance",
        name: "Performance",
        summary: "Pages that load quickly, so visitors stay instead of giving up.",
        items: ["Core Web Vitals", "Optimised images", "CDN", "Caching", "Lazy loading", "Fast TTFB", "Open Graph tags"],
      },
      {
        id: "security",
        name: "Security",
        summary: "Kept safe from common attacks and spam, with backups if anything goes wrong.",
        items: [
          "HTTPS and SSL",
          "Secure headers",
          "Secure cookies",
          "CSP",
          "Bot protection",
          "WAF",
          "DDoS protection",
          "Backups",
          "Vulnerability monitoring",
          "Secure authentication",
        ],
      },
      {
        id: "content",
        name: "Content",
        summary: "Your pages and blog, organised and easy to keep up to date.",
        items: ["CMS", "Blog", "Categories", "Tags", "Authors", "Media library", "Draft and publish", "Revisions", "SEO fields"],
      },
      {
        id: "architecture",
        name: "Architecture",
        summary: "Built on modern, well-supported technology that stays quick to change.",
        items: [
          "Next.js and React",
          "Server-side rendering",
          "Static generation",
          "Dynamic rendering",
          "TypeScript",
          "Component architecture",
          "Image optimisation",
        ],
      },
      {
        id: "integrations",
        name: "Integrations",
        summary: "Connected to the tools you and your customers already use.",
        items: ["WhatsApp", "Calendars", "AI chatbot", "Google Maps", "Analytics", "Search Console", "Tag Manager", "Clarity"],
      },
      {
        id: "privacy",
        name: "Privacy",
        summary: "Your visitors’ data handled carefully and in line with privacy law.",
        items: [
          "Cookie consent",
          "Preference management",
          "Privacy policy",
          "Data disclosure",
          "Data retention",
          "Data deletion",
          "Form consent",
        ],
      },
      {
        id: "monitoring",
        name: "Monitoring",
        summary: "We keep watch on your website and send you a health report every month.",
        items: [
          "Uptime monitoring",
          "Performance monitoring",
          "Error monitoring",
          "Broken-link monitoring",
          "SSL, domain and DNS monitoring",
          "Backup monitoring",
          "Analytics monitoring",
          "Monthly health reports",
        ],
      },
    ],
  },
  work: {
    title: "Websites we have built.",
    lede: "Real client websites. Open one and explore it right here.",
    sites: workSites,
  },
  faq: {
    title: "Questions, answered.",
    items: freeWebsiteFaqs({ monthly: CARE_MONTHLY_TEXT, buildDays: "7 working days" }),
  },
  closing: {
    title: "Stop saying “we will build a website later.”",
    line: "Your customers are already searching.",
    cta: "Get my free website",
    note: `₹0 development fee · Website plan ${CARE_MONTHLY_TEXT}`,
  },
  marketSwitch: { market: "us", label: "In the US? See our prices in US dollars.", cta: "US pricing" },
};

/** The US price list, a month in dollars, with no sales tax added. */
export const US_WEBSITE_PRICE = "$75";
export const US_SOCIAL_ADDON_PRICE = "$100";
export const US_OUTREACH_ADDON_PRICE = "$125";
export const US_ADVERTISING_ADDON_PRICE = "$125";
export const US_WEBSITE_MONTHLY_TEXT = `${US_WEBSITE_PRICE} a month`;
/** Hourly work on top of a plan, where India charges ₹500 an hour. */
export const US_EXTRA_HOUR_PRICE = "$10";

/** The US client the US page shows first. */
const US_FEATURED_SITE = "gkr-hospitality";

const [indiaWebsiteCard, , indiaOutreachCard, indiaAdvertisingCard] = freeWebsiteContent.compare.cards;
const accountManagement = [
  { label: "2 targeted posts per week", icon: "document" },
  { label: "Account management", icon: "gear" },
] as const;

/**
 * The US page: the same website, build and upkeep as India, sold in dollars. Social media covers Facebook, Instagram
 * and LinkedIn in one add-on.
 */
export const usFreeWebsiteContent: FreeWebsiteContent = {
  ...freeWebsiteContent,
  market: "us",
  meta: {
    title: "Free business website for US local businesses",
    description:
      "A professional website for your local business with no development fee, live in 7 business days. Hosting, security and upkeep for $75 a month.",
  },
  ticket: {
    ...freeWebsiteContent.ticket,
    build: { ...freeWebsiteContent.ticket.build, price: "$0" },
    care: { ...freeWebsiteContent.ticket.care, price: US_WEBSITE_PRICE, priceLine: "a month" },
  },
  compare: {
    ...freeWebsiteContent.compare,
    lede: "One monthly plan keeps your website, hosting and chatbot running. Add social media, outreach or paid ads on top when you want them.",
    priceLine: "a month",
    cards: [
      { ...indiaWebsiteCard, price: US_WEBSITE_PRICE, extra: `Content updates and new pages: ${US_EXTRA_HOUR_PRICE} an hour.` },
      {
        name: "Social media management",
        tag: "Add-on",
        price: US_SOCIAL_ADDON_PRICE,
        intro:
          "We publish two audience-targeted posts per week on Facebook, Instagram and LinkedIn to keep your accounts relevant and informative. As this is an organic growth strategy, increased engagement takes time and consistent effort.",
        columns: [
          { title: "Facebook", lead: { icon: "facebook" }, items: accountManagement },
          { title: "Instagram", lead: { icon: "instagram" }, items: accountManagement },
          { title: "LinkedIn", lead: { icon: "linkedin" }, items: accountManagement },
        ],
        extra: `Extra video editing for Reels: ${US_EXTRA_HOUR_PRICE} an hour.`,
      },
      { ...indiaOutreachCard, price: US_OUTREACH_ADDON_PRICE },
      {
        ...indiaAdvertisingCard,
        name: "Paid ads management",
        price: US_ADVERTISING_ADDON_PRICE,
        extra: "Ad spend is not included in the management fee.",
      },
    ],
  },
  journey: {
    ...freeWebsiteContent.journey,
    buildLabel: "We build it · $0",
    steps: freeWebsiteContent.journey.steps.map((step, index, steps) =>
      index === steps.length - 1 ? { ...step, detail: "Within 7 business days of your details and first payment." } : step,
    ),
    care: { ...freeWebsiteContent.journey.care, detail: `Hosting, security, updates and monitoring for ${US_WEBSITE_MONTHLY_TEXT}.` },
  },
  work: {
    ...freeWebsiteContent.work,
    // The US client first: the first site leads the hero's before-and-after and the list of work.
    sites: [...workSites].sort((a, b) => Number(b.slug === US_FEATURED_SITE) - Number(a.slug === US_FEATURED_SITE)),
  },
  faq: {
    ...freeWebsiteContent.faq,
    items: freeWebsiteFaqs({ monthly: US_WEBSITE_MONTHLY_TEXT, buildDays: "7 business days" }),
  },
  closing: { ...freeWebsiteContent.closing, note: `$0 development fee · Website plan ${US_WEBSITE_MONTHLY_TEXT}` },
  marketSwitch: undefined,
};

export const FREE_WEBSITE_CONTENT: Readonly<Record<Market, FreeWebsiteContent>> = {
  in: freeWebsiteContent,
  us: usFreeWebsiteContent,
};
