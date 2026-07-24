"use client";

import { useEffect, useRef, useState } from "react";

type IconName = "cursor" | "eye" | "trend" | "target";
type MetricKey = "clicks" | "impressions" | "ctr" | "position";

type ChartPalette = {
  line: string;
  areaTop: string;
  areaMid: string;
  peakGuide: string;
  peakDot: string;
  tooltipBorder: string;
};

type Metric = {
  key: MetricKey;
  label: string;
  value: string;
  change: string;
  icon: IconName;
  negative?: boolean;
  chartLabel: string;
  yMax: number;
  yTicks: [string, string, string, string];
  data: number[];
  invertY?: boolean;
  palette: ChartPalette;
};

const PALETTES: Record<MetricKey, ChartPalette> = {
  clicks: {
    line: "#5aa9ff",
    areaTop: "#4b91ff",
    areaMid: "#3d7fe0",
    peakGuide: "#8bbfff",
    peakDot: "#e6f0ff",
    tooltipBorder: "#7aabd8",
  },
  impressions: {
    line: "#b088ff",
    areaTop: "#a175f6",
    areaMid: "#8a5ee6",
    peakGuide: "#c6a8ff",
    peakDot: "#efe4ff",
    tooltipBorder: "#a48fd4",
  },
  ctr: {
    line: "#6fd47b",
    areaTop: "#5cc871",
    areaMid: "#4bb35f",
    peakGuide: "#9fe2a7",
    peakDot: "#e0f7e4",
    tooltipBorder: "#85c58f",
  },
  position: {
    line: "#ffad61",
    areaTop: "#ef8b51",
    areaMid: "#d86d3f",
    peakGuide: "#f7a062",
    peakDot: "#ffe7c9",
    tooltipBorder: "#d99976",
  },
};

const CHART_WIDTH = 680;
const CHART_HEIGHT = 236;
const CHART_PADDING = { x: 8, y: 12 };
const POINT_COUNT = 96;

// Deterministic pseudo-random noise so each series has a unique jitter fingerprint.
function jitter(seed: number, index: number) {
  const v = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v) - 0.5;
}

function round(value: number, decimals: number) {
  const p = 10 ** decimals;
  return Math.round(value * p) / p;
}

// Impressions: gently rising trend with sine-wave bumps, campaign lifts leading
// into a Dec 28 spike, then a retained lift afterwards. Original pattern.
const IMPRESSIONS_DATA = Array.from({ length: POINT_COUNT }, (_, i) => {
  const campaignIndex = 53;
  if (i === campaignIndex) return 54.3;
  const baseline = 7 + i * 0.36;
  const variation = Math.sin(i * 0.74) * 1.6 + Math.cos(i * 1.87);
  const lifts: Record<number, number> = { 38: 9, 48: 6, 51: 11, 52: 17 };
  const lift = lifts[i] ?? 0;
  const retained = i > campaignIndex ? 4 + (i - campaignIndex) * 0.16 : 0;
  return round(baseline + variation + lift + retained, 1);
});

// Clicks: organic climb — a rising trend with multi-frequency wobble and
// natural noise, ending near the top of the yMax band.
const CLICKS_DATA = Array.from({ length: POINT_COUNT }, (_, i) => {
  const t = i / (POINT_COUNT - 1);
  // Slight ease-in-out trend from ~5 up to ~40 by the end.
  const trend = 5 + (40 - 5) * (t * t * (3 - 2 * t));
  // Layered sines at different periods give the line an unpredictable shape.
  const swell = Math.sin(i * 0.31) * 2.6 + Math.sin(i * 0.72) * 1.4 + Math.cos(i * 1.18) * 0.9;
  // A couple of soft, non-round bumps that break the symmetry.
  const bumps = (i === 22 ? 2.4 : 0) + (i === 44 ? -1.9 : 0) + (i === 71 ? 3.1 : 0);
  // Pseudo-random noise for point-to-point jitter.
  const noise = jitter(2, i) * 1.8;
  return round(Math.max(1.5, trend + swell + bumps + noise), 1);
});

// CTR: volatile — high-frequency oscillation around a rising trend that
// accelerates in the final third for a clear tail elevation.
const CTR_DATA = Array.from({ length: POINT_COUNT }, (_, i) => {
  const t = i / (POINT_COUNT - 1);
  const tail = Math.max(0, (t - 0.6) / 0.4);
  const trend = 0.26 + 0.48 * t + 0.32 * tail * tail;
  const oscillation = Math.sin(i * 1.9) * 0.12 + Math.sin(i * 0.55) * 0.08;
  const spikes = i === 41 ? 0.28 : i === 67 ? 0.22 : 0;
  return round(Math.min(1.18, Math.max(0.08, trend + oscillation + spikes + jitter(3, i) * 0.045)), 2);
});

// Position: descending zig-zag with a mid-year plunge (better = lower).
const POSITION_DATA = Array.from({ length: POINT_COUNT }, (_, i) => {
  const t = i / (POINT_COUNT - 1);
  const easedDrop = 34 - 28 * (t * t * (3 - 2 * t));
  const zig = Math.sin(i * 0.42) * 3.2 + Math.cos(i * 1.15) * 1.8;
  const dip = i >= 46 && i <= 58 ? -4 : 0;
  const value = easedDrop + zig + dip + jitter(4, i) * 1.1;
  return round(Math.max(2.5, Math.min(40, value)), 1);
});

const METRICS: Metric[] = [
  {
    key: "clicks",
    label: "Total Clicks",
    value: "48.1K",
    change: "32.6%",
    icon: "cursor",
    chartLabel: "Clicks",
    yMax: 45,
    yTicks: ["45K", "30K", "15K", "0"],
    data: CLICKS_DATA,
    palette: PALETTES.clicks,
  },
  {
    key: "impressions",
    label: "Total Impressions",
    value: "7.31M",
    change: "41.2%",
    icon: "eye",
    chartLabel: "Impressions",
    yMax: 60,
    yTicks: ["60K", "40K", "20K", "0"],
    data: IMPRESSIONS_DATA,
    palette: PALETTES.impressions,
  },
  {
    key: "ctr",
    label: "Average CTR",
    value: "0.7%",
    change: "8.7%",
    icon: "trend",
    chartLabel: "CTR",
    yMax: 1.2,
    yTicks: ["1.2%", "0.8%", "0.4%", "0%"],
    data: CTR_DATA,
    palette: PALETTES.ctr,
  },
  {
    key: "position",
    label: "Average Position",
    value: "15.2",
    change: "4.3%",
    icon: "target",
    chartLabel: "Position",
    yMax: 45,
    yTicks: ["0", "15", "30", "45"],
    data: POSITION_DATA,
    invertY: true,
    palette: PALETTES.position,
  },
];

const SERIES_START = new Date(2025, 2, 1).getTime();
const SERIES_END = new Date(2026, 6, 31).getTime();
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function dateForIndex(index: number) {
  const ms = SERIES_START + (index / (POINT_COUNT - 1)) * (SERIES_END - SERIES_START);
  return DATE_FORMATTER.format(new Date(ms));
}

function formatMetricValue(key: MetricKey, value: number) {
  if (key === "ctr") return `${value.toFixed(2)}%`;
  if (key === "position") return value.toFixed(1);
  return `${value.toFixed(1)}K`;
}

function peakOf(data: number[], invert = false) {
  let idx = 0;
  for (let i = 1; i < data.length; i++) {
    if (invert ? data[i] < data[idx] : data[i] > data[idx]) idx = i;
  }
  return idx;
}

function xFor(index: number) {
  return CHART_PADDING.x + (index * (CHART_WIDTH - CHART_PADDING.x * 2)) / (POINT_COUNT - 1);
}

function yFor(value: number, yMax: number, invert = false) {
  const ratio = invert ? value / yMax : 1 - value / yMax;
  return CHART_PADDING.y + ratio * (CHART_HEIGHT - CHART_PADDING.y * 2);
}

function MetricIcon({ name }: { name: IconName }) {
  const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      {name === "cursor" && <path {...line} d="m6 3 11 9-5.9 1.5L9.6 20 6 3Z" />}
      {name === "eye" && <><path {...line} d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" /><circle {...line} cx="12" cy="12" r="2" /></>}
      {name === "trend" && <path {...line} d="m4 16 5-5 3 3 7-7M15 7h4v4" />}
      {name === "target" && <><circle {...line} cx="12" cy="12" r="7" /><circle {...line} cx="12" cy="12" r="3" /></>}
    </svg>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  const num = parseInt(value, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function MetricCard({ metric, active, onSelect }: { metric: Metric; active: boolean; onSelect: () => void }) {
  const { palette } = metric;
  const activeStyle = active
    ? {
        borderColor: rgba(palette.line, 0.55),
        background: `linear-gradient(145deg, ${rgba(palette.areaTop, 0.2)} 0%, rgba(27,27,37,0.12) 58%, rgba(10,18,31,0.26) 100%)`,
        boxShadow: `inset 0 1px 0 ${rgba(palette.peakDot, 0.12)}, 0 12px 28px rgba(0,0,0,0.12)`,
      }
    : undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      title={active ? `${metric.label} — currently viewing` : `View ${metric.label}`}
      style={activeStyle}
      className={`group/card relative text-left rounded-[13px] border px-2.5 py-2.5 sm:px-3 sm:py-3 md:px-3.5 md:py-3.5 outline-none cursor-pointer transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-white/40 ${active ? "" : "border-white/[0.075] bg-[#0d1726]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.018)] hover:border-white/20 hover:bg-[#0d1726]/60 hover:-translate-y-[1px]"}`}
    >
      {/* Interactivity signal */}
      <span
        aria-hidden
        style={
          active
            ? { backgroundColor: rgba(palette.line, 0.22), color: palette.peakDot }
            : undefined
        }
        className={`pointer-events-none absolute top-2 right-2 sm:top-2.5 sm:right-2.5 inline-flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full transition-[background-color,color,opacity] duration-200 ${
          active
            ? "opacity-100"
            : "text-white/40 opacity-60 group-hover/card:text-white/85 group-hover/card:opacity-100"
        }`}
      >
        <svg viewBox="0 0 16 16" className="h-2 w-2 sm:h-2.5 sm:w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 3 11 8 6 13" />
        </svg>
      </span>
      <span
        style={
          active
            ? {
                backgroundColor: palette.line,
                color: "#141520",
                boxShadow: `0 0 18px ${rgba(palette.line, 0.45)}`,
              }
            : undefined
        }
        className={`mb-2 sm:mb-3 inline-flex h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 items-center justify-center rounded-full transition-colors ${active ? "" : "bg-[#223047] text-white/75 group-hover/card:bg-[#2b3a55]"}`}
      >
        <MetricIcon name={metric.icon} />
      </span>
      <p className="text-[10px] font-semibold tracking-[-0.015em] text-white/75 sm:text-[11px] md:text-xs truncate">{metric.label}</p>
      <p className="mt-1 text-lg font-normal leading-none tracking-[-0.05em] text-white sm:text-2xl md:text-[28px] lg:text-[36px] tabular-nums">{metric.value}</p>
    </button>
  );
}

/**
 * A standalone search-performance dashboard matching the supplied reference.
 * It can be rendered directly inside any server or client component.
 */
export default function OrganicPerformanceOverview() {
  const [activeKey, setActiveKey] = useState<MetricKey>("impressions");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const active = METRICS.find((m) => m.key === activeKey) ?? METRICS[1];
  const { data, yMax, chartLabel, yTicks, invertY, palette, change, negative } = active;
  const peakIndex = peakOf(data, invertY);
  const peakDisplay = formatMetricValue(activeKey, data[peakIndex]);
  const peakDate = dateForIndex(peakIndex);

  // Intro animation: cursor starts at the middle of the timeline and slowly slides
  // toward the peak over 3 seconds. Cancelled the moment the user hovers.
  const [introPosition, setIntroPosition] = useState<number | null>(Math.floor((data.length - 1) / 2));
  const introTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const start = Math.floor((data.length - 1) / 2);
    const end = peakIndex;
    const distance = Math.abs(end - start);
    const duration = Math.min(3600, Math.max(1600, distance * 70));
    const startTime = performance.now();
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = -(Math.cos(Math.PI * t) - 1) / 2;
      const position = start + (end - start) * eased;
      setIntroPosition(t >= 1 ? null : position);
      if (t < 1) introTimerRef.current = window.setTimeout(tick, 16);
    };
    introTimerRef.current = window.setTimeout(tick, 0);
    return () => {
      cancelled = true;
      if (introTimerRef.current !== null) window.clearTimeout(introTimerRef.current);
    };
  }, [activeKey, data.length, peakIndex]);

  const cancelIntro = () => {
    if (introTimerRef.current !== null) {
      window.clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setIntroPosition(null);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    cancelIntro();
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const rel = (event.clientX - rect.left) / rect.width;
    const raw = Math.round(rel * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, raw));
    setHoverIndex(clamped);
  };
  const clearHover = () => setHoverIndex(null);

  const linePath = data
    .map((value, index) => `${index ? "L" : "M"}${xFor(index).toFixed(1)},${yFor(value, yMax, invertY).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${xFor(data.length - 1).toFixed(1)},${CHART_HEIGHT - CHART_PADDING.y} L${xFor(0).toFixed(1)},${CHART_HEIGHT - CHART_PADDING.y} Z`;
  const endIndex = data.length - 1;
  const endX = xFor(endIndex);
  const endY = yFor(data[endIndex], yMax, invertY);
  const gridValues = [yMax, yMax * (2 / 3), yMax / 3, 0];
  const chipArrowTone = negative ? "#ff8080" : "#4ade80";

  const hovering = hoverIndex !== null;
  const intro = !hovering && introPosition !== null;
  const cursorPosition = hovering ? hoverIndex! : (intro ? introPosition! : peakIndex);
  const clampedPosition = Math.max(0, Math.min(data.length - 1, cursorPosition));
  const lower = Math.floor(clampedPosition);
  const upper = Math.min(data.length - 1, Math.ceil(clampedPosition));
  const frac = clampedPosition - lower;
  const cursorIndex = Math.round(clampedPosition);
  const interpolatedValue = data[lower] + (data[upper] - data[lower]) * frac;
  const cursorX = xFor(clampedPosition);
  const cursorY = yFor(intro ? interpolatedValue : data[cursorIndex], yMax, invertY);
  const tooltipValue = hovering || intro
    ? formatMetricValue(activeKey, intro ? interpolatedValue : data[cursorIndex])
    : peakDisplay;
  const tooltipDate = hovering || intro ? dateForIndex(cursorIndex) : peakDate;
  const tooltipAbove = cursorY > CHART_HEIGHT * 0.35;
  const tooltipAlignRight = cursorX > CHART_WIDTH * 0.78;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const card = cardRef.current;
    if (!wrapper || !card) return;

    const handleResize = () => {
      const parentWidth = wrapper.getBoundingClientRect().width;
      const targetWidth = 660;
      if (parentWidth > 0 && parentWidth < targetWidth) {
        const s = parentWidth / targetWidth;
        setScale(s);
        setScaledHeight(card.offsetHeight * s);
      } else {
        setScale(1);
        setScaledHeight(undefined);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(wrapper);
    handleResize();

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={wrapperRef}
      className="@container/dashboard relative isolate mx-auto w-full max-w-[660px] select-none py-2 lg:py-0 text-white [font-family:var(--font-sans),ui-sans-serif,sans-serif]"
      style={scaledHeight ? { height: `${scaledHeight}px` } : undefined}
      aria-label="Organic Performance Overview"
    >
      <style>{`
        @keyframes organicPerformanceDraw { to { stroke-dashoffset: 0; } }
        @keyframes organicPerformanceFill { to { opacity: 1; } }
        @keyframes organicPerformanceChip { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .organic-performance-line { animation: none !important; stroke-dashoffset: 0 !important; }
          .organic-performance-area { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div aria-hidden className="absolute -inset-x-10 inset-y-10 -z-10 rounded-[48px] bg-[#f28d55]/10 blur-[70px]" />
      <div
        ref={cardRef}
        style={
          scale < 1
            ? {
                transform: `scale(${scale}) perspective(2400px) rotateY(-9deg) rotateX(3deg)`,
                transformOrigin: "top left",
                width: "660px",
                maxWidth: "660px",
              }
            : undefined
        }
        className="relative overflow-hidden rounded-[25px] border border-[#e2b09c]/45 border-r-[#ffc69b]/70 bg-[linear-gradient(135deg,#111c2d_0%,#0c1422_55%,#101b2b_100%)] p-4 shadow-[0_0_0_1px_rgba(255,229,213,0.06),0_28px_60px_rgba(0,0,0,0.7),4px_1px_3px_-2px_rgba(255,223,190,0.6),9px_4px_15px_0_rgba(255,139,67,0.24),16px_9px_34px_3px_rgba(236,99,37,0.11)] will-change-transform [transform-style:preserve-3d] [backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] sm:p-5 md:p-6 lg:p-7 md:[transform-origin:right_center] md:[transform:perspective(2400px)_rotateY(-9deg)_rotateX(3deg)_translateZ(0)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.15)_0.7px,transparent_0.7px)] [background-size:16px_16px]" />
        {/* A restrained copper edge with only a small lower-corner light spill. */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-[2%] z-20 h-px w-[30%] rounded-full bg-[linear-gradient(to_left,rgba(255,213,173,0.8),rgba(255,131,60,0.5)_45%,transparent)] shadow-[0_2px_5px_rgba(255,126,48,0.28),5px_4px_12px_rgba(255,101,32,0.14)]" />

        <div className="relative">
          <header className="flex items-center justify-between gap-4">
            <h2 className="text-xs font-semibold tracking-[-0.035em] text-white/90 sm:text-base">Organic Performance Overview</h2>
            <button type="button" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.06] px-2.5 py-1.5 text-[10px] font-semibold text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-3.5 sm:py-2 sm:text-xs" aria-label="Date range: Last 16 months">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
              Last 16 months
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-white/60" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </button>
          </header>

          <div className="mt-4 sm:mt-5 flex items-center">
            <span className="text-[9px] font-mono uppercase tracking-[0.28em] text-white/55 font-semibold whitespace-nowrap">
              Select a metric
              <span aria-hidden className="ml-1.5 text-[#ffb079]">→</span>
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3" role="tablist" aria-label="Metrics">
            {METRICS.map((metric) => (
              <MetricCard key={metric.key} metric={metric} active={metric.key === activeKey} onSelect={() => setActiveKey(metric.key)} />
            ))}
          </div>

          <div className="mt-7">
            <p className="mb-3 text-xs font-semibold tracking-[-0.02em] text-white/85">{chartLabel}</p>
            <div className="relative pl-8 sm:pl-9">
              <div className="absolute inset-y-0 left-0 flex flex-col justify-between pb-5 text-[9px] font-semibold text-white/65 sm:text-[10px] tabular-nums">
                {yTicks.map((tick) => <span key={tick}>{tick}</span>)}
              </div>
              <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="block h-[158px] w-full cursor-crosshair overflow-visible touch-pan-y sm:h-[210px]"
                preserveAspectRatio="none"
                role="img"
                aria-label={`${chartLabel} trend over the last 16 months. Hover to inspect any point.`}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerMove}
                onPointerLeave={clearHover}
                onPointerCancel={clearHover}
              >
                <defs>
                  <linearGradient id={`organic-performance-area-${activeKey}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor={palette.areaTop} stopOpacity="0.36" />
                    <stop offset="0.75" stopColor={palette.areaMid} stopOpacity="0.1" />
                    <stop offset="1" stopColor={palette.areaMid} stopOpacity="0" />
                  </linearGradient>
                  <filter id="organic-performance-glow" x="-20%" y="-25%" width="140%" height="150%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                {gridValues.map((value, index) => <line key={index} x1="0" x2={CHART_WIDTH} y1={yFor(value, yMax, invertY)} y2={yFor(value, yMax, invertY)} stroke="white" strokeOpacity="0.07" />)}
                <path key={`area-${activeKey}`} className="organic-performance-area" d={areaPath} fill={`url(#organic-performance-area-${activeKey})`} opacity="0" style={{ animation: "organicPerformanceFill 900ms ease-out 450ms forwards" }} pointerEvents="none" />
                <path key={`line-${activeKey}`} className="organic-performance-line" d={linePath} fill="none" stroke={palette.line} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" filter="url(#organic-performance-glow)" pathLength="1000" strokeDasharray="1000" strokeDashoffset="1000" style={{ animation: "organicPerformanceDraw 1200ms cubic-bezier(0.22,1,0.36,1) 80ms forwards" }} pointerEvents="none" />
                <line
                  x1={cursorX}
                  x2={cursorX}
                  y1={cursorY}
                  y2={CHART_HEIGHT - CHART_PADDING.y}
                  stroke={palette.peakGuide}
                  strokeOpacity={hovering ? 0.8 : 0.55}
                  strokeDasharray="3 4"
                  pointerEvents="none"
                />
                <circle
                  cx={cursorX}
                  cy={cursorY}
                  r={hovering ? 4.5 : 3.5}
                  fill={palette.peakDot}
                  stroke={hovering ? palette.line : "none"}
                  strokeWidth={hovering ? 1.5 : 0}
                  filter="url(#organic-performance-glow)"
                  pointerEvents="none"
                />
                <rect
                  x="0"
                  y="0"
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  fill="transparent"
                />
              </svg>
              <div
                key={`endchip-${activeKey}`}
                className="pointer-events-none absolute z-10 text-[11px] font-bold leading-none tracking-[-0.02em] tabular-nums text-white [text-shadow:0_0_6px_rgba(0,0,0,0.9),0_1px_2px_rgba(0,0,0,0.9)]"
                style={{
                  left: `${(endX / CHART_WIDTH) * 100}%`,
                  top: `${(endY / CHART_HEIGHT) * 100}%`,
                  transform: "translate(-10%, calc(-100% - 8px))",
                  opacity: 0,
                  animation: "organicPerformanceChip 500ms cubic-bezier(0.22,1,0.36,1) 1350ms forwards",
                }}
              >
                <span style={{ color: chipArrowTone }}>{negative ? "↓" : "↑"}</span> {change}
              </div>

              <div
                className="pointer-events-none absolute z-10 rounded-lg bg-[#121d2d]/95 px-3 py-1.5 shadow-[0_10px_22px_rgba(0,0,0,0.32)] transition-[left,top] duration-100 ease-out"
                style={{
                  left: `${(cursorX / CHART_WIDTH) * 100}%`,
                  top: `${(cursorY / CHART_HEIGHT) * 100}%`,
                  transform: `translate(${tooltipAlignRight ? "calc(-100% - 10px)" : "10px"}, ${tooltipAbove ? "calc(-100% - 9px)" : "9px"})`,
                  border: `1px solid ${palette.tooltipBorder}66`,
                }}
              >
                <p className="text-sm font-bold leading-none tracking-[-0.04em] text-white tabular-nums">{tooltipValue}</p>
                <p className="mt-1 text-[10px] font-semibold leading-none text-white/75 tabular-nums">{tooltipDate}</p>
                {tooltipAbove ? (
                  <span
                    className="absolute -bottom-[5px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#121d2d]"
                    style={{
                      left: tooltipAlignRight ? "100%" : 0,
                      borderRight: `1px solid ${palette.tooltipBorder}66`,
                      borderBottom: `1px solid ${palette.tooltipBorder}66`,
                    }}
                  />
                ) : (
                  <span
                    className="absolute -top-[5px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#121d2d]"
                    style={{
                      left: tooltipAlignRight ? "100%" : 0,
                      borderLeft: `1px solid ${palette.tooltipBorder}66`,
                      borderTop: `1px solid ${palette.tooltipBorder}66`,
                    }}
                  />
                )}
              </div>
              <div className="mt-3 flex justify-between text-[9px] font-semibold text-white/65 sm:text-[10px] tabular-nums">
                <span>Mar ’25</span><span>Jul ’25</span><span>Nov ’25</span><span>Mar ’26</span><span>Jul ’26</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
