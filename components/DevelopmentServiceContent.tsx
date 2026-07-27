import Link from "next/link";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import SectionSeam from "@/components/SectionSeam";
import { siteConfig, type Act } from "@/lib/content";

/**
 * Dedicated Website Development Services page content.
 *
 * Server Component rendered by `/services/[slug]` when the slug is "development".
 * The other acts continue to use the generic service template. Copy is sourced
 * from the Fynix Website Development Services brief and styled to match the
 * site's existing service-page design system (dark hero, editorial serif,
 * copper accent, JSON-LD structured data).
 */

type DevService = {
  name: string;
  tagline: string;
  description: string;
  items: string[];
  result: string;
};

const devServices: DevService[] = [
  {
    name: "Custom Website Development",
    tagline: "Tailored Solutions for Your Business",
    description:
      "Every business is different. Your website should be too. We build custom websites that reflect your brand, support your business objectives, and deliver exceptional user experiences.",
    items: [
      "Corporate Websites",
      "B2B Websites",
      "Business Portals",
      "Landing Pages",
      "Product Websites",
      "Marketing Websites",
      "Service Websites",
      "Custom Functionality",
    ],
    result:
      "Every solution is designed around your business requirements, customer journey, and long-term goals.",
  },
  {
    name: "Next.js Development",
    tagline: "Fast, Secure and Future-Ready Websites",
    description:
      "Modern businesses need websites that deliver exceptional speed, security, and performance. We build high-performance websites using Next.js, enabling faster page loads, improved search visibility, enhanced user experiences, and better scalability.",
    items: [
      "Server-Side Rendering",
      "Static Site Generation",
      "Performance Optimization",
      "API Integrations",
      "Headless CMS Integration",
      "SEO-Friendly Architecture",
      "Responsive Development",
      "Modern Front-End Development",
    ],
    result:
      "Next.js provides the flexibility and performance needed to support today's digital experiences and tomorrow's business growth.",
  },
  {
    name: "WordPress Development",
    tagline: "Flexible Content Management for Growing Businesses",
    description:
      "WordPress remains one of the world's most popular content management systems because of its flexibility and ease of use. We develop secure, scalable WordPress websites that are easy to manage while maintaining excellent performance and search visibility.",
    items: [
      "Custom Theme Development",
      "Custom Plugin Integration",
      "CMS Configuration",
      "Blog Development",
      "Landing Pages",
      "Security Hardening",
      "Performance Optimization",
      "Ongoing Support",
    ],
    result:
      "We focus on creating WordPress websites that are easy to maintain without compromising speed or security.",
  },
  {
    name: "Website Migration",
    tagline: "Migrate Without Losing Performance or Visibility",
    description:
      "Website migrations require careful planning to protect your search rankings, website functionality, and user experience. Whether you're moving from WordPress to Next.js, redesigning your website, or changing hosting providers, we manage every stage of the migration process.",
    items: [
      "Website Planning",
      "URL Mapping",
      "Redirect Management",
      "Content Migration",
      "SEO Preservation",
      "Performance Testing",
      "Quality Assurance",
      "Post-Migration Monitoring",
    ],
    result:
      "We ensure your transition is smooth while protecting the digital authority you've already built.",
  },
  {
    name: "Website Maintenance & Optimization",
    tagline: "Keep Your Website Secure, Fast and Reliable",
    description:
      "Launching your website is only the beginning. Regular maintenance ensures your website remains secure, performs efficiently, and continues delivering an exceptional experience for your customers.",
    items: [
      "Security Updates",
      "Performance Monitoring",
      "Backup Management",
      "Bug Fixes",
      "Technical Improvements",
      "Plugin & Dependency Management",
      "Uptime Monitoring",
      "Continuous Optimization",
    ],
    result:
      "We proactively maintain your website so your team can focus on running the business.",
  },
];

const devProcess: { step: string; text: string }[] = [
  {
    step: "Discover",
    text: "We begin by understanding your business goals, users, technical requirements, and growth objectives.",
  },
  {
    step: "Plan",
    text: "We create the website architecture, define user journeys, and establish a scalable technical foundation.",
  },
  {
    step: "Design",
    text: "Our UI/UX team develops intuitive user experiences and modern visual interfaces that reflect your brand.",
  },
  {
    step: "Develop",
    text: "Our developers build secure, responsive, and high-performing websites using modern technologies and best practices.",
  },
  {
    step: "Launch & Optimize",
    text: "After thorough testing and quality assurance, we launch your website and continue optimizing its performance based on real user behavior.",
  },
];

const outcomes: string[] = [
  "Improve User Experience",
  "Increase Search Visibility",
  "Strengthen Brand Credibility",
  "Generate Qualified Leads",
  "Support Marketing Campaigns",
  "Scale with Business Growth",
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

const devFaqs: { q: string; a: string }[] = [
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
];

// Prose kept as string constants so JSX stays free of unescaped-entity issues.
const heroCopy1 =
  "Your website is your most valuable digital asset. We build fast, secure, and scalable websites that strengthen your brand and drive business growth.";
// const heroCopy2 =
//   "Whether you're launching a new website, modernizing an existing platform, or migrating to a modern technology stack, we build digital experiences that support your business today and scale with your growth tomorrow.";
const whyCopy1 =
  "Your website is often the first impression customers have of your business. A slow, outdated, or difficult-to-use website can reduce trust, limit visibility, and cost you valuable business opportunities.";
const whyCopy2 =
  "A modern website should do more than look good. It should load quickly, perform seamlessly across devices, support your marketing efforts, and guide visitors toward meaningful actions.";
const whyCopy3 =
  "Our development approach combines performance, usability, security, and scalability to create websites that deliver measurable business value.";
const servicesIntro =
  "Every business has unique goals, audiences, and technical requirements. We develop websites that align with your objectives while providing the flexibility to support future growth.";
const whyChooseP1 =
  "We don't just build websites. We create digital platforms that help businesses attract customers, build trust, and support sustainable growth.";
const whyChooseLead = "Every website we develop is designed to:";
const whyChooseOutro =
  "By combining strategy, design, development, and performance optimization, we deliver websites that become valuable business assets rather than static online brochures.";
const industriesIntro =
  "We build websites for organizations across a wide range of industries, including:";
const industriesOutro =
  "Every website is designed around your industry, your customers, and your business objectives.";
const arrowPath = "M14 5l7 7m0 0l-7 7m7-7H3";

type Props = { act: Act };

export default function DevelopmentServiceContent({ act }: Props) {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Website Development Services for cybersecurity and B2B companies",
    serviceType: "Website Development",
    description:
      "Custom, Next.js, and WordPress website development for B2B businesses: fast, secure, scalable sites with migration and ongoing maintenance that deliver measurable business value.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Global",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Website development offerings",
      itemListElement: devServices.map((s) => ({
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
    mainEntity: devFaqs.map((faq) => ({
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
              Websites Built for{" "}
              <span className="font-serif italic text-[#e9af88] md:block">
                Business Growth
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
                Book a Website Consultation
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY WEBSITE DEVELOPMENT MATTERS */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
                Your Website Should Work as Hard as Your Business
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

      {/* OUR WEBSITE DEVELOPMENT SERVICES */}
      <section
        id="development-services"
        className="py-24 md:py-32 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              Modern Websites Built for Performance and Growth
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {servicesIntro}
            </p>
          </Reveal>

          <div className="space-y-6 md:space-y-8">
            {devServices.map((svc, idx) => (
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

      {/* OUR DEVELOPMENT PROCESS */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Structured Approach to Building Better Websites
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {devProcess.map((phase, idx) => (
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
                Websites Designed for Long-Term Business Growth
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
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-8">
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
              Website Development for Modern Businesses
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
              {devFaqs.map((faq, idx) => (
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
            Ready to Build a Website That Supports Business Growth?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
            >
              Book Your Free Website Consultation
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
