import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

type Module = {
  n: string;
  label: string;
  title: string;
  summary: string;
  theme: {
    name: "terracotta" | "champagne" | "violet";
    accent: string;      // Accent color hex
    textTint: string;    // Light text tint
  };
};

const MODULES: Module[] = [
  {
    n: "01",
    label: "FOUNDATIONS",
    title: "The Core Fundamentals of Semantic SEO",
    summary:
      "The foundational concepts of information retrieval, natural language processing, and how Google evaluates topical relevance beyond simple keyword density.",
    theme: {
      name: "terracotta",
      accent: "#b1786c",
      textTint: "#f4dcd6",
    },
  },
  {
    n: "02",
    label: "ENTITIES & SERP",
    title: "Entities, Attributes, and Their Role in Semantic Search",
    summary:
      "How to identify primary entities, map contextually relevant attributes, and structure your content so search engines unambiguously parse your domain expertise.",
    theme: {
      name: "champagne",
      accent: "#c9b57a",
      textTint: "#f7f0d8",
    },
  },
  {
    n: "03",
    label: "MAP ARCHITECTURE",
    title: "Building a Topical Map",
    summary:
      "Core vs. supporting topic clusters. How to define clear boundaries, sequence content publishing, and build complete topical coverage that commands search authority.",
    theme: {
      name: "violet",
      accent: "#7a6e9c",
      textTint: "#e7e2f5",
    },
  },
  {
    n: "04",
    label: "CONTENT BRIEFS",
    title: "Creating Semantic Content Briefs",
    summary:
      "How to craft data-driven content briefs built around entity relationships, contextual vectors, and intent fulfillment rather than superficial word counts.",
    theme: {
      name: "terracotta",
      accent: "#b1786c",
      textTint: "#f4dcd6",
    },
  },
  {
    n: "05",
    label: "LINK MESH",
    title: "Semantic Internal Linking Strategy",
    summary:
      "How to architect contextual internal link meshes that pass PageRank efficiently, signal topical relationships, and allow pages to rank together as a unified network.",
    theme: {
      name: "champagne",
      accent: "#c9b57a",
      textTint: "#f7f0d8",
    },
  },
  {
    n: "06",
    label: "MULTIMODAL SERP",
    title: "Visual Semantics (Preview)",
    summary:
      "An exclusive preview into visual entity recognition, multimodal search signals, and how visual elements reinforce semantic context on modern SERPs.",
    theme: {
      name: "violet",
      accent: "#7a6e9c",
      textTint: "#e7e2f5",
    },
  },
];

export const Curriculum: React.FC = () => {
  return (
    <section
      id="curriculum"
      className="relative py-12 bg-primary text-white overflow-hidden"
    >
      {/* Brand dot-grid background texture in outer section spaces */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#FCFCFB 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <Container className="relative z-10">
        {/* Central Content Box with Low Contrast Subtle Backdrop & Hairline Border */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-primary/95 border border-white/[0.04] p-6 sm:p-10">
          {/* Section Header */}
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.1]">
              What you will learn,{" "}
              <br className="sm:hidden" />
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#b1786c] via-[#c9b57a] to-[#7a6e9c]">
                in six modules.
              </span>
            </h2>

            {/* Copy is trimmed to sit on one line on desktop (nowrap); it wraps
                normally on smaller screens where there isn't room. */}
            <p className="text-base sm:text-lg lg:whitespace-nowrap text-white/75 leading-relaxed mx-auto">
              Six live modules. An engineering framework to execute Monday morning and win search authority.
            </p>
          </div>

          {/* Editorial Numbered Pointer List with Subtle Hairline Dividers */}
          <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
            {MODULES.map((m, i) => {
              const { theme } = m;

              return (
                <Reveal key={m.n} delay={(i % 3) * 60}>
                  <div className="group py-6 sm:py-7 transition-colors duration-200 hover:bg-white/[0.015] px-2 sm:px-4 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                      {/* Number & Category Badge — kept on one row (badge beside
                          the number) at every breakpoint. */}
                      <div className="md:col-span-3 flex items-center justify-start gap-3">
                        <span
                          className="font-serif italic text-3xl sm:text-4xl font-normal leading-none tnum opacity-90"
                          style={{ color: theme.accent }}
                        >
                          {m.n}
                        </span>
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md border border-white/[0.06] bg-white/[0.03]"
                          style={{
                            color: theme.textTint,
                          }}
                        >
                          {m.label}
                        </span>
                      </div>

                      {/* Title only — descriptions removed for a scannable list */}
                      <div className="md:col-span-9">
                        <h3 className="font-serif text-xl sm:text-2xl font-medium text-white leading-snug tracking-tight group-hover:text-slate-100 transition-colors">
                          {m.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
