import Link from "next/link";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import { siteConfig, type Act } from "@/lib/content";

/**
 * Dedicated UI/UX Design Services page content.
 *
 * Server Component rendered by `/services/[slug]` when the slug is "ui-ux".
 * The other acts continue to use the generic service template. Copy is sourced
 * from the Fynix UI/UX Design Services brief and styled to match the site's
 * existing service-page design system (dark hero, editorial serif, copper
 * accent, JSON-LD structured data).
 */

type UiUxService = {
  name: string;
  tagline: string;
  description: string;
  items: string[];
  result: string;
};

const uiuxServices: UiUxService[] = [
  {
    name: "UX Research",
    tagline: "Design Based on User Insights",
    description:
      "Every successful digital experience begins with understanding the people who use it. Our UX research helps uncover user needs, expectations, pain points, and behaviors to ensure every design decision is backed by evidence rather than assumptions.",
    items: [
      "User Research",
      "Stakeholder Workshops",
      "Customer Interviews",
      "User Personas",
      "Journey Mapping",
      "Competitive Analysis",
      "Usability Studies",
      "Information Gathering",
    ],
    result:
      "The outcome is a clear understanding of your users and a strong foundation for better design decisions.",
  },
  {
    name: "User Experience Design",
    tagline: "Create Seamless Customer Journeys",
    description:
      "User experience is about making every interaction effortless. We design logical user flows and intuitive experiences that reduce friction, simplify navigation, and help users accomplish their goals quickly.",
    items: [
      "User Journey Mapping",
      "Information Architecture",
      "User Flows",
      "Wireframing",
      "Content Hierarchy",
      "Navigation Design",
      "Interaction Design",
      "Accessibility Best Practices",
    ],
    result:
      "Our objective is to create experiences that improve engagement while supporting your business goals.",
  },
  {
    name: "User Interface Design",
    tagline: "Build Interfaces That Inspire Confidence",
    description:
      "Visual design plays a critical role in how customers perceive your business. Our UI designers create clean, modern, and consistent interfaces that strengthen your brand while making digital experiences easy to understand and enjoyable to use.",
    items: [
      "Website Interface Design",
      "SaaS Dashboard Design",
      "Mobile App Design",
      "Responsive Design",
      "Design Systems",
      "Component Libraries",
      "Visual Design",
      "Prototyping",
    ],
    result:
      "Every interface is designed to improve usability while maintaining consistency across your digital ecosystem.",
  },
  {
    name: "UX Audit",
    tagline: "Identify Opportunities to Improve Performance",
    description:
      "Your website may already be attracting visitors, but are they converting? A UX audit helps identify usability issues, friction points, accessibility challenges, and conversion barriers that affect user satisfaction and business performance.",
    items: [
      "Heuristic Evaluation",
      "Navigation Review",
      "Accessibility Assessment",
      "Mobile Experience Review",
      "User Flow Analysis",
      "Conversion Analysis",
      "Design Consistency Review",
      "Actionable Recommendations",
    ],
    result:
      "We help you prioritize improvements that have the greatest impact on customer experience and conversions.",
  },
];

const designProcess: { step: string; text: string }[] = [
  {
    step: "Discover",
    text: "We learn about your business, users, objectives, and challenges.",
  },
  {
    step: "Research",
    text: "We gather insights through research, analytics, and competitor analysis.",
  },
  {
    step: "Design",
    text: "We create wireframes, prototypes, and visual interfaces focused on usability and business outcomes.",
  },
  {
    step: "Validate",
    text: "We test designs with users, collect feedback, and refine the experience.",
  },
  {
    step: "Deliver",
    text: "We hand over scalable, developer-ready designs supported by design systems and documentation.",
  },
];

const outcomes: string[] = [
  "Increase Customer Trust",
  "Improve User Satisfaction",
  "Boost Conversion Rates",
  "Reduce User Friction",
  "Strengthen Brand Perception",
  "Support Long-Term Growth",
];

const industries: string[] = [
  "Cybersecurity",
  "SaaS",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Professional Services",
  "Technology",
];

const uiuxFaqs: { q: string; a: string }[] = [
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
];

// Prose kept as string constants so JSX stays free of unescaped-entity issues.
const heroCopy1 =
  "Great digital experiences are built with purpose. We design intuitive UI/UX that improves usability, builds trust, and drives growth.";
// const heroCopy2 =
//   "Whether you're launching a new product, redesigning your website, or improving an existing platform, our UI/UX solutions are built to deliver measurable business outcomes.";
const whyCopy1 =
  "Your website or application is often the first interaction customers have with your brand. A confusing interface, slow user journey, or poor experience can reduce engagement and drive potential customers away.";
const whyCopy2 =
  "Effective UI/UX design helps visitors find information faster, complete tasks with confidence, and build trust in your business. The result is higher engagement, improved customer satisfaction, and better conversion rates.";
const whyCopy3 =
  "Our design approach balances business goals with user needs to create experiences that are simple, accessible, and enjoyable.";
const servicesIntro =
  "Every business, product, and customer journey is different. We design experiences that align with your users' expectations while supporting your business objectives.";
const whyChooseP1 =
  "We believe great design should solve problems, not create them. Every interface we design is guided by user behavior, business strategy, and measurable outcomes.";
const whyChooseLead =
  "Our team combines research, strategy, creativity, and technology to deliver experiences that help businesses:";
const whyChooseOutro = "We don't design for awards. We design for results.";
const industriesIntro =
  "Our team designs digital experiences for businesses across multiple industries, including:";
const industriesOutro =
  "Every solution is tailored to your customers, industry, and business objectives.";

const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

type Props = { act: Act };

export default function UiUxServiceContent({ act }: Props) {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "UI/UX Design Services for cybersecurity and B2B companies",
    serviceType: "UI/UX Design",
    description:
      "User-centered UI/UX design for B2B businesses: UX research, user experience design, interface design, and UX audits that improve usability, trust, and conversions.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "UI/UX design offerings",
      itemListElement: uiuxServices.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.description,
        },
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: uiuxFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
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
        name: act.title,
        item: `${siteConfig.url}/services/${act.slug}`,
      },
    ],
  };

  return (
    <>
      {/* HERO */}
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[67.2px] text-white font-medium tracking-tight leading-[1.08] text-balance">
              Design with{" "}
              <span className="font-serif italic text-[#e9af88] md:block">
                Clear Purpose
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mt-8 max-w-2xl">
              {heroCopy1}
            </p>
            {/* <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mt-5 max-w-2xl">
              {heroCopy2}
            </p> */}

            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/contact"
                className="cta-glide inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#e9af88] to-[#ffd2b3] text-[#0C1E2E] hover:brightness-105 font-bold rounded-full shadow-sm text-center"
              >
                Book a UI/UX Consultation
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY UI/UX MATTERS */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Great Design Creates Better Business Outcomes
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={120}>
              <p className="font-serif text-xl md:text-2xl text-primary font-normal leading-relaxed">
                {whyCopy1}
              </p>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
                {whyCopy2}
              </p>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
                {whyCopy3}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* OUR UI/UX SERVICES */}
      <section
        id="uiux-services"
        className="py-24 md:py-32 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              End-to-End Design Solutions
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {servicesIntro}
            </p>
          </Reveal>

          <div className="space-y-6 md:space-y-8">
            {uiuxServices.map((svc, idx) => (
              <Reveal key={svc.name} delay={idx * 60}>
                <article className="rounded-lg border border-border bg-white p-8 md:p-12 hover:border-accent/40 transition-colors duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-5">
                      <span className="text-xs font-mono text-accent font-semibold tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-3">
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
                            <span
                              aria-hidden
                              className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-text-muted text-sm font-normal leading-relaxed mt-8 pt-6 border-t border-border">
                        {svc.result}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* OUR DESIGN PROCESS */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Structured Approach to Better Experiences
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {designProcess.map((phase, idx) => (
              <Reveal key={phase.step} delay={idx * 80}>
                <li className="h-full p-6 border border-border rounded-lg bg-background-soft/40 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <span className="text-xs font-mono text-accent font-semibold tabular-nums">
                    Step {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-xl text-primary font-medium mt-3">
                    {phase.step}
                  </h3>
                  <p className="text-sm text-text-muted font-normal mt-3 leading-relaxed">
                    {phase.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* WHY CHOOSE FYNIX */}
      <section className="py-24 md:py-32 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Design That Delivers Business Value
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={120}>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed">
                {whyChooseP1}
              </p>
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
                {whyChooseLead}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-center gap-3 rounded-lg border border-border bg-white px-5 py-4 text-primary font-medium"
                  >
                    <span aria-hidden className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                    {outcome}
                  </li>
                ))}
              </ul>
              <p className="font-serif italic text-xl md:text-2xl text-primary font-medium mt-8">
                {whyChooseOutro}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* INDUSTRIES WE SUPPORT */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-12 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              UI/UX Solutions for Modern Businesses
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {industriesIntro}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <ul className="flex flex-wrap gap-3">
              {industries.map((industry) => (
                <li
                  key={industry}
                  className="inline-flex items-center gap-2.5 rounded-full border border-border bg-background-soft/50 px-5 py-2.5 text-primary font-medium"
                >
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                  {industry}
                </li>
              ))}
            </ul>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-10 max-w-2xl">
              {industriesOutro}
            </p>
          </Reveal>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* FAQ */}
      <section className="py-24 md:py-32 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Frequently Asked Questions
              </h2>
              <Link
                href="/faqs"
                className="mt-6 inline-flex items-center gap-2 text-xs uppercase font-semibold text-accent tracking-widest"
              >
                All FAQs <span aria-hidden>&rarr;</span>
              </Link>
            </Reveal>
            <div className="lg:col-span-8 divide-y divide-border border-t border-border">
              {uiuxFaqs.map((faq, idx) => (
                <Reveal key={faq.q} delay={idx * 80}>
                  <details className="group py-6">
                    <summary className="flex items-start justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <h3 className="font-serif text-xl md:text-2xl text-primary font-medium leading-snug transition-colors group-hover:text-accent">
                        {faq.q}
                      </h3>
                      <span
                        aria-hidden
                        className="mt-1 shrink-0 text-accent transition-transform duration-300 group-open:rotate-45"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="hidden group-open:block text-base text-text-muted font-normal leading-relaxed mt-4 max-w-2xl">
                      {faq.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden py-24 md:py-32 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-3xl md:text-5xl text-primary font-medium leading-tight">
            Ready to Create Better Digital Experiences?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
            >
              Book Your Free UI/UX Consultation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
              </svg>
            </Link>
          </div>
        </Reveal>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
