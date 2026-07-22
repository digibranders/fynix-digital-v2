import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CaseStudiesGrid from "@/components/CaseStudiesGrid";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Selected projects across branding, UI/UX, SEO, social, and video: the systems Fynix has shipped for cybersecurity and product companies.",
  alternates: { canonical: "/case-studies" },
};

export default function CaseStudiesPage() {
  return (
    <>
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-5xl md:text-7xl text-white font-medium leading-[1.05] tracking-tight">
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

      <section className="pt-4 md:pt-8 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <CaseStudiesGrid />
        </div>
      </section>

      <section className="relative isolate overflow-hidden pt-16 md:pt-20 pb-20 md:pb-28 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-4xl md:text-5xl text-primary font-medium leading-tight">
            Build what you&apos;ve been thinking about.
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
            >
              Start a conversation
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
