import type { Metadata } from "next";
import Link from "next/link";
import ActsStack from "@/components/ActsStack";
import ServiceCard from "@/components/ServiceCard";
import Reveal from "@/components/Reveal";
import EngagementModels from "@/components/EngagementModels";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
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
      <section className="pt-12 md:pt-20 pb-14 md:pb-20 bg-gradient-to-b from-white to-background-soft">
        <Reveal className="max-w-7xl mx-auto px-6 md:px-12">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
            Capabilities
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-primary font-normal mt-3 leading-tight max-w-4xl">
            The Four Growth Acts.{" "}
            <span className="md:block">One connected system.</span>
          </h1>
          <p className="text-text-muted text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl">
            A potential client forms a brand perception in{" "}
            <strong className="font-medium text-primary">seconds</strong>. Our four interconnected
            pillars <strong className="font-medium text-primary">build trust</strong>,{" "}
            <strong className="font-medium text-primary">guarantee speed</strong>,{" "}
            <strong className="font-medium text-primary">secure visibility</strong>, and{" "}
            <strong className="font-medium text-primary">generate pipeline</strong>.
          </p>
        </Reveal>
      </section>

      <section className="pt-4 md:pt-8 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <ActsStack acts={acts} />
        </div>
      </section>

      <section className="pt-16 md:pt-24 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
              Service Catalog
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-normal mt-2">
              Built for cybersecurity marketing and growth teams
            </h2>
            <p className="text-text-muted text-sm md:text-base font-light mt-3 max-w-xl">
              An exhaustive breakdown of services engineered specifically to solve cybersecurity
              sales, messaging, and scaling challenges.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {acts.map((act, idx) => (
              <Reveal key={act.slug} delay={idx * 100}>
                <div id={act.slug} className="scroll-mt-24 h-full">
                  <ServiceCard act={act} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <EngagementModels />

      <section className="relative isolate overflow-hidden pt-16 md:pt-20 pb-20 md:pb-28 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-4xl md:text-5xl text-primary font-normal leading-tight">
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
