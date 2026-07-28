import React from "react";
import Reveal from "@/components/Reveal";
import { Container } from "../ui/Container";

type Module = {
  n: string;
  title: string;
  summary: string;
  Diagram: React.FC;
};

// 01: How search engines read your site
const Diagram01: React.FC = () => (
  <svg viewBox="0 0 260 160" fill="none" className="w-[88%] h-auto max-w-[260px]">
    {/* Document sheet */}
    <g transform="translate(32, 18)">
      {/* Outer Page Border */}
      <path
        d="M 0 10 C 0 4.5, 4.5 0, 10 0 L 56 0 L 74 18 L 74 114 C 74 119.5, 69.5 124, 64 124 L 10 124 C 4.5 124, 0 119.5, 0 114 Z"
        fill="#FFFFFF"
        stroke="#0C1E2E"
        strokeWidth="1.75"
      />
      {/* Dog-ear fold */}
      <path d="M 56 0 L 56 18 L 74 18" fill="#F4F1EA" stroke="#0C1E2E" strokeWidth="1.75" />
      
      {/* Document Text Lines */}
      <rect x="14" y="26" width="34" height="4" rx="2" fill="#D6D3CB" />
      <rect x="14" y="38" width="46" height="4" rx="2" fill="#D6D3CB" />
      {/* Orange Highlighted Line */}
      <rect x="14" y="52" width="42" height="4.5" rx="2.25" fill="#E9AF88" />
      <rect x="14" y="66" width="46" height="4" rx="2" fill="#D6D3CB" />
      <rect x="14" y="78" width="30" height="4" rx="2" fill="#D6D3CB" />
      <rect x="14" y="90" width="38" height="4" rx="2" fill="#D6D3CB" />
    </g>

    {/* Connecting Smooth Curves */}
    <path d="M 106 70 C 136 70, 145 42, 182 42" stroke="#0C1E2E" strokeWidth="1.75" fill="none" />
    <path d="M 106 70 C 140 70, 148 70, 200 70" stroke="#0C1E2E" strokeWidth="1.75" fill="none" />
    <path d="M 106 70 C 136 70, 145 98, 182 98" stroke="#0C1E2E" strokeWidth="1.75" fill="none" />

    {/* Target Node Circles */}
    {/* Top Node */}
    <g transform="translate(182, 42)">
      <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#0C1E2E" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="5" fill="#FFFFFF" stroke="#E9AF88" strokeWidth="2" />
      <circle cx="0" cy="0" r="2" fill="#E9AF88" />
    </g>

    {/* Middle Node */}
    <g transform="translate(200, 70)">
      <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#0C1E2E" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="5.5" fill="#E9AF88" />
      <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
    </g>

    {/* Bottom Node */}
    <g transform="translate(182, 98)">
      <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#0C1E2E" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="5" fill="#FFFFFF" stroke="#E9AF88" strokeWidth="2" />
      <circle cx="0" cy="0" r="2" fill="#E9AF88" />
    </g>
  </svg>
);

// 02: Building a topical map that creates authority
const Diagram02: React.FC = () => {
  const points = [
    [130, 22], [188, 36], [212, 80], [188, 124], [130, 138], [72, 124], [48, 80], [72, 36]
  ] as const;

  return (
    <svg viewBox="0 0 260 160" fill="none" className="w-[88%] h-auto max-w-[260px]">
      {/* Radial Dashed Lines */}
      {points.map(([x, y], i) => (
        <line key={i} x1="130" y1="80" x2={x} y2={y} stroke="#D6D3CB" strokeWidth="1.25" strokeDasharray="3 3" />
      ))}

      {/* Central Target Rings */}
      <circle cx="130" cy="80" r="20" fill="#E9AF88" />
      <circle cx="130" cy="80" r="12" fill="#FFFFFF" />
      <circle cx="130" cy="80" r="6" fill="#E9AF88" />
      <circle cx="130" cy="80" r="2" fill="#FFFFFF" />

      {/* 8 Outer Nodes */}
      {points.map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <circle cx="0" cy="0" r="6" fill="#FFFFFF" stroke="#E9AF88" strokeWidth="1.75" />
          <circle cx="0" cy="0" r="2.5" fill="#E9AF88" />
        </g>
      ))}
    </svg>
  );
};

// 03: Entities, attributes and relevance configuration
const Diagram03: React.FC = () => (
  <svg viewBox="0 0 260 160" fill="none" className="w-[88%] h-auto max-w-[260px]">
    {/* Dashed orange connector lines */}
    <line x1="130" y1="80" x2="48" y2="40" stroke="#E9AF88" strokeWidth="1.25" strokeDasharray="3 3" />
    <line x1="130" y1="80" x2="212" y2="40" stroke="#E9AF88" strokeWidth="1.25" strokeDasharray="3 3" />
    <line x1="130" y1="80" x2="48" y2="120" stroke="#E9AF88" strokeWidth="1.25" strokeDasharray="3 3" />
    <line x1="130" y1="80" x2="212" y2="120" stroke="#E9AF88" strokeWidth="1.25" strokeDasharray="3 3" />

    {/* Center Hexagon Badge */}
    <g transform="translate(130, 80)">
      <polygon
        points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16"
        fill="#FFFFFF"
        stroke="#0C1E2E"
        strokeWidth="1.75"
      />
      {/* Avatar inside */}
      <circle cx="0" cy="-6" r="7" fill="#0C1E2E" />
      <path d="M -12 14 C -12 6, 12 6, 12 14" fill="#0C1E2E" />
    </g>

    {/* Top Left Chip: Type */}
    <g transform="translate(18, 28)">
      <rect x="0" y="0" width="56" height="24" rx="6" fill="#FFFFFF" stroke="#E8E7E3" strokeWidth="1.25" />
      <text x="28" y="15" textAnchor="middle" fill="#0C1E2E" fontSize="11" fontWeight="700" fontFamily="sans-serif">Type</text>
      <circle cx="56" cy="12" r="3" fill="#E9AF88" />
    </g>

    {/* Top Right Chip: Context */}
    <g transform="translate(186, 28)">
      <rect x="0" y="0" width="58" height="24" rx="6" fill="#FFFFFF" stroke="#E8E7E3" strokeWidth="1.25" />
      <text x="29" y="15" textAnchor="middle" fill="#0C1E2E" fontSize="11" fontWeight="700" fontFamily="sans-serif">Context</text>
      <circle cx="0" cy="12" r="3" fill="#E9AF88" />
    </g>

    {/* Bottom Left Chip: Attribute */}
    <g transform="translate(14, 108)">
      <rect x="0" y="0" width="64" height="24" rx="6" fill="#FFFFFF" stroke="#E8E7E3" strokeWidth="1.25" />
      <text x="32" y="15" textAnchor="middle" fill="#0C1E2E" fontSize="11" fontWeight="700" fontFamily="sans-serif">Attribute</text>
      <circle cx="64" cy="12" r="3" fill="#E9AF88" />
    </g>

    {/* Bottom Right Chip: Relevance */}
    <g transform="translate(180, 108)">
      <rect x="0" y="0" width="66" height="24" rx="6" fill="#FFFFFF" stroke="#E8E7E3" strokeWidth="1.25" />
      <text x="33" y="15" textAnchor="middle" fill="#0C1E2E" fontSize="11" fontWeight="700" fontFamily="sans-serif">Relevance</text>
      <circle cx="0" cy="12" r="3" fill="#E9AF88" />
    </g>
  </svg>
);

// 04: Semantic content networks
const Diagram04: React.FC = () => (
  <svg viewBox="0 0 260 160" fill="none" className="w-[88%] h-auto max-w-[260px]">
    {/* Outer Wireframe Hexagon */}
    <polygon points="130,28 175,54 175,106 130,132 85,106 85,54" fill="none" stroke="#0C1E2E" strokeWidth="1.5" strokeDasharray="3 3" />
    
    {/* Connectors to center */}
    <line x1="130" y1="28" x2="130" y2="80" stroke="#0C1E2E" strokeWidth="1.25" strokeDasharray="3 3" />
    <line x1="175" y1="54" x2="130" y2="80" stroke="#0C1E2E" strokeWidth="1.25" strokeDasharray="3 3" />
    <line x1="175" y1="106" x2="130" y2="80" stroke="#0C1E2E" strokeWidth="1.25" strokeDasharray="3 3" />
    <line x1="130" y1="132" x2="130" y2="80" stroke="#0C1E2E" strokeWidth="1.25" strokeDasharray="3 3" />
    <line x1="85" y1="106" x2="130" y2="80" stroke="#0C1E2E" strokeWidth="1.25" strokeDasharray="3 3" />
    <line x1="85" y1="54" x2="130" y2="80" stroke="#0C1E2E" strokeWidth="1.25" strokeDasharray="3 3" />

    {/* Center 3D Purple Cube */}
    <g>
      {/* Top Face */}
      <polygon points="130,60 148,69 130,78 112,69" fill="#F2D3B8" stroke="#E9AF88" strokeWidth="1" />
      {/* Left Face */}
      <polygon points="112,69 130,78 130,98 112,89" fill="#D89870" stroke="#C98A63" strokeWidth="1" />
      {/* Right Face */}
      <polygon points="130,78 148,69 148,89 130,98" fill="#E9AF88" stroke="#C98A63" strokeWidth="1" />
    </g>

    {/* 6 Outer Vertex Nodes */}
    {[
      [130, 28], [175, 54], [175, 106], [130, 132], [85, 106], [85, 54]
    ].map(([x, y], i) => (
      <g key={i} transform={`translate(${x}, ${y})`}>
        <circle cx="0" cy="0" r="7" fill="#FFFFFF" stroke="#E9AF88" strokeWidth="1.75" />
        <circle cx="0" cy="0" r="3" fill="#E9AF88" />
      </g>
    ))}
  </svg>
);

// 05: From framework to execution
const Diagram05: React.FC = () => (
  <svg viewBox="0 0 340 200" fill="none" className="w-[92%] h-auto max-w-[340px]">
    {/* LEFT HALF: 4-Step Cycle Process */}
    <g transform="translate(100, 84)">
      {/* Background Dot Matrix Pattern behind left side */}
      <g opacity="0.3">
        {[-36, -18, 0, 18, 36].map((x) =>
          [-36, -18, 0, 18, 36].map((y) => (
            <circle key={`${x}-${y}`} cx={x - 48} cy={y} r="1.25" fill="#D6D3CB" />
          ))
        )}
      </g>

      {/* 4 Connecting Curved Track Arcs with Arrowheads */}
      {/* Top-Right Arc (Plan -> Build) */}
      <path d="M 24 -40 A 48 48 0 0 1 40 -24" stroke="#D6D3CB" strokeWidth="1.5" fill="none" />
      <path d="M 40 -24 L 33 -28 L 39 -31 Z" fill="#0C1E2E" />

      {/* Bottom-Right Arc (Build -> Measure) */}
      <path d="M 40 24 A 48 48 0 0 1 24 40" stroke="#D6D3CB" strokeWidth="1.5" fill="none" />
      <path d="M 24 40 L 28 33 L 31 39 Z" fill="#0C1E2E" />

      {/* Bottom-Left Arc (Measure -> Refine) */}
      <path d="M -24 40 A 48 48 0 0 1 -40 24" stroke="#D6D3CB" strokeWidth="1.5" fill="none" />
      <path d="M -40 24 L -33 28 L -39 31 Z" fill="#0C1E2E" />

      {/* Top-Left Arc (Refine -> Plan) */}
      <path d="M -40 -24 A 48 48 0 0 1 -24 -40" stroke="#D6D3CB" strokeWidth="1.5" fill="none" />
      <path d="M -24 -40 L -28 -33 L -31 -39 Z" fill="#0C1E2E" />

      {/* TOP CARD: PLAN */}
      <g transform="translate(0, -48)">
        {/* Label Text ABOVE */}
        <text x="0" y="-22" textAnchor="middle" fill="#0C1E2E" fontSize="11" fontWeight="700" fontFamily="sans-serif">Plan</text>
        {/* Card Box */}
        <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#FFFFFF" stroke="#E8E7E3" strokeWidth="1.25" />
        {/* Target / Crosshair Icon */}
        <circle cx="0" cy="-1" r="6" stroke="#0C1E2E" strokeWidth="1.5" fill="none" />
        <circle cx="0" cy="-1" r="2" fill="#0C1E2E" />
        <line x1="3.5" y1="2.5" x2="6.5" y2="5.5" stroke="#0C1E2E" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* RIGHT CARD: BUILD */}
      <g transform="translate(48, 0)">
        {/* Card Box */}
        <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#FFFFFF" stroke="#E8E7E3" strokeWidth="1.25" />
        {/* Code Icon </> */}
        <text x="0" y="4" textAnchor="middle" fill="#0C1E2E" fontSize="12" fontWeight="800" fontFamily="sans-serif">&lt;/&gt;</text>
        {/* Label Text BELOW */}
        <text x="0" y="32" textAnchor="middle" fill="#0C1E2E" fontSize="11" fontWeight="700" fontFamily="sans-serif">Build</text>
      </g>

      {/* BOTTOM CARD: MEASURE */}
      <g transform="translate(0, 48)">
        {/* Card Box */}
        <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#FFFFFF" stroke="#E8E7E3" strokeWidth="1.25" />
        {/* Bar Chart Icon */}
        <rect x="-6" y="1" width="3" height="6" rx="0.5" fill="#0C1E2E" />
        <rect x="-1" y="-3" width="3" height="10" rx="0.5" fill="#0C1E2E" />
        <rect x="4" y="-7" width="3" height="14" rx="0.5" fill="#0C1E2E" />
        {/* Label Text BELOW */}
        <text x="0" y="32" textAnchor="middle" fill="#0C1E2E" fontSize="11" fontWeight="700" fontFamily="sans-serif">Measure</text>
      </g>

      {/* LEFT CARD: REFINE */}
      <g transform="translate(-48, 0)">
        {/* Card Box */}
        <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#FFFFFF" stroke="#E8E7E3" strokeWidth="1.25" />
        {/* Pencil Icon */}
        <path d="M -3 3 L 3 -3 L 5 -1 L -1 5 Z" fill="#0C1E2E" />
        <line x1="-5" y1="7" x2="5" y2="7" stroke="#0C1E2E" strokeWidth="1.5" strokeLinecap="round" />
        {/* Label Text BELOW */}
        <text x="0" y="32" textAnchor="middle" fill="#0C1E2E" fontSize="11" fontWeight="700" fontFamily="sans-serif">Refine</text>
      </g>

      {/* CENTER CHECKMARK CIRCLE */}
      <circle cx="0" cy="0" r="13" fill="#0C1E2E" />
      <path d="M -5 0 L -1.5 3.5 L 5 -3" stroke="#FFFFFF" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    {/* VERTICAL DIVIDER LINE */}
    <line x1="200" y1="18" x2="200" y2="166" stroke="#E8E7E3" strokeWidth="1" />

    {/* RIGHT HALF: 4 SOLID RISING BLUE BARS WITH TREND ARROW */}
    <g transform="translate(216, 150)">
      {/* Baseline */}
      <line x1="-4" y1="0" x2="104" y2="0" stroke="#E8E7E3" strokeWidth="1" />

      {/* Bar 1 - Light blue */}
      <rect x="4" y="-30" width="18" height="30" rx="2" fill="#F5E3D2" stroke="#EAD3BC" strokeWidth="1" />
      {/* Bar 2 - Medium light blue */}
      <rect x="28" y="-56" width="18" height="56" rx="2" fill="#EFCFB0" stroke="#E0BE9C" strokeWidth="1" />
      {/* Bar 3 - Medium blue */}
      <rect x="52" y="-86" width="18" height="86" rx="2" fill="#E9AF88" stroke="#D89870" strokeWidth="1" />
      {/* Bar 4 - Rich dark blue */}
      <rect x="76" y="-118" width="18" height="118" rx="2" fill="#D89870" stroke="#C77E52" strokeWidth="1" />

      {/* Zig-Zag Growth Trend Line */}
      <path
        d="M 13 -42 L 25 -64 L 40 -52 L 61 -86 L 85 -126"
        stroke="#0C1E2E"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrowhead tip */}
      <path d="M 85 -126 L 75 -123 L 82 -114 Z" fill="#0C1E2E" />
    </g>
  </svg>
);

const MODULES: Module[] = [
  {
    n: "01",
    title: "How search engines actually read your site",
    summary:
      "The plain-English version of information retrieval, NLP, and the Google patents that govern ranking. Every decision you make afterward has a reason behind it.",
    Diagram: Diagram01,
  },
  {
    n: "02",
    title: "Building a topical map that creates authority",
    summary:
      "Core sections versus outer sections. How to define the boundaries of a topic, sequence your content, and structure a site so coverage signals real expertise.",
    Diagram: Diagram02,
  },
  {
    n: "03",
    title: "Entities, attributes and relevance configuration",
    summary:
      "How to identify the entities that matter in your niche, filter them by attribute, and write content that is contextually unambiguous to a machine.",
    Diagram: Diagram03,
  },
  {
    n: "04",
    title: "Semantic content networks",
    summary:
      "How internal structure and contextual connection turn a pile of articles into a network that ranks as a unit, and outranks bigger competitors.",
    Diagram: Diagram04,
  },
  {
    n: "05",
    title: "From framework to execution",
    summary:
      "Pavel&rsquo;s programming-assisted workflow for doing this at scale, plus how to read the SERP to validate and iterate.",
    Diagram: Diagram05,
  },
];

export const Curriculum: React.FC = () => {
  return (
    <section
      id="curriculum"
      className="py-16 md:py-20 pv-seam bg-background-soft"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 mb-16 md:mb-20">
          <div className="lg:col-span-6">
            <h2 className="text-[2.15rem] sm:text-[2.65rem] lg:text-[3.15rem] leading-[1.08] font-bold tracking-[-0.026em] text-primary">
              What you will learn,{" "}
              <span className="italic font-normal text-accent whitespace-nowrap">
                in three hours.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-[1.2rem] text-text-muted leading-[1.65] font-normal">
              Five modules, taught live. A method you can apply on Monday
              morning, not a motivational talk.
            </p>
          </div>
        </div>

        {/* Stack of Module Cards matching reference screenshot */}
        <div className="space-y-4 sm:space-y-6">
          {MODULES.map((m, i) => {
            const { Diagram } = m;

            return (
              <Reveal key={m.n} delay={(i % 2) * 60}>
                <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 lg:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.025)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                    {/* Left Column: Visual Canvas Tile */}
                    <div className="lg:col-span-5">
                      <figure
                        className={`relative flex ${m.n === "05" ? "aspect-[16/9]" : "aspect-[16/10]"} items-center justify-center overflow-hidden rounded-xl border border-border p-4 bg-background-soft`}
                      >
                        <Diagram />
                      </figure>
                    </div>

                    {/* Right Column: Number Badge, Title, Summary */}
                    <div className="lg:col-span-7">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          {/* Number Badge */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-sans font-bold text-[1.1rem] border shrink-0 bg-primary text-white border-primary"
                          >
                            {m.n}
                          </div>

                          {/* Title */}
                          <h3 className="font-sans text-[1.35rem] sm:text-[1.6rem] font-bold text-primary leading-[1.25] tracking-[-0.015em]">
                            {m.title}
                          </h3>
                        </div>

                        {/* Summary Description */}
                        <p
                          className="sm:pl-14 text-[1rem] sm:text-[1.05rem] text-text-muted leading-[1.6] font-normal max-w-[560px]"
                          dangerouslySetInnerHTML={{ __html: m.summary }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
