"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "../ui/Container";
import { Plus, Minus } from "lucide-react";

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
    a: "No. There are no recordings. We will share notes and the slide deck with attendees after the workshop.",
  },
  {
    q: "What if I cannot attend live?",
    a: "We do not record the session and there are no refunds for this live workshop. Please be 100% sure before reserving your seat.",
  },
];

export const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-16 md:py-20 pv-seam bg-background-soft"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-primary">
              Questions,{" "}
              <span className="font-serif italic font-medium">answered plainly.</span>
            </h2>
            <p className="mt-6 text-[1.1rem] text-text-muted leading-[1.65] italic font-normal max-w-[340px]">
              Still have a specific question? Email us and we will reply
              personally.
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

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p
                          className="pb-7 pr-8 text-[15.5px] text-text-muted leading-[1.7] max-w-[620px]"
                          dangerouslySetInnerHTML={{ __html: faq.a }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
