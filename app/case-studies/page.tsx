import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CaseStudiesGrid from "@/components/CaseStudiesGrid";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Selected projects across branding, UI/UX, SEO, social, and video: the systems Fynix has shipped for cybersecurity and product companies.",
  alternates: { canonical: "/case-studies" },
};

export default function CaseStudiesPage() {
  return (
    <>
      <section className="pt-12 md:pt-20 pb-14 md:pb-20 bg-gradient-to-b from-white to-background-soft">
        <Reveal className="max-w-7xl mx-auto px-6 md:px-12">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
            Our Work
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-primary font-normal mt-3 leading-[1.05] tracking-tight">
            Turning ideas <br />
            <span className="italic text-accent">into vision.</span>
          </h1>
          <p className="text-text-muted text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl">
            A selection of the platforms, brands, and growth systems we&apos;ve shipped.{" "}
            <strong className="font-medium text-primary">Every project is live in production</strong>
            . Click through to see the work in the wild.
          </p>
        </Reveal>
      </section>

      <section className="pt-4 md:pt-8 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <CaseStudiesGrid />
        </div>
      </section>

      <section className="pt-16 md:pt-20 pb-20 md:pb-28 bg-background-soft">
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif italic text-4xl md:text-5xl text-primary font-normal leading-tight">
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
