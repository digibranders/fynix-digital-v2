"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

/**
 * Slim homepage-only announcement bar pointing at the new lead-generation
 * case study.
 *
 * Rendered in normal document flow at the very top of the (site) layout,
 * above the sticky Header. Because it is in flow, it naturally scrolls out
 * of view as the user scrolls down and the sticky Header pins to the top —
 * i.e. it "disappears on scroll" with zero scroll listeners and no layout
 * jank. A dismiss button lets the user close it for the session.
 */
export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  if (dismissed || pathname !== "/") return null;

  return (
    <div className="relative z-[60] w-full border-b border-white/10 bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 md:px-14">
        <div className="flex min-h-[42px] items-center justify-center py-2 text-center">
          <Link
            href="/case-studies/lead-generation-up"
            className="group inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[12px] sm:text-[14px] leading-tight"
          >
            <span className="font-semibold text-white">NEW CASE STUDY</span>
            <span aria-hidden className="hidden sm:inline text-white/25">
              |
            </span>
            <span className="hidden sm:inline text-white/65 transition-colors group-hover:text-white/85">
              How we delivered 6× ROI for a cybersecurity company in India
            </span>
            <span className="font-semibold text-accent underline decoration-accent/50 underline-offset-[5px] transition-colors group-hover:text-accent-hover group-hover:decoration-accent-hover">
              Read the case study
            </span>
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
