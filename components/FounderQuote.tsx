import type { ReactElement } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import SpotlightBackdrop from "@/components/SpotlightBackdrop";

const BOOKING_URL = "https://calendly.com/siddique-fynix/business-introduction";
const ARROW_PATH = "M14 5l7 7m0 0l-7 7m7-7H3";

const DEFAULT_QUOTE =
  "We build your network through genuine human conversations that build trust, create meaningful connections, and open doors to new opportunities.";

/** Siddique Ahmed's portrait and positioning quote (the LinkedIn one unless a page passes its own), with a button that books a call. */
export default function FounderQuote({ quote = DEFAULT_QUOTE }: { readonly quote?: string }): ReactElement {
  return (
    <section className="relative isolate overflow-hidden py-12 md:py-20 bg-background-soft">
      <SpotlightBackdrop />
      <div className="relative max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <Reveal className="lg:col-span-5">
          <div className="relative aspect-[4/5] w-full max-w-sm mx-auto lg:mx-0 overflow-hidden rounded-2xl border border-border">
            <Image
              src="/siddique.webp"
              alt="Siddique Ahmed"
              fill
              sizes="(min-width: 1024px) 24rem, 20rem"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-7">
          <svg aria-hidden className="w-10 h-10 text-accent" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.5 4C6.5 6 5 9 5 13v7h7v-8H8.5c0-2.5 1-4.5 3-6L9.5 4zm9 0c-3 2-4.5 5-4.5 9v7h7v-8h-3.5c0-2.5 1-4.5 3-6L18.5 4z" />
          </svg>
          <blockquote className="mt-8 text-balance font-serif italic text-3xl md:text-4xl text-primary font-medium leading-[1.25] tracking-tight">
            {quote}
          </blockquote>
          <div className="mt-8">
            <p className="font-serif text-lg text-primary font-medium leading-tight">Siddique Ahmed</p>
            <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-text-muted">Fynix Digital</p>
          </div>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
          >
            Let&apos;s book a call
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW_PATH} />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
