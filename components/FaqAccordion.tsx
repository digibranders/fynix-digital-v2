"use client";

import { useEffect, useRef, useState } from "react";
import type { Faq } from "@/lib/content";
import { emphasize } from "@/lib/emphasize";

type Props = { faqs: Faq[] };

export default function FaqAccordion({ faqs }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Keep the cursor-tracked backdrop spotlight quiet while the reader's
  // pointer is over the FAQ list — nothing more distracting than dots
  // flickering under the paragraph you're trying to read. We stop
  // pointer events from reaching the parent section (so the spotlight
  // stops re-centring) AND explicitly force `--active` to 0 on the
  // ambient backdrop so it fades out. Moving the cursor back out of
  // the FAQ resumes the effect naturally.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const section = el.closest("section");
    if (!section) return;
    const backdrop = section.querySelector<HTMLElement>(
      '[aria-hidden][style*="--mx"]',
    );

    const quiet = (event: Event) => {
      event.stopPropagation();
      if (backdrop) backdrop.style.setProperty("--active", "0");
    };

    el.addEventListener("pointerenter", quiet);
    el.addEventListener("pointermove", quiet);
    return () => {
      el.removeEventListener("pointerenter", quiet);
      el.removeEventListener("pointermove", quiet);
    };
  }, []);

  return (
    <div ref={rootRef} className="border-t border-border">
      {faqs.map((faq, idx) => {
        const isOpen = openFaq === idx;
        const panelId = `faq-panel-${idx}`;
        const buttonId = `faq-button-${idx}`;
        return (
          <div key={faq.q} className="border-b border-border">
            <button
              type="button"
              id={buttonId}
              aria-controls={panelId}
              aria-expanded={isOpen}
              onClick={() => setOpenFaq(isOpen ? null : idx)}
              className="w-full py-6 flex items-center justify-between text-left group"
            >
              <span className="font-serif text-lg text-primary group-hover:text-accent font-medium transition-colors">
                {faq.q}
              </span>
              <span
                aria-hidden
                className="ml-4 flex-shrink-0 text-text-muted transition-transform duration-300"
              >
                {isOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-[400px] opacity-100 pb-6" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-sm md:text-base text-text-muted font-normal leading-relaxed">
                {emphasize(faq.a)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
