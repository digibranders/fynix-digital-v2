"use client";

import { useState } from "react";
import type { Faq } from "@/lib/content";
import { emphasize } from "@/lib/emphasize";

type Props = { faqs: Faq[] };

export default function FaqAccordion({ faqs }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="border-t border-border">
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
              <p className="text-sm md:text-base text-text-muted font-light leading-relaxed">
                {emphasize(faq.a)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
