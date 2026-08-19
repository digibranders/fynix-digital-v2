"use client";

import React, { useState } from "react";
import { Container } from "../ui/Container";
import { Plus, Minus } from "lucide-react";
import { WHATSAPP_QUERY_URL } from "@/components/pavel/workshopDetails";

const FAQS = [
  {
    q: "Do I need to be technical or know how to code?",
    a: "No. Pavel&rsquo;s whole reputation is making the technical simple. Programming makes the workflow faster, but the framework itself is something any serious SEO can apply.",
  },
  {
    q: "Is this just the Koray course, repackaged?",
    a: "No. It is a focused three-hour intensive where Pavel distils the Semantic SEO framework into something you can act on immediately, taught in his own simplified, practitioner-first style.",
  },
  {
    q: "Will I get a recording?",
    a: "Yes. Every attendee gets access to the full workshop recording for 7 days after the session, so you can revisit anything you want to review. We&rsquo;ll also share the notes and slide deck.",
  },
  {
    q: "What if I cannot attend live?",
    a: "You&rsquo;ll get access to the recording for 7 days afterwards, so you won&rsquo;t miss the material. That said, it&rsquo;s a live, interactive session and the Q&amp;A is where a lot of the value is, so we still recommend attending live. Please note there are no refunds.",
  },
];

export const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-12 pv-seam bg-background-soft"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-primary">
              Questions,{" "}
              <span className="font-serif italic font-medium">answered plainly.</span>
            </h2>
            <p className="mt-6 text-[1.1rem] text-text-muted leading-[1.65] italic font-normal max-w-[340px]">
              Still have a specific question?{" "}
              <a
                href="mailto:hello@fynix.digital"
                className="text-primary underline decoration-border underline-offset-4 hover:decoration-accent"
              >
                Email us
              </a>{" "}
              or{" "}
              <a
                href={WHATSAPP_QUERY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline decoration-border underline-offset-4 hover:decoration-accent"
              >
                message us on WhatsApp
              </a>
              . We reply personally.
            </p>
          </div>

          <div className="lg:col-span-8 pv-seam-t">
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="pv-seam">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full py-6 text-left flex items-start justify-between gap-6 group"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <h3 className="font-serif text-[1.2rem] sm:text-[1.3rem] leading-[1.35] font-medium text-primary group-hover:text-accent transition-colors">
                      {faq.q}
                    </h3>
                    <span className="shrink-0 pt-1 text-text-muted group-hover:text-primary transition-colors">
                      {isOpen ? (
                        <Minus className="w-4 h-4" strokeWidth={1.5} />
                      ) : (
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                      )}
                    </span>
                  </button>

                  {/* CSS-only height animation (grid-rows 0fr→1fr) — replaces the
                      motion library so the ~139 KB animation chunk never loads on
                      this page. Degrades to an instant open on pre-2022 browsers. */}
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <p
                        className="pb-7 pr-8 text-[15.5px] text-text-muted leading-[1.7] max-w-[620px]"
                        dangerouslySetInnerHTML={{ __html: faq.a }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
