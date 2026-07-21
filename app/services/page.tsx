import type { Metadata } from "next";
import Link from "next/link";
import ActsStack from "@/components/ActsStack";
import Reveal from "@/components/Reveal";
import EngagementModels from "@/components/EngagementModels";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import SectionSeam from "@/components/SectionSeam";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import { acts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Fynix delivers UI/UX, custom development, technical SEO/AEO, and B2B lead generation for cybersecurity companies, delivered as one integrated growth system.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-16 md:pb-24 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl md:text-6xl text-white font-medium leading-tight max-w-4xl">
            The Four Growth Acts.{" "}
            <span className="font-serif italic text-[#e9af88] md:block">One connected system.</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl">
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

      <SectionSeam from="soft" to="white" />

      <EngagementModels />

      <SectionSeam from="white" to="soft" />

      <section className="relative isolate overflow-hidden pt-16 md:pt-20 pb-20 md:pb-28 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-4xl md:text-5xl text-primary font-medium leading-tight">
            Not sure which pillar to start with?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
            >
              Book a discovery call
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
