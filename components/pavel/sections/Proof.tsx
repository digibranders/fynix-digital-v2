import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";
import { ProofGallery } from "../ui/ProofGallery";

// Bento grid of real Google Search Console exports from Pavel's client sites.
// Rendering + the click-to-enlarge lightbox live in the ProofGallery client
// component; this section owns the heading and layout only.
export const Proof: React.FC = () => {
  return (
    <section id="proof" className="py-12 pv-seam bg-background-soft">
      <Container>
        <div className="max-w-[900px] mb-14 md:mb-16">
          <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-primary lg:whitespace-nowrap">
            Real client sites.{" "}
            <span className="font-serif italic font-medium">
              The same framework you&rsquo;ll learn.
            </span>
          </h2>
          <p className="mt-6 text-[1.2rem] text-text-muted leading-[1.65] max-w-[960px] font-normal lg:whitespace-nowrap">
            Live Google Search Console exports from Pavel&rsquo;s client sites.
            Flat for months, then the framework compounds.
          </p>
        </div>

        <Reveal delay={100}>
          <ProofGallery />
        </Reveal>
      </Container>
    </section>
  );
};
