import type { PlanIconKey } from "@/components/free-business-website/PlanIcon";
import type { Faq } from "@/lib/content";
import { workSites } from "./work-sites";

/**
 * Content for /free-business-website: the website Fynix builds for a local business at no development fee, and the
 * monthly plan that keeps it running. Every sign-up button goes to the plan's sign-up in the business dashboard
 * (app.fynix.digital, where one plan is sold with add-ons) once NEXT_PUBLIC_LOCAL_BUSINESS_URL
 * says the dashboard is live. Until then it goes to the contact page, so no visitor lands on an address that does not exist.
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

/** The monthly plan's price, before GST, as the dashboard charges it (₹2,999 + 18% GST). */
export const CARE_MONTHLY_PRICE = "₹2,999";
export const GST_NOTE = "+ 18% GST";
/** The three add-ons sold on top of the monthly plan, a month before GST. */
export const SOCIAL_ADDON_PRICE = "₹1,999";
export const OUTREACH_ADDON_PRICE = "₹3,999";
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

export const freeWebsiteContent = {
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
    addonsIntro: "Optional add-ons. Pick any you need.",
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
    ] as readonly CompareCard[],
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
  },
  closing: {
    title: "Stop saying “we will build a website later.”",
    line: "Your customers are already searching.",
    cta: "Get my free website",
  },
} as const;

/** The page's questions, in the shape FaqAccordion reads. `**phrase**` is shown bold. */
export const freeWebsiteFaqs: Faq[] = [
  {
    q: "Is the website really free?",
    a: `Yes. There is no design or build fee: you pay nothing for us to build your website. You pay the monthly plan, ${CARE_MONTHLY_TEXT}, which **keeps it hosted, secure and up to date**.`,
  },
  {
    q: "What do I pay for every month?",
    a: "Keeping your website running: hosting and SSL, security, updates and upkeep, monitoring all month, a monthly health report and the OyeChats chatbot. **The build itself is free.**",
  },
  {
    q: "Is there anything to pay up front?",
    a: `Only your first month. Your first payment is ${CARE_MONTHLY_TEXT} and it covers your first month. **There is no separate build fee.**`,
  },
  {
    q: "How long does it take to build my website?",
    a: "Once you have sent your details and made your first payment, your website goes live **within 7 working days**. It can take a little longer if we are waiting on feedback or content from you, or on your domain being connected.",
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
