export type ActDeliverable = { title: string; description: string };

export type ActProof = {
  metric: { value: string; label: string; sub?: string };
  relatedCaseStudySlugs: string[];
};

export type ActStep = { title: string; description: string; deliverable: string };

export type Act = {
  slug: "ui-ux" | "development" | "seo" | "lead-generation";
  num: string;
  title: string;
  subtitle: string;
  headline: string;
  content: string;
  bullets: string;
  deliverables: ActDeliverable[];
  proof: ActProof;
  howItRuns: ActStep[];
  faqIndexes: number[];
};

export const acts: Act[] = [
  {
    slug: "ui-ux",
    num: "01",
    title: "UI/UX",
    subtitle: "Act 1: Perception Shapes Trust",
    headline: "Interfaces earn trust before your team speaks.",
    content:
      "A cybersecurity buyer decides to stay in seconds. That decision runs on what the experience signals, **not on what the copy claims**.",
    bullets:
      "We design interfaces that **earn trust before a single line is read**. Purposeful hierarchy, considered motion, copy that meets the buyer's real question.",
    deliverables: [
      {
        title: "User Research",
        description:
          "Interviews, funnel analytics, and jobs-to-be-done grounded in the cybersecurity buyer, not a generic persona.",
      },
      {
        title: "Wireframes",
        description:
          "Low-fidelity layouts that fix priority, hierarchy, and content order before a single pixel is designed.",
      },
      {
        title: "User Flows",
        description:
          "Mapped journeys for the first-time visitor, the evaluator, and the returning stakeholder.",
      },
      {
        title: "Website Design",
        description:
          "High-fidelity interfaces across desktop and mobile, delivered as a single design system your team can extend.",
      },
      {
        title: "Landing Pages",
        description:
          "Campaign pages built for one intent, one CTA, and one measurable outcome.",
      },
      {
        title: "Conversion Optimisation",
        description:
          "Ongoing experiments, funnel diagnostics, and iteration cycles tied to pipeline, not clicks.",
      },
    ],
    proof: {
      metric: {
        value: "2.4×",
        label: "Average pipeline lift",
        sub: "within 6 months of launch",
      },
      relatedCaseStudySlugs: ["payweek", "alsonotify", "photonmatters"],
    },
    howItRuns: [
      {
        title: "Buyer intent audit",
        description:
          "Stakeholder interviews, funnel analytics, and messaging review against real search intent.",
        deliverable: "Prioritised UX brief",
      },
      {
        title: "Interface and prototype",
        description:
          "Information architecture, high-fidelity design, and interactive prototype in one system.",
        deliverable: "Production-ready design system",
      },
      {
        title: "Post-launch conversion review",
        description:
          "Heatmaps, funnel diagnostics, and quarterly iteration tied to pipeline metrics.",
        deliverable: "Quarterly optimisation report",
      },
    ],
    faqIndexes: [0, 2],
  },
  {
    slug: "development",
    num: "02",
    title: "Development",
    subtitle: "Act 2: Performance Keeps the Promise",
    headline: "First impressions hold only if the site keeps up.",
    content:
      "Slow loads and brittle interactions turn early confidence into hesitation. **Hesitation is where visitors quietly leave.**",
    bullets:
      "We build on a modern component stack with **Core Web Vitals as a hard gate**. Fast, accessible, easy for your team to keep growing.",
    deliverables: [
      {
        title: "Custom Websites",
        description:
          "Component-driven front-end builds tuned to the exact narrative your team ships, not a template.",
      },
      {
        title: "Mobile Apps",
        description:
          "React Native and native builds for products that live inside your customer's daily workflow.",
      },
      {
        title: "CMS Development",
        description:
          "Editorial control for your team without letting design integrity or performance slip.",
      },
      {
        title: "Integrations",
        description:
          "CRM, analytics, marketing automation, and product telemetry wired in at launch, not bolted on later.",
      },
      {
        title: "Performance Optimisation",
        description:
          "Core Web Vitals treated as a hard gate before staging is signed off.",
      },
      {
        title: "Accessibility and Security",
        description:
          "WCAG 2.2 AA baseline and security-hardened defaults on every ship, not a post-launch afterthought.",
      },
      {
        title: "Maintenance",
        description:
          "Scheduled updates, uptime monitoring, and a rapid-fix window for the first weeks after launch.",
      },
    ],
    proof: {
      metric: {
        value: "<2.5s",
        label: "LCP target on ship",
        sub: "Core Web Vitals as a hard gate",
      },
      relatedCaseStudySlugs: ["cleanstart", "payweek", "alsonotify"],
    },
    howItRuns: [
      {
        title: "Architecture and stack",
        description:
          "Framework, CMS, integrations, and hosting model decided before any interface is built.",
        deliverable: "Technical brief and repository scaffold",
      },
      {
        title: "Build with performance as a gate",
        description:
          "Component build, integrations, accessibility QA, and Core Web Vitals verified on every merge.",
        deliverable: "Production-ready site on staging",
      },
      {
        title: "Launch and maintain",
        description:
          "Migration, monitoring, and a support window during the first weeks that matter most.",
        deliverable: "Launch report and ongoing support",
      },
    ],
    faqIndexes: [1, 2],
  },
  {
    slug: "seo",
    num: "03",
    title: "SEO / AEO",
    subtitle: "Act 3: Visibility Creates Opportunity",
    headline: "The best site is useless if buyers can't find it.",
    content:
      "Visibility in cybersecurity is competitive and trust-driven. Search is **where enterprise buyers begin every shortlist**.",
    bullets:
      "Technical SEO, editorial content, and **answer-engine optimisation**, so the buyers you sell to discover you the moment they ask the question.",
    deliverables: [
      {
        title: "Technical SEO",
        description:
          "Site architecture, structured data, and Core Web Vitals fixed before a single piece of content ships.",
      },
      {
        title: "Keyword Research",
        description:
          "Search demand, competitor gaps, and enterprise buyer language mapped to real buying intent.",
      },
      {
        title: "Content Strategy",
        description:
          "Editorial calendar aligned to sales stage, not to publishing volume for its own sake.",
      },
      {
        title: "Content Writing",
        description:
          "Long-form editorial for cybersecurity buyers, reviewed by domain leads, not generalist copy.",
      },
      {
        title: "On-Page SEO",
        description:
          "Metadata, internal linking, and schema tuned on the pages that actually carry pipeline.",
      },
      {
        title: "Authority Building",
        description:
          "Digital PR, expert quotes, and outreach earning cybersecurity-adjacent backlinks that pass trust.",
      },
      {
        title: "Answer Engine Optimisation",
        description:
          "Structured pages and citations designed to be picked up by ChatGPT, Perplexity, and Gemini.",
      },
    ],
    proof: {
      metric: {
        value: "4,081",
        label: "Monthly organic visitors",
        sub: "Eventus Security",
      },
      relatedCaseStudySlugs: ["eventus", "cleanstart", "photonmatters"],
    },
    howItRuns: [
      {
        title: "Landscape and intent mapping",
        description:
          "Keyword, SERP, and answer-engine research against the cybersecurity buying committee.",
        deliverable: "Opportunity map with ranked priorities",
      },
      {
        title: "On-page and technical build",
        description:
          "Schema, information architecture, technical fixes, and an editorial calendar tied to sales stage.",
        deliverable: "Content system ready to publish against",
      },
      {
        title: "Authority and answers",
        description:
          "Publishing cadence, digital PR, and LLM visibility monitoring across the surfaces buyers actually use.",
        deliverable: "Monthly visibility and pipeline report",
      },
    ],
    faqIndexes: [4, 2],
  },
  {
    slug: "lead-generation",
    num: "04",
    title: "Lead Generation",
    subtitle: "Act 4: Converting Interest into Conversation",
    headline: "Traffic is not the finish line.",
    content:
      "The right people land, read the work, then leave without a conversation. **That gap is where pipeline quietly dies.**",
    bullets:
      "Systematic outreach, high-intent lead magnets, and pipeline tracking built for **the way enterprise cybersecurity actually buys**.",
    deliverables: [
      {
        title: "ICP Research",
        description:
          "Verified account lists built from firmographic, technographic, and buyer-signal data.",
      },
      {
        title: "Outreach Campaigns",
        description:
          "Multi-channel sequences across email, LinkedIn, and calling, each tied to one specific intent.",
      },
      {
        title: "Landing Pages",
        description:
          "Purpose-built pages for each campaign, tracked from first click through to booked meeting.",
      },
      {
        title: "Demand Generation",
        description:
          "Content, ads, and events run against a defined pipeline target, not a vanity impression count.",
      },
      {
        title: "Lead Qualification",
        description:
          "SDR handoff scripts, discovery frameworks, and meeting review checkpoints your sales team can trust.",
      },
      {
        title: "Pipeline Growth",
        description:
          "Weekly reporting on sourced pipeline, meeting velocity, and win-rate contribution by campaign.",
      },
    ],
    proof: {
      metric: {
        value: "40+",
        label: "Cybersecurity engagements",
        sub: "since 2021",
      },
      relatedCaseStudySlugs: ["eventus", "alsonotify", "cleanstart"],
    },
    howItRuns: [
      {
        title: "ICP and offer definition",
        description:
          "Target account list, lead magnets, and positioning validated against real deals in your CRM.",
        deliverable: "Outbound playbook and target list",
      },
      {
        title: "Campaign build and launch",
        description:
          "Sequences, landing pages, and tracking wired into the tools your team already uses.",
        deliverable: "Live campaigns with dashboards",
      },
      {
        title: "Qualification and iteration",
        description:
          "Reply handling, meeting booking, and monthly pipeline review against sourced-revenue targets.",
        deliverable: "Monthly QBR with revenue attribution",
      },
    ],
    faqIndexes: [3, 0],
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "Why isn't my website generating leads or conversations?",
    a: "A website often struggles when it is built to “present” rather than “guide.” Visitors land with intent, but if the experience doesn't shape that intent into clarity, they exit. Weak messaging hierarchy, unclear next steps, and low trust signals usually **break the flow between interest and action**.",
  },
  {
    q: "Why should UI/UX, development, and SEO/AEO be handled by one team?",
    a: "These functions work as one connected growth system. UX shapes perception, development controls performance, SEO drives visibility, and lead generation defines conversion pathways. When separated, each improves a part. When unified, **the entire journey moves toward measurable outcomes**.",
  },
  {
    q: "How do website design and development affect SEO?",
    a: "Design and development directly shape how easily users and search engines understand a website. Structure, speed, and clarity influence rankings, engagement, and navigation flow. When these elements are aligned, visibility improves, and users are more likely to move into enquiry actions.",
  },
  {
    q: "Why does Fynix focus on cybersecurity companies for lead generation?",
    a: "Since its inception, Fynix has worked extensively with cybersecurity companies. This specialisation has given us a deep understanding of **cybersecurity buyers, sales cycles, trust dynamics, and market challenges**. As a result, we are able to develop more precise lead generation strategies and deliver stronger outcomes for cybersecurity-focused teams.",
  },
  {
    q: "How long does it take to see results from a new website and SEO?",
    a: "Initial improvements often appear through better UX clarity and performance. Search visibility builds gradually as pages get indexed and authority develops. Over time, this compounds into steady traffic growth and more consistent lead opportunities.",
  },
];

// Categorised FAQs powering the /faqs "Jump To" hub. `general` reuses the
// list above; the service categories mirror each dedicated service page.
export type FaqCategory = { id: string; label: string; items: Faq[] };

export const faqCategories: FaqCategory[] = [
  {
    id: "general",
    label: "General questions",
    items: faqs,
  },
  {
    id: "ui-ux",
    label: "UI/UX Design",
    items: [
      {
        q: "Why is UI/UX important for business growth?",
        a: "A well-designed experience makes it easier for customers to understand your products, complete tasks, and make purchasing decisions. Better experiences lead to higher engagement, stronger customer trust, and improved conversions.",
      },
      {
        q: "Do you redesign existing websites?",
        a: "Yes. We help businesses modernize outdated websites by improving usability, navigation, accessibility, visual consistency, and conversion performance.",
      },
      {
        q: "Do you design SaaS platforms and dashboards?",
        a: "Yes. We design intuitive SaaS applications, enterprise dashboards, customer portals, and web applications that simplify complex workflows and improve user productivity.",
      },
      {
        q: "Will the designs be responsive?",
        a: "Absolutely. Every interface is designed to provide a consistent experience across desktop, tablet, and mobile devices.",
      },
      {
        q: "Do you work with developers?",
        a: "Yes. We create developer-ready designs with reusable components, design systems, prototypes, and detailed specifications to ensure a smooth development process.",
      },
    ],
  },
  {
    id: "development",
    label: "Website Development",
    items: [
      {
        q: "Why should I choose Next.js over a traditional website?",
        a: "Next.js delivers faster performance, stronger security, improved search engine optimization, and greater scalability than many traditional website platforms. It is an excellent choice for businesses looking to build future-ready digital experiences.",
      },
      {
        q: "Can you redesign my existing website?",
        a: "Yes. We redesign outdated websites to improve usability, performance, visual appeal, accessibility, and conversions while preserving your existing search visibility where appropriate.",
      },
      {
        q: "Do you provide ongoing website maintenance?",
        a: "Yes. Our maintenance services include security updates, performance monitoring, backups, technical improvements, bug fixes, and continuous optimization to keep your website running smoothly.",
      },
      {
        q: "Will my website be mobile responsive?",
        a: "Absolutely. Every website we develop is fully responsive and optimized to deliver a consistent experience across desktop, tablet, and mobile devices.",
      },
      {
        q: "Do you optimize websites for SEO?",
        a: "Yes. Every website is developed with SEO best practices in mind, including clean code, structured data, technical optimization, Core Web Vitals, mobile responsiveness, and search-friendly architecture.",
      },
    ],
  },
  {
    id: "seo",
    label: "SEO & AI Search",
    items: [
      {
        q: "How long does SEO take to show results?",
        a: "SEO is a long-term investment. While technical improvements can deliver early gains, meaningful business results typically become visible within 3 to 6 months, depending on your industry, competition, and website authority.",
      },
      {
        q: "Do you optimize for AI-powered search?",
        a: "Yes. Our strategies include semantic SEO, entity optimization, structured data, and content architecture designed to improve visibility across AI-powered search experiences in addition to traditional search engines.",
      },
      {
        q: "Can you work with enterprise websites?",
        a: "Absolutely. We help businesses manage SEO across large websites, multiple markets, and complex digital ecosystems through scalable enterprise SEO strategies.",
      },
      {
        q: "Is SEO suitable for local businesses?",
        a: "Yes. Local SEO helps businesses improve visibility within specific geographic markets, making it easier for nearby customers to find and contact your business.",
      },
    ],
  },
  {
    id: "lead-generation",
    label: "Lead Generation",
    items: [
      {
        q: "How is B2B lead generation different for cybersecurity companies?",
        a: "Cybersecurity buyers are senior, technical, and skeptical, with long, committee-driven sales cycles. Our programs are built around that reality, focusing on trust, precise targeting, and relevance rather than volume.",
      },
      {
        q: "Do you replace or work alongside our sales team?",
        a: "We work alongside your team. We source, engage, and qualify opportunities, then hand off sales-ready meetings so your reps can focus on discovery and closing.",
      },
      {
        q: "How quickly will we start seeing qualified meetings?",
        a: "First conversations typically begin within the first few weeks of launch, while predictable, repeatable pipeline builds over the first quarter as targeting and messaging are refined.",
      },
      {
        q: "Which channels do you use for outreach?",
        a: "We combine email, LinkedIn, and calling with demand generation, then concentrate effort on the channels where your specific buyers respond and convert.",
      },
    ],
  },
];

export const caseStudyCategories = [
  "All",
  "Branding",
  "UI/UX Design",
  "SEO",
] as const;

export type CaseStudyCategory = (typeof caseStudyCategories)[number];

export type CaseStudy = {
  slug: string;
  name: string;
  url: string;
  domain: string;
  description: string;
  tags: Exclude<CaseStudyCategory, "All">[];
  image: string;
  iconUrl?: string;
  metric?: { value: string; label: string };
  /** Vertical or product category shown in the snapshot sidebar. */
  industry?: string;
  /** Narrative sections - rendered on the detail page when present. */
  challenge?: string;
  solution?: string[];
  execution?: string[];
  results?: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "eventus",
    name: "Eventus Security",
    url: "https://eventussecurity.com/",
    domain: "eventussecurity.com",
    description: "AI-powered threat detection and security platform",
    tags: ["SEO", "UI/UX Design"],
    image: "/case-studies/eventus.webp",
    iconUrl: "/clients/eventus-icon.webp",
    metric: { value: "4,081", label: "Monthly organic visitors" },
    industry: "Cybersecurity · SOC & Managed Security",
    challenge:
      "Eventus Security had deep expertise in cybersecurity, but their digital presence **wasn't reflecting their authority**. Their branding lacked consistency, the website didn't explain services clearly, and they weren't ranking for industry-relevant keywords.",
    solution: [
      "Designed a modern brand identity to build trust",
      "Developed a responsive, professional website highlighting SOC services",
      "Structured SEO-driven content around trending security topics",
      "Implemented an SEO strategy targeting high-volume keywords",
      "Built social media assets and campaigns to grow awareness",
    ],
    execution: [
      "Brand Identity",
      "Website Redesign",
      "SEO Dashboard",
      "Social Media Assets",
    ],
    results: [
      "4,081 monthly organic visitors",
      "2,251 keywords indexed (industry + branded)",
      "#1 ranking for 'Cyber Attack India' (3,600 searches/month)",
      "#1 ranking for brand searches ('Eventus Security')",
      "Engaged audience via content and social campaigns",
    ],
  },
  {
    slug: "cleanstart",
    name: "CleanStart",
    url: "https://cleanstart.com/",
    domain: "cleanstart.com",
    description: "Hardened, secure container images built for speed",
    tags: ["Branding", "UI/UX Design"],
    image: "/case-studies/cleanstart.webp",
    iconUrl: "/clients/cleanstart-icon.webp",
    industry: "SaaS Product",
    challenge:
      "CleanStart needed a web presence that matched its technical edge. They offer **hardened, secure container images built for speed**, but the site didn't yet reflect that performance, clarity, or trust.",
    solution: [
      "Developed a brand that speaks security and speed: straightforward, no fluff",
      "Designed and built a clean, intuitive website focused on messaging clarity",
      "Crafted social media visuals and marketing assets to reinforce trust and credibility",
    ],
    execution: [
      "Brand Identity",
      "Website Layout",
      "Social Creatives",
      "Marketing Collateral",
    ],
    results: [
      "User-facing messaging now aligns with real business outcomes: security made simple and fast",
    ],
  },
  {
    slug: "photonmatters",
    name: "PhotonMatters",
    url: "https://photonmatters.com/",
    domain: "photonmatters.com",
    description: "Advanced automation technology, translated for humans",
    tags: ["UI/UX Design"],
    image: "/case-studies/photonmatters.webp",
    iconUrl: "/clients/photonmatters-icon.webp",
    industry: "Automation · Deep-Tech",
    challenge:
      "Photonmatter operates in advanced automation technology. Their brand and website were **too technical, making it hard for investors, clients, and partners to understand their value**.",
    solution: [
      "Refined brand identity to balance innovation with credibility",
      "Translated complex automation tech into simple, compelling messaging",
      "Designed a modern, structured website highlighting solutions and benefits",
      "Built marketing assets to support outreach and partnership growth",
    ],
    execution: [
      "Brand Identity",
      "Website Redesign",
      "Messaging Framework",
      "Marketing Assets",
    ],
    results: [
      "A professional brand identity that communicates authority in automation",
      "Website now clarifies offerings and impact for diverse audiences",
      "Simplified messaging that helps investors and clients see immediate value",
      "A digital foundation ready for scaling awareness and partnerships",
    ],
  },
  {
    slug: "alsonotify",
    name: "Alsonotify",
    url: "https://alsonotify.com/",
    domain: "alsonotify.com",
    description: "SaaS project management with clearer product communication",
    tags: ["UI/UX Design", "Branding"],
    image: "/case-studies/alsonotify.webp",
    industry: "SaaS · Project Management",
    challenge:
      "Alsonotify had a strong tool but no brand presence. Their early website did not explain the product clearly, user journeys were confusing, and they struggled to convert interest into actual sign-ups.",
    solution: [
      "Built a clean brand identity around clarity and trust",
      "Designed a simple, intuitive website showcasing product features",
      "Created user flows to explain value (dashboards, notifications, integrations)",
      "Structured pages for sign-ups, pricing, and product tour",
      "Optimized messaging to focus on pain points like team alignment and task tracking",
    ],
    execution: [
      "Homepage Redesign",
      "Feature Pages",
      "Pricing Page",
      "Sign-up Flow",
    ],
    results: [
      "Clearer product communication leading to fewer drop-offs during trial sign-up",
      "Professional design that matched SaaS standards",
      "Stronger credibility with early adopters and investors",
    ],
  },
  {
    slug: "payweek",
    name: "Payweek",
    url: "https://payweek.com/",
    domain: "payweek.com",
    description: "Payroll made intuitive for employees and powerful for HR",
    tags: ["UI/UX Design"],
    image: "/case-studies/payweek.webp",
    industry: "Fintech · HR & Payroll · SaaS",
    challenge:
      "Payroll systems are often clunky and confusing. Payweek wanted to change that: to build something intuitive enough for employees and powerful enough for HR teams. The goal was a design that looked fresh, worked smoothly on any device, and reduced user errors.",
    solution: [
      "Designed an end-to-end user flow for web and mobile",
      "Built a modular design system for scalability",
      "Simplified complex data views like payslips and reports",
      "Used a calm, minimal color palette for clarity and trust",
      "Focused on micro-interactions that make every action feel seamless",
    ],
    execution: [
      "Web App UI",
      "Mobile Experience",
      "Design System Components",
      "Data & Reporting Screens",
    ],
    results: [
      "A cleaner, more intuitive interface that makes payroll feel approachable",
      "Reduced friction across core flows like viewing payslips and reports",
      "A scalable design system ready for future HR and payroll features",
    ],
  },
];

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About Us" },
];

export const footerNav = [
  ...nav,
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export type Client = { name: string; logo: string };

export const clients: Client[] = [
  { name: "PhotonMatters", logo: "/clients/photonmatters.webp" },
  { name: "Counterpoint Risk", logo: "/clients/counterpoint-risk.webp" },
  { name: "Creative Mind Technologies", logo: "/clients/creative-mind-technologies.webp" },
  { name: "Currycook", logo: "/clients/currycook.webp" },
  { name: "Eventus", logo: "/clients/eventus.webp" },
  { name: "EZIGOLD", logo: "/clients/ezi-gold.webp" },
  { name: "North Star", logo: "/clients/north-star.webp" },
  { name: "Payweek", logo: "/clients/payweek.webp" },
  { name: "CleanStart", logo: "/clients/cleanstart.webp" },
  { name: "Pioneer Metals", logo: "/clients/pioneer-metals.webp" },
  { name: "Support305", logo: "/clients/support305.webp" },
  { name: "The Alfeco Foundation", logo: "/clients/the-alfeco-foundation.webp" },
  { name: "Truenutri", logo: "/clients/truenutri.webp" },
  { name: "Uplyift", logo: "/clients/uplyift.webp" },
  { name: "Veer Aluminium", logo: "/clients/veer-alimunium.webp" },
  { name: "Veer Energy", logo: "/clients/veer-energy.webp" },
  { name: "Veer Steel Mile", logo: "/clients/veer-steel-mile.webp" },
  { name: "GKR Hospitality", logo: "/clients/gkr-logo.webp" },
];

export type Stat = { value: string; label: string; sub?: string };

export const stats: Stat[] = [
  { value: "1,000+", label: "Ideas Pitched" },
  { value: "30,000+", label: "Hours Spent" },
  { value: "30+", label: "Brands Transformed" },
  { value: "230%", label: "SEO Growth in 3 Months" },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  logo?: string;
};

export const testimonials: Testimonial[] = [
  {
    company: "CleanStart",
    logo: "/clients/cleanstart-icon.webp",
    quote:
      "The Fynix Digital team feels more like part of CleanStart than an outside agency. They've helped us shape our website, design social media creatives, and create impactful presentations and datasheets. Always creative, always committed!",
    name: "Pallavi Puri",
    role: "Marketing Specialist",
  },
  {
    company: "PhotonMatters",
    logo: "/clients/photonmatters-icon.webp",
    quote:
      "Excellent work by the Fynix Digital team in putting together a great website in a very short time.",
    name: "Tahseen Jamal",
    role: "Founder & CEO, PhotonMatters",
  },
  {
    company: "Eventus",
    logo: "/clients/eventus-icon.webp",
    quote:
      "Fynix Digital has been our go-to digital marketing agency for over two years now. Brilliant execution, stunning design, and reliable delivery!",
    name: "Sanjay Khera",
    role: "Head of Marketing, Eventus",
  },
  {
    company: "Currycook",
    logo: "/clients/currycook.webp",
    quote:
      "They understood our needs and delivered a fully customized website with great creatives. Highly recommended!",
    name: "Mitesh Patel",
    role: "Founder, Currycook",
  },
];

export type ProcessStep = {
  num: string;
  title: string;
  duration: string;
  /** Inclusive week range. `ongoing` extends the bar past the last week for phases without a fixed end. */
  weeks: { start: number; end: number; ongoing?: boolean };
  /** One-line description used in the compact timeline view. */
  short: string;
  summary: string;
  activities: string[];
  deliverable: string;
};

export const processSteps: ProcessStep[] = [
  {
    num: "01",
    title: "Discover",
    duration: "Week 1",
    weeks: { start: 1, end: 1 },
    short: "Understand your buyer, your pipeline, and the conversation the site needs to have.",
    summary:
      "We start by understanding your buyer, your pipeline, and the shape of the conversation you want the website to have with them.",
    activities: [
      "Stakeholder interviews across product, sales, and marketing",
      "Buyer and analyst research within your category",
      "Analytics, CRM, and search performance audit",
    ],
    deliverable: "Discovery brief with prioritised opportunities",
  },
  {
    num: "02",
    title: "Diagnose",
    duration: "Week 2",
    weeks: { start: 2, end: 2 },
    short: "Separate what is real from what is assumed across the funnel.",
    summary:
      "We separate what is real from what is assumed: where trust breaks, where speed leaks, where visibility disappears, where intent goes cold.",
    activities: [
      "UX and messaging audit against buyer intent",
      "Technical and Core Web Vitals audit",
      "SEO/AEO and keyword landscape analysis",
    ],
    deliverable: "Diagnosis report with a ranked action list",
  },
  {
    num: "03",
    title: "Design",
    duration: "Weeks 3–5",
    weeks: { start: 3, end: 5 },
    short: "Design each screen around a business outcome, not a design opinion.",
    summary:
      "We design the experience around your buyer's questions, not around a design opinion. Each screen defends itself against a business outcome.",
    activities: [
      "Information architecture and journey mapping",
      "High-fidelity interface design and prototypes",
      "Copy direction aligned to search and buying intent",
    ],
    deliverable: "Design system and interactive prototype",
  },
  {
    num: "04",
    title: "Build",
    duration: "Weeks 5–9",
    weeks: { start: 5, end: 9 },
    short: "Ship on a modern stack with Core Web Vitals as a hard gate.",
    summary:
      "We ship the site on a modern component-driven stack, with Core Web Vitals treated as a hard gate before anything leaves staging.",
    activities: [
      "Custom front-end build on a headless stack",
      "CMS, CRM, and analytics integrations",
      "Accessibility and performance QA against WCAG AA",
    ],
    deliverable: "Production-ready website and content system",
  },
  {
    num: "05",
    title: "Launch",
    duration: "Week 10",
    weeks: { start: 10, end: 10 },
    short: "Migrate carefully, monitor closely, stay reachable through the first days.",
    summary:
      "Launch is a handover, not a farewell. We migrate carefully, monitor closely, and stay reachable during the first days that matter most.",
    activities: [
      "Redirect map, migration, and SEO safety net",
      "Analytics, conversion tracking, and dashboards",
      "Post-launch monitoring and rapid-fix window",
    ],
    deliverable: "Live website with launch report",
  },
  {
    num: "06",
    title: "Grow",
    duration: "Ongoing",
    weeks: { start: 10, end: 14, ongoing: true },
    short: "Run a monthly cycle of experiments, content, and outreach tied to pipeline.",
    summary:
      "The website becomes a system that keeps learning. We run a monthly cycle of experiments, content, and outbound aligned to pipeline outcomes.",
    activities: [
      "Monthly experiment and content roadmap",
      "SEO/AEO authority building and outreach",
      "Pipeline reporting tied to revenue outcomes",
    ],
    deliverable: "Ongoing growth partnership with monthly review",
  },
];

export type TeamMember = {
  initials: string;
  name: string;
  role: string;
  focus: string;
};

export const team: TeamMember[] = [
  {
    initials: "SA",
    name: "Strategy Lead",
    role: "Discovery & buyer research",
    focus:
      "Runs the first three weeks: understands your ICP, audits the funnel, and defines what the website needs to prove.",
  },
  {
    initials: "DL",
    name: "Design Lead",
    role: "UX, interface, systems",
    focus:
      "Owns how the experience feels. Turns buyer intent into interfaces buyers actually complete conversations with.",
  },
  {
    initials: "EL",
    name: "Engineering Lead",
    role: "Front-end, performance, integrations",
    focus:
      "Builds the site to enterprise standards: accessible, fast, secure, and easy for your team to keep growing.",
  },
  {
    initials: "GL",
    name: "Growth Lead",
    role: "SEO/AEO, content, demand",
    focus:
      "Turns visibility into pipeline. Runs the ongoing cycle of search, content, and outbound after launch.",
  },
];

export type EngagementModel = {
  name: string;
  price: string;
  duration: string;
  bestFor: string;
  scope: string[];
  featured?: boolean;
};

export const engagementModels: EngagementModel[] = [
  {
    name: "Discovery Sprint",
    price: "Fixed fee",
    duration: "2–3 weeks",
    bestFor: "Teams who suspect a problem but **need it named precisely**.",
    scope: [
      "Buyer, funnel, and analytics review",
      "UX, technical, and SEO/AEO audit",
      "Prioritised action list with sizing",
    ],
  },
  {
    name: "Full Engagement",
    price: "Project fee",
    duration: "10–14 weeks",
    bestFor: "Teams ready to rebuild the website **as a growth system**.",
    scope: [
      "Discovery, design, build, launch",
      "SEO/AEO strategy and content system",
      "Post-launch monitoring and handover",
    ],
    featured: true,
  },
  {
    name: "Growth Retainer",
    price: "Monthly",
    duration: "6-month minimum",
    bestFor: "Teams with a website in place who need **pipeline outcomes**.",
    scope: [
      "Monthly experiment and content roadmap",
      "SEO/AEO authority building",
      "Pipeline reporting and QBRs",
    ],
  },
];

export const siteConfig = {
  name: "Fynix Digital",
  // Canonical host is the www apex — the production server redirects the bare
  // fynix.digital → www.fynix.digital, so canonical/sitemap/OG/robots must use
  // www to match, otherwise every canonical URL points at a 307 redirect (which
  // costs real users an extra hop and sends search engines mixed signals).
  url: "https://www.fynix.digital",
  email: "hello@fynix.digital",
  phone: "+91 789 789 6607",
  phoneHref: "+917897896607",
  locations: "London & Bengaluru",
  address: {
    line1: "Office No. 2617, 26th Floor, Solus Building, Hiranandani Estate,",
    line2: "Ghodbunder Road, Thane West, Maharashtra 400607",
  },
  gst: "27AAICD9268J1Z0",
  description:
    "We help companies transform their websites into growth engines through UI/UX, technical excellence, AI-ready SEO, and predictable lead generation.",
};

/**
 * Single source of truth for "is this the real production site?".
 *
 * Both the `<meta robots>` tag (app/layout.tsx) and robots.txt (app/robots.ts)
 * gate crawling/indexing on this — so they can never disagree and accidentally
 * `noindex` production while robots.txt says "allow" (or vice versa). Only the
 * live production deploy should be indexable; every preview/other environment
 * is kept out of the index.
 */
export function isProductionSite(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SITE_URL?.includes("fynix.digital") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.includes("fynix.digital") ||
    process.env.VERCEL_ENV === "production",
  );
}

export type FrameworkStep = {
  num: string;
  stepLabel: string;
  title: string;
  description: string;
};

export const frameworkSteps: FrameworkStep[] = [
  {
    num: "01",
    stepLabel: "Step 1",
    title: "Discover",
    description: "We understand your business, market, competitors, and customers.",
  },
  {
    num: "02",
    stepLabel: "Step 2",
    title: "Strategize",
    description: "We build a tailored digital growth roadmap aligned with your objectives.",
  },
  {
    num: "03",
    stepLabel: "Step 3",
    title: "Execute",
    description: "Our specialists implement, optimize, and continuously improve every initiative.",
  },
  {
    num: "04",
    stepLabel: "Step 4",
    title: "Grow",
    description: "We measure performance, uncover new opportunities, and help your business scale sustainably.",
  },
];

