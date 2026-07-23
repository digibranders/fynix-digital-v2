"use client";

const DATA = Array.from({ length: 96 }, (_, i) => {
  const base = 12 + (i / 95) * 41.5;
  // A small sine wave for organic bumps, keeping the trend steadily growing
  const wave = Math.sin(i * 0.5) * 0.8;
  return Math.round(base + wave);
});

const CHART_WIDTH = 620;
const CHART_HEIGHT = 230;
const PADDING_X = 10;
const PADDING_Y = 14;
const POINT_INDEX = 95;

function xFor(index: number) {
  return PADDING_X + (index * (CHART_WIDTH - PADDING_X * 2)) / (DATA.length - 1);
}

function yFor(value: number) {
  return PADDING_Y + (1 - value / 60) * (CHART_HEIGHT - PADDING_Y * 2);
}

const linePath = DATA.map((value, index) =>
  `${index === 0 ? "M" : "L"}${xFor(index).toFixed(1)},${yFor(value).toFixed(1)}`,
).join(" ");
const areaPath = `${linePath} L${xFor(DATA.length - 1).toFixed(1)},${(CHART_HEIGHT - PADDING_Y).toFixed(1)} L${xFor(0).toFixed(1)},${(CHART_HEIGHT - PADDING_Y).toFixed(1)} Z`;

function MetricIcon({ type }: { type: "cursor" | "eye" | "trend" | "target" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
      {type === "cursor" && <path {...common} d="m6 3 11 9-5.9 1.5L9.6 20 6 3Z" />}
      {type === "eye" && <><path {...common} d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" /><circle {...common} cx="12" cy="12" r="2" /></>}
      {type === "trend" && <path {...common} d="m4 16 5-5 3 3 7-7M15 7h4v4" />}
      {type === "target" && <><circle {...common} cx="12" cy="12" r="7" /><circle {...common} cx="12" cy="12" r="3" /></>}
    </svg>
  );
}

function MetricCard({ icon, title, value, change, featured, negative }: {
  icon: "cursor" | "eye" | "trend" | "target";
  title: string;
  value: string;
  change: string;
  featured?: boolean;
  negative?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-3 py-3.5 md:px-4 md:py-4 transition-all duration-200 ${
      featured 
        ? "border-[#e9af88]/60 bg-gradient-to-b from-[#e9af88]/15 to-[#e9af88]/02 shadow-[0_10px_30px_-5px_rgba(233,175,136,0.1)]" 
        : "border-white/[0.05] bg-white/[0.015]"
    }`}>
      <span className={`mb-3.5 inline-flex h-7.5 w-7.5 items-center justify-center rounded-full ${
        featured 
          ? "bg-[#e9af88] text-[#0C1E2E] shadow-[0_0_18px_rgba(233,175,136,0.4)]" 
          : "bg-[#1E2E3E]/80 text-white/80"
      }`}>
        <MetricIcon type={icon} />
      </span>
      <p className="text-[10px] font-semibold text-white/75 md:text-xs leading-none">{title}</p>
      <p className="mt-2 font-sans font-extrabold text-[26px] leading-none tracking-tight text-white md:text-[32px]">{value}</p>
      <div className="mt-2.5">
        <p className={`text-[10.5px] font-bold md:text-xs leading-none ${negative ? "text-[#ff8080]" : "text-[#9deb9d]"}`}>
          {negative ? "↓" : "↑"} {change}
        </p>
        <p className="text-[9px] text-white/55 mt-1 font-medium">vs last 16 months</p>
      </div>
    </div>
  );
}

export default function HeroMetrics() {
  const pointX = xFor(POINT_INDEX);
  const pointY = yFor(DATA[POINT_INDEX]);

  return (
    <div className="relative w-full max-w-[700px] py-4 lg:py-7 lg:-mr-4 xl:-ml-4 select-none">
      {/* 3D Dashboard Card - Double layer for gradient border with a clean, dark drop-shadow */}
      <div
        className="relative w-full p-px rounded-[22px] bg-gradient-to-bl from-white/[0.12] via-white/[0.02] to-white/[0.04] shadow-[0_30px_80px_rgba(0,0,0,0.95)] lg:[transform-origin:right_center] lg:[transform:perspective(2400px)_rotateY(-9deg)_rotateX(3deg)_translateZ(0)] [transform-style:preserve-3d] [backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] [will-change:transform]"
        role="img"
        aria-label="Organic Performance Overview dashboard with search performance metrics and impressions chart"
      >

        {/* Inner Card Container */}
        <div className="relative overflow-hidden rounded-[21px] bg-[#0A131F] p-4 md:p-6 w-full h-full [transform:translateZ(0)] [backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision]">
          {/* Subtle grid pattern overlay */}
          <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:16px_16px]" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold tracking-tight text-white md:text-base">Organic Performance Overview</h2>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-2 text-[10px] font-semibold text-white/75 md:text-xs border border-white/[0.05]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/65" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
                Last 16 months <span className="text-white/55 font-normal">⌄</span>
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
              <MetricCard icon="cursor" title="Total Clicks" value="48.1K" change="32.6%" />
              <MetricCard icon="eye" title="Total Impressions" value="7.31M" change="41.2%" featured />
              <MetricCard icon="trend" title="Average CTR" value="0.7%" change="8.7%" />
              <MetricCard icon="target" title="Average Position" value="15.2" change="4.3%" />
            </div>

            {/* Chart */}
            <div className="mt-6 pt-2">
              <p className="mb-3 text-[10px] font-semibold text-white/70 md:text-xs">Impressions</p>
              <div className="relative pl-8">
                {/* Y-Axis Labels */}
                <div className="absolute inset-y-0 left-0 flex flex-col justify-between pb-6 text-[9px] text-white/60 md:text-[10px] font-semibold tabular-nums">
                  <span>60K</span><span>40K</span><span>20K</span><span>0</span>
                </div>
                
                {/* Chart SVG */}
                <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="block h-[152px] w-full overflow-visible md:h-[195px]" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="organic-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e9af88" stopOpacity="0.3" /><stop offset="1" stopColor="#e9af88" stopOpacity="0" /></linearGradient>
                    <filter id="organic-glow"><feGaussianBlur stdDeviation="3.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  {[0, 20, 40, 60].map((value) => <line key={value} x1="0" x2={CHART_WIDTH} y1={yFor(value)} y2={yFor(value)} stroke="white" strokeOpacity="0.06" />)}
                  <path d={areaPath} fill="url(#organic-area)" style={{ opacity: 0, animation: "heroAreaFade 800ms ease-out 800ms forwards" }} />
                  <path d={linePath} fill="none" stroke="#e9af88" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#organic-glow)" pathLength="1000" strokeDasharray="1000" strokeDashoffset="1000" style={{ animation: "heroLineDraw 1800ms cubic-bezier(0.22,1,0.36,1) 150ms forwards" }} />
                  <line x1={pointX} x2={pointX} y1="0" y2={CHART_HEIGHT - PADDING_Y} stroke="#e9af88" strokeOpacity="0.4" strokeDasharray="3 4" />
                  <circle cx={pointX} cy={pointY} r="4.5" fill="#ffffff" filter="url(#organic-glow)" />
                </svg>

                {/* Tooltip anchored directly to peak */}
                <div
                  className="pointer-events-none absolute rounded-lg border border-[#e9af88]/30 bg-[#0B1521]/95 px-3 py-1.5 shadow-xl text-center z-20"
                  style={{
                    left: `${(pointX / CHART_WIDTH) * 100}%`,
                    top: `${(pointY / CHART_HEIGHT) * 100}%`,
                    transform: "translate(-85%, calc(-100% - 10px))",
                  }}
                >
                  <p className="text-xs font-bold text-white leading-tight font-sans tabular-nums">54.3K</p>
                  <p className="text-[9px] text-white/70 leading-tight mt-0.5 font-semibold font-sans tabular-nums">Jul 24, 2026</p>
                  {/* Tooltip Triangle Tail */}
                  <div className="absolute top-[calc(100%-5px)] left-[85%] -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-[#0B1521] border-r border-b border-[#e9af88]/30" />
                </div>

                {/* X-Axis Labels (9 labels distributed exactly) */}
                <div className="mt-3 flex justify-between text-[9px] md:text-[10px] text-white/60 px-0.5 font-semibold font-sans tabular-nums">
                  <span>Mar ’25</span>
                  <span>May ’25</span>
                  <span>Jul ’25</span>
                  <span>Sep ’25</span>
                  <span>Nov ’25</span>
                  <span>Jan ’26</span>
                  <span>Mar ’26</span>
                  <span>May ’26</span>
                  <span>Jul ’26</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
