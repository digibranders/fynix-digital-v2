import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import { faqs, siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to the questions cybersecurity leaders most often ask Fynix about website performance, SEO, lead generation, and unified growth systems.",
  alternates: { canonical: "/faqs" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function FaqsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[64px] text-white font-medium leading-tight max-w-4xl">
            Questions worth asking.{" "}
            <span className="font-serif italic text-[#e9af88] md:block">Answered plainly.</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg font-normal leading-relaxed mt-6 max-w-2xl">
            The questions cybersecurity leaders ask most often before starting an engagement with{" "}
            {siteConfig.name}.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-white">
        <Reveal className="max-w-4xl mx-auto px-6">
          <FaqAccordion faqs={faqs} />
        </Reveal>
      </section>

      <section className="relative isolate overflow-hidden py-20 md:py-28 bg-transparent">
        <PreFooterBackdrop />
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
            Still have a question?
          </h2>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
            >
              Ask us directly
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
