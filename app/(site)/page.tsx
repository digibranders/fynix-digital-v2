import type { Metadata } from "next";
import Link from "next/link";
import { acts, caseStudies } from "@/lib/content";
import ActPreviewPanels from "@/components/ActPreviewPanels";
import FeaturedCaseStudies from "@/components/FeaturedCaseStudies";
import Reveal from "@/components/Reveal";
import TrustedBy from "@/components/TrustedBy";
import ImpactStats from "@/components/ImpactStats";
import TestimonialsRail from "@/components/TestimonialsRail";
import SpotlightBackdrop from "@/components/SpotlightBackdrop";
// import HeroMetrics from "@/components/HeroMetrics";
import SpotlightInitiation from "@/components/SpotlightInitiation";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import OrganicPerformanceOverview from "@/components/OrganicPerformanceOverview";
import GrowthFramework from "@/components/GrowthFramework";
import SectionSeam from "@/components/SectionSeam";
import TechnicalSeoAudit from "@/components/TechnicalSeoAudit";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s | Fynix" template so the
  // homepage <title> is exactly this string.
  title: { absolute: "Fynix Digital | A digital marketing company for Growing Brands" },
};

export default function Home() {

  return (
    <>
      {/* HERO */}
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 lg:pt-36 pb-24 lg:pb-28 bg-primary text-white"
      >
        <HeroDarkBackdrop />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-center">
            <div className="md:col-span-6 lg:col-span-5 flex flex-col items-start">
              {/* Eyebrow */}
              <p className="text-[17px] sm:text-xl md:text-2xl font-semibold text-white/90 mb-3 tracking-tight text-left whitespace-nowrap">
                A digital marketing studio for
              </p>

              {/* Headline using Figtree font as requested */}
              <h1 className="font-sans text-6xl sm:text-7xl lg:text-[76px] xl:text-[92px] font-extrabold tracking-tight text-white leading-[1.02] text-left">
                Growing <br />
                <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#e9af88] to-[#ffb57e] tracking-tight">Brands</span>
              </h1>

              {/* Glowing Divider & Lens Flare */}
              <div className="relative w-full max-w-md h-[1.5px] mt-7 mb-8 bg-gradient-to-r from-[#e9af88]/60 via-[#ffb57e]/25 to-transparent">
                <div className="hero-lens absolute top-1/2 -translate-y-1/2">
                  {/* Central core */}
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_2px_#ffb57e,0_0_16px_4px_#e9af88]" />
                  {/* Horizontal light beam */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-[1px] bg-gradient-to-r from-transparent via-[#ffd5b4] to-transparent" />
                  {/* Vertical light beam */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-5 bg-gradient-to-b from-transparent via-[#ffd5b4] to-transparent" />
                </div>
              </div>

              <p className="text-base md:text-lg font-normal leading-relaxed max-w-xl text-left text-white/70">
              Helping B2B companies build visibility, earn trust, and generate qualified opportunities, with specialized expertise in cybersecurity.
              </p>

              {/* Pill Button with copper-gold gradient */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/contact"
                  className="cta-glide inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#e9af88] to-[#ffd2b3] text-[#0C1E2E] hover:brightness-105 font-bold rounded-full shadow-sm text-center group text-base"
                >
                  Let&apos;s Start Improving
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>

            </div>

            {/* Hidden on mobile (< md), visible on tablet & desktop (md:flex) */}
            <div className="hidden md:flex md:col-span-6 lg:col-span-7 w-full justify-center lg:justify-end">
              <OrganicPerformanceOverview />
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <TrustedBy />

      {/* FOUR ACTS PREVIEW */}
      <section className="pt-12 md:pt-20 pb-8 md:pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6 mb-14 md:mb-16">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium text-balance">
              Your Complete <span className="font-serif italic font-medium">Growth Ecosystem</span>
              </h2>
              <p className="mt-4 text-base md:text-lg text-text-muted font-normal leading-relaxed">
              Growth isn&apos;t driven by a single service. It comes from aligning strategy, technology, user experience, and customer acquisition.
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-semibold uppercase tracking-widest text-accent-strong border-b border-accent-strong pb-1 hover:text-primary hover:border-primary cta-underline transition-all duration-200"
            >
              Explore Services
            </Link>
          </div>

          <Reveal>
            <ActPreviewPanels acts={acts} />
          </Reveal>
        </div>
      </section>

      {/* CASE STUDY TEASER */}
      <section className="relative isolate overflow-hidden pt-8 md:pt-32 pb-16 md:pb-32 bg-transparent">
        <SpotlightBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium">
                Case Studies
              </h2>
              <p className="mt-4 text-base md:text-lg text-text-muted font-normal leading-relaxed">
              Explore how we&apos;ve helped businesses improve visibility, strengthen their digital presence
              <br />
              and generate measurable growth across multiple industries.
              </p>
            </div>
            <Link
              href="/case-studies"
              className="text-xs font-semibold uppercase tracking-widest text-accent-strong border-b border-accent-strong pb-1 hover:text-primary hover:border-primary cta-underline transition-all duration-200 mt-4 md:mt-0"
            >
              View All Case Studies
            </Link>
          </div>

          <FeaturedCaseStudies studies={caseStudies.slice(0, 3)} />
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* GROWTH FRAMEWORK */}
      <GrowthFramework />

      {/* IMPACT STATS */}
      <ImpactStats />

      {/* TESTIMONIALS */}
      <TestimonialsRail />

      <SectionSeam from="soft" to="white" />

      {/* FREE TECHNICAL SEO AUDIT */}
      <TechnicalSeoAudit />

      {/* CTA */}
      <SpotlightInitiation />
    </>
  );
}
