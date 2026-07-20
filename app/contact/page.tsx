import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import FaqAccordion from "@/components/FaqAccordion";
import Reveal from "@/components/Reveal";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import WorldMap from "@/components/WorldMap";
import { faqs, siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Brief your project with Fynix. We respond within 24 hours to cybersecurity growth enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="pt-12 md:pt-20 pb-8 md:pb-10 bg-gradient-to-b from-white to-background-soft">
        <Reveal className="max-w-7xl mx-auto px-6 md:px-12">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
            Initiation
          </span>
          <h1 className="font-serif italic text-4xl md:text-[56px] text-primary font-normal mt-3 leading-tight max-w-4xl">
            Every cybersecurity company has opportunities it isn&apos;t fully capturing yet.
          </h1>
          <p className="text-text-muted text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl">
            Sometimes it&apos;s a website that isn&apos;t earning trust. Sometimes it&apos;s
            technology that isn&apos;t keeping pace. Sometimes it&apos;s visibility that never
            becomes opportunity.
          </p>
        </Reveal>
      </section>

      <section className="pt-4 md:pt-6 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start">
          <Reveal variant="left" className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs uppercase font-mono text-text-muted font-bold block mb-3">
                Office
              </span>
              <address className="not-italic text-sm md:text-base font-serif text-primary leading-relaxed">
                {siteConfig.address.line1}
                <br />
                {siteConfig.address.line2}
              </address>
              <p className="text-sm font-serif text-primary mt-3">
                GST No.&nbsp;: {siteConfig.gst}
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={`tel:${siteConfig.phoneHref}`}
                className="group flex items-center gap-4 text-sm md:text-base font-serif text-primary hover:text-accent transition-colors"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary group-hover:border-accent group-hover:text-accent transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                {siteConfig.phone}
              </a>

              <a
                href={`mailto:${siteConfig.email}`}
                className="group flex items-center gap-4 text-sm md:text-base font-serif text-primary hover:text-accent transition-colors"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary group-hover:border-accent group-hover:text-accent transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                {siteConfig.email}
              </a>
            </div>

            <div>
              <span className="text-xs uppercase font-mono text-text-muted font-bold block mb-2">
                Response
              </span>
              <span className="text-sm font-serif text-primary">Within 24 business hours</span>
            </div>

            <div className="pt-4">
              <WorldMap />
            </div>
          </Reveal>

          <Reveal variant="right" delay={180} className="lg:col-span-7 bg-white border border-border rounded-xl p-8 md:p-12 shadow-xs">
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="contact-faq-heading"
        className="relative isolate overflow-hidden pt-16 md:pt-20 pb-24 md:pb-32 bg-transparent"
      >
        <PreFooterBackdrop />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal>
            <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
              Before you write
            </span>
            <h2
              id="contact-faq-heading"
              className="font-serif text-4xl md:text-5xl text-primary font-normal mt-3 leading-tight max-w-4xl"
            >
              Answers to the questions we hear first.
            </h2>
            <p className="text-text-muted text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl">
              If your question isn&apos;t here, ask it in the form above. We reply{" "}
              <strong className="font-medium text-primary">within one business day</strong>.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-14 max-w-4xl">
            <FaqAccordion faqs={faqs} />
          </Reveal>

          <Reveal delay={200} className="mt-10">
            <Link
              href="/faqs"
              className="text-xs font-semibold uppercase tracking-widest text-accent border-b border-accent pb-1 hover:text-primary hover:border-primary cta-underline transition-all duration-200"
            >
              See the full FAQs page
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
