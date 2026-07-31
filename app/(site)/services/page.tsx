import type { Metadata } from "next";
import Link from "next/link";
import ActsStack from "@/components/ActsStack";
import Reveal from "@/components/Reveal";
import ProcessTimeline from "@/components/ProcessTimeline";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import { acts, siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Web Design, SEO & Growth Services",
  description:
    "Fynix delivers UI/UX design, custom web development, technical SEO/AEO, and B2B lead generation for growing companies, delivered as one integrated growth system.",
  alternates: { canonical: "/services" },
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
      name: "Services",
      item: `${siteConfig.url}/services`,
    },
  ],
};

export default function ServicesPage() {
  return (
    <>
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 md:min-h-[491px] bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[64px] text-white font-medium leading-tight max-w-4xl">
            The Four Growth Acts.{" "}
            <span className="font-serif italic text-[#e9af88] md:block">One connected system.</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg font-normal leading-relaxed mt-6 max-w-2xl">
            A potential client forms a brand perception in seconds. Our four interconnected
            pillars build trust, guarantee speed, secure visibility, and generate pipeline.
          </p>
        </div>
      </section>

      <section className="pt-4 md:pt-8 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <ActsStack acts={acts} />
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────────── */}
      <section aria-label="Timeline" className="pt-16 md:pt-20 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-4xl mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight text-balance">
              From first call to a live growth system.
            </h2>
          </Reveal>

          <ProcessTimeline />
        </div>
      </section>

      <section className="relative isolate overflow-hidden pt-16 md:pt-20 pb-10 md:pb-15 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-4xl md:text-5xl text-primary font-medium leading-tight">
            Not sure which pillar to start with?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
            >
              Book a discovery call
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
