import Link from "next/link";
import Reveal from "@/components/Reveal";
import SpotlightBackdrop from "@/components/SpotlightBackdrop";

// Homepage "Initiation" closing CTA - cream island backdrop with cursor
// spotlight, headline, description, and the primary Start-The-Conversation
// pill. The visual treatment is shared with the pre-footer CTAs on the
// case-studies pages via `SpotlightBackdrop`.
export default function SpotlightInitiation() {
  return (
    <section className="relative isolate overflow-hidden py-24 md:py-32 bg-transparent">
      <SpotlightBackdrop />

      <Reveal className="relative max-w-4xl mx-auto px-6 text-center">
        <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
          Initiation
        </span>
        <h2 className="font-serif italic tracking-tight text-3xl md:text-5xl text-primary font-normal leading-tight mt-3">
          Every cybersecurity company has opportunities it isn&apos;t fully capturing yet.
        </h2>
        <div className="mt-10">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
          >
            Start The Conversation
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
