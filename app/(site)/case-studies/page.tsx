import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CaseStudiesGrid from "@/components/CaseStudiesGrid";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case Studies & Proven Results",
  description:
    "Selected projects across branding, UI/UX, SEO, social, and video: the growth systems Fynix has shipped for B2B and technology product companies.",
  alternates: { canonical: "/case-studies" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteConfig.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Case Studies",
      item: `${siteConfig.url}/case-studies`,
    },
  ],
};

export default function CaseStudiesPage() {
  return (
    <>
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 md:min-h-[491px] bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[64px] text-white font-medium leading-[1.05] tracking-tight">
            Turning ideas <br />
            <span className="font-serif italic text-[#e9af88]">into vision.</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg font-normal leading-relaxed mt-6 max-w-2xl">
            A selection of the platforms, brands, and growth systems we&apos;ve shipped.
            <br />
            Every project is live in production. Click through to see the work in the wild.
          </p>
        </div>
      </section>

      <section className="pt-10 md:pt-14 pb-4 md:pb-6 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal>
            <Link
              href="/case-studies/lead-generation-up"
              className="group relative isolate block overflow-hidden rounded-2xl border border-border bg-primary text-white"
            >
              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12">
                <div className="lg:col-span-8">
                  <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-accent">
                    Featured · Lead Generation
                  </span>
                  <h2 className="mt-5 font-serif text-3xl md:text-4xl lg:text-5xl text-white font-medium leading-[1.1] tracking-tight max-w-2xl">
                    How we delivered{" "}
                    <span className="text-accent">6×</span>{" "}
                    <span className="text-accent">ROI</span> for a
                    cloud security company in India.
                  </h2>
                  <span className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent">
                    Read the case study
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
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
                  </span>
                </div>
                <div className="lg:col-span-4 flex flex-wrap lg:flex-col justify-between gap-6 lg:border-l lg:border-white/10 lg:pl-10">
                  {[
                    { value: "60", label: "Meetings" },
                    { value: "78%", label: "C-level" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="font-serif italic text-4xl md:text-5xl text-accent leading-none tabular-nums">
                        {s.value}
                      </div>
                      <div className="mt-1.5 text-xs text-white/60 font-normal">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="pt-4 md:pt-8 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <CaseStudiesGrid />
        </div>
      </section>

      <section className="relative isolate overflow-hidden pt-16 md:pt-20 pb-16 md:pb-20 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-4xl md:text-5xl text-primary font-medium leading-tight">
            Build what you&apos;ve been thinking about.
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
            >
              Start a conversation
            </Link>
          </div>
        </Reveal>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
