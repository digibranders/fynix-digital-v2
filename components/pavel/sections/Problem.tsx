import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

const PAINS = [
  {
    n: "01",
    title: "Great content that still won't rank",
    body: "You publish thorough, well-researched pieces and watch them stall on page three, while thinner competitor pages sit at the top.",
  },
  {
    n: "02",
    title: "Authority that dilutes, not builds",
    body: "You add more content to build depth, but every new post seems to weaken the site rather than strengthen it.",
  },
  {
    n: "03",
    title: "Keywords one at a time, not topics",
    body: "You chase individual queries while competitors cover the whole topic as a system, and Google rewards them for it.",
  },
  {
    n: "04",
    title: "You can't explain what ranked",
    body: "When a page finally lands, you can't tell if it was content, links, structure, or luck. So you can't repeat it on purpose.",
  },
];

export const Problem: React.FC = () => {
  return (
    <section
      id="problem"
      className="py-12 pv-seam bg-background-soft"
    >
      <Container>
        <div className="max-w-[820px] mb-16 md:mb-20">
          <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.05rem] leading-[1.08] font-medium tracking-[-0.026em] text-primary">
            You already know more about SEO than{" "}
            <span className="font-serif italic font-medium">most so-called SEOs.</span>
          </h2>
          {/* The single-line treatment only holds from `lg` up. At `md` the
              sentence is wider than the container, and because `nowrap` cannot
              break it the excess widened the whole document instead — giving
              every section on the page a horizontal scroll at tablet widths.
              `lg:` matches the other one-line headings in Proof and Curriculum. */}
          <p className="mt-8 text-[1.3rem] sm:text-[1.45rem] text-text-muted leading-[1.6] max-w-[820px] lg:whitespace-nowrap font-normal">
            You&apos;ve done the work, yet less experienced competitors keep
            outranking you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-12 md:gap-y-16">
          {PAINS.map((p, i) => (
            <Reveal key={p.n} delay={i * 80} className="flex gap-6">
              <span className="font-serif text-[22px] italic font-normal text-accent leading-none pt-1 tnum shrink-0">
                {p.n}
              </span>
              <div className="space-y-3 border-l border-border pl-6 -ml-2">
                <h3 className="font-serif text-[1.4rem] sm:text-[1.55rem] leading-[1.25] font-semibold text-primary">
                  {p.title}
                </h3>
                <p className="text-[16.5px] text-text-muted leading-[1.65]">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
};
