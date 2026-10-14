import type { PlanIconKey } from "@/components/free-business-website/PlanIcon";
import type { Faq } from "@/lib/content";
import { workSites } from "./work-sites";

/**
 * Content for /free-business-website: the website Fynix builds for a local business at no development fee, and the
 * monthly plan that keeps it running. Every sign-up button goes to the plan's sign-up in the business dashboard
 * (localbusiness.fynix.digital, where only the Care and Premium plans are sold) once NEXT_PUBLIC_LOCAL_BUSINESS_URL
 * says the dashboard is live. Until then it goes to the contact page, so no visitor lands on an address that does not exist.
 */

/** The page the sign-up buttons use while the dashboard is not live. */
export const CONTACT_PATH = "/contact";

/**
 * Where the business dashboard lives, or null while it is not switched on: set NEXT_PUBLIC_LOCAL_BUSINESS_URL to its
 * origin (https://localbusiness.fynix.digital in production, http://localbusiness.localhost:3097 locally) to turn it on.
 */
export function localBusinessOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_LOCAL_BUSINESS_URL?.trim();
  return configured === undefined || configured === "" ? null : configured.replace(/\/+$/, "");
}

export type LocalBusinessPlan = "care" | "premium";

/** The dashboard's create-account page with a plan already chosen, or the contact page while the dashboard is not live. */
export function signUpUrl(plan: LocalBusinessPlan): string {
  const origin = localBusinessOrigin();
  return origin === null ? CONTACT_PATH : `${origin}/login?plan=${plan}`;
}

/** The Care plan's monthly price, before GST, as the dashboard charges it (₹2,999 + 18% GST). */
export const CARE_MONTHLY_PRICE = "₹2,999";
export const GST_NOTE = "+ 18% GST";
export const CARE_MONTHLY_TEXT = `${CARE_MONTHLY_PRICE} a month ${GST_NOTE}`;

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
    secondaryCta: "See what is included",
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
        "Google Maps and Business Profile setup",
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
      cta: "Start with Care",
    },
  },
  /**
   * Care against Premium, from the dashboard's plan table with the Free column and every listing row left
   * out: this page sells websites, and the dashboard here offers only these two plans. A cell is a tick (true), a dash
   * (false) or the words it says instead.
   */
  compare: {
    title: "Care or Premium.",
    lede: "Both plans include your website, hosting and chatbot. Premium adds appointments and the marketing around them.",
    care: "Care",
    premium: "Premium",
    rows: [
      { label: "Server and hosting", group: "Website", icon: "hosting", care: true, premium: true },
      { label: "Next.js business website", group: "Website", icon: "code", care: true, premium: true },
      { label: "Website management", group: "Website", icon: "website", care: true, premium: true },
      { label: "OyeChats professional chatbot", group: "Website", icon: "chatbot", care: true, premium: true },
      { label: "Appointment management system", group: "Bookings", icon: "calendar", care: false, premium: true },
      { label: "Google Business Profile management", group: "Social media", icon: "google-business", care: false, premium: true },
      { label: "Facebook account management", group: "Social media", icon: "facebook", care: false, premium: true },
      { label: "Instagram account management", group: "Social media", icon: "instagram", care: false, premium: true },
      { label: "Google Ads management", group: "Advertising", icon: "google-ads", care: false, premium: true },
      { label: "Meta Ads management (Facebook and Instagram)", group: "Advertising", icon: "meta-ads", care: false, premium: true },
      { label: "Lead generation and conversion optimisation", group: "Advertising", icon: "target", care: false, premium: true },
      { label: "Ad campaign tracking and performance reporting", group: "Advertising", icon: "reporting", care: false, premium: true },
      { label: "Fynix digital marketing services", group: "Marketing", icon: "marketing", care: false, premium: "10% off" },
    ] satisfies readonly { readonly label: string; readonly group: string; readonly icon: PlanIconKey; readonly care: boolean | string; readonly premium: boolean | string }[],
    careCta: "Start with Care",
    premiumCta: "Start with Premium",
  },
  journey: {
    title: "From hello to live.",
    lede: "Five steps to a live website, then it is looked after every month.",
    buildLabel: "We build it · ₹0",
    careLabel: "Monthly care",
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
    a: `Yes. There is no design or build fee: you pay nothing for us to build your website. You pay the Care plan, ${CARE_MONTHLY_TEXT}, which **keeps it hosted, secure and up to date**.`,
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
