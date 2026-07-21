import Link from "next/link";
import Reveal from "@/components/Reveal";
import SpotlightBackdrop from "@/components/SpotlightBackdrop";

// Homepage "Initiation" closing CTA - cream island backdrop with cursor
// spotlight, headline, description, and the primary Start-The-Conversation
// pill. The visual treatment is shared with the pre-footer CTAs on the
// case-studies pages via `SpotlightBackdrop`.
export default function SpotlightInitiation() {
  return (
    <section className="relative isolate overflow-hidden pt-16 md:pt-20 pb-24 md:pb-32 bg-transparent">
      <SpotlightBackdrop />

      <Reveal className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-serif italic tracking-tight text-3xl md:text-5xl text-primary font-medium leading-tight">
          Every cybersecurity company has opportunities it isn&apos;t fully capturing yet.
        </h2>
        <div className="mt-10">
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-primary text-white hover:bg-gradient-to-r hover:from-[#e9af88] hover:to-[#ffd2b3] hover:text-[#0C1E2E] hover:shadow-[0_4px_22px_rgba(233,175,136,0.3)] hover:brightness-105 font-bold rounded-full shadow-sm transition-all duration-300 text-base"
          >
            Start The Conversation
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
      </Reveal>
    </section>
  );
}
