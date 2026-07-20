"use client";

import { useState } from "react";
import Image from "next/image";
import DottedMap from "dotted-map";

type Point = { lat: number; lng: number; label?: string };

type WorldMapProps = {
  marker?: Point;
  markerLabel?: string;
  beamColor?: string;
  previewImageSrc?: string;
  previewImageAlt?: string;
  previewCaption?: string;
};

const map = new DottedMap({ height: 100, grid: "diagonal" });

const svgMap = map.getSVG({
  radius: 0.35,
  color: "#00000030",
  shape: "circle",
  backgroundColor: "transparent",
});

function projectPoint(lat: number, lng: number) {
  const x = (lng + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);
  return { x, y };
}

export default function WorldMap({
  marker = { lat: 2.490811289312971, lng: 77.29931092228902 },
  markerLabel = "We are here",
  beamColor = "#3B82F6",
  previewImageSrc = "/solus.webp",
  previewImageAlt = "Solus building",
  previewCaption = "Solus building",
}: WorldMapProps) {
  const { x, y } = projectPoint(marker.lat, marker.lng);
  const [isHovered, setIsHovered] = useState(false);

  const leftPct = (x / 800) * 100;
  const topPct = (y / 400) * 100;

  return (
    <div
      className="w-full aspect-[2/1] bg-transparent rounded-lg relative font-sans"
      style={{
        perspective: "1200px",
      }}
    >
      <div
        className="w-full h-full relative"
        style={{
          transform: "rotateX(18deg)",
          transformOrigin: "center bottom",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URI, not optimizable by next/image */}
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="h-full w-full [mask-image:linear-gradient(to_top,transparent,white_10%)] pointer-events-none select-none"
          alt="world map"
          height={495}
          width={1056}
          draggable={false}
        />
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full absolute inset-0 pointer-events-none select-none"
        >
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={beamColor} stopOpacity="0" />
            <stop offset="100%" stopColor={beamColor} stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="beam-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={beamColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={beamColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Vertical beam from top of viewport down to the marker */}
        <rect
          x={x - 1}
          y={0}
          width={2}
          height={y}
          fill="url(#beam-gradient)"
        />

        {/* Soft glow at the base of the beam */}
        <ellipse cx={x} cy={y} rx={24} ry={8} fill="url(#beam-glow)" />

        {/* Solid pin */}
        <circle cx={x} cy={y} r={3} fill={beamColor} />

        {/* Pulsing ring */}
        <circle cx={x} cy={y} r={3} fill={beamColor} opacity={0.5}>
          <animate
            attributeName="r"
            from={3}
            to={12}
            dur="2s"
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from={0.5}
            to={0}
            dur="2s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>
        </svg>
      </div>

      {/* Interactive hover zone over the marker (kept flat above the tilted map) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        tabIndex={0}
        aria-label={`${markerLabel} — ${previewCaption}`}
      >
        <div className="h-6 w-6 rounded-full" />
      </div>

      {/* "We are here" tooltip anchored to the marker, kept flat above the tilted map */}
      <div
        className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
        }}
      >
        <div
          className={`relative mb-6 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs text-[#1a1a1a] shadow-sm whitespace-nowrap transition-opacity duration-200 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          {markerLabel}
          <span
            aria-hidden
            className="absolute left-1/2 top-full -translate-x-1/2 -mt-px h-2 w-2 rotate-45 border-b border-r border-black/10 bg-white"
          />
        </div>
      </div>

      {/* Preview card revealed on hover */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-200 ${
          isHovered ? "opacity-100 translate-y-[calc(-100%-2px)]" : "opacity-0"
        }`}
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
        }}
      >
        <div className="relative mb-6 rounded-lg border border-black/10 bg-white p-2 shadow-lg">
          <div className="relative h-32 w-24 overflow-hidden rounded-md bg-neutral-100">
            <Image
              src={previewImageSrc}
              alt={previewImageAlt}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="mt-1.5 text-center text-[11px] font-medium text-[#1a1a1a] whitespace-nowrap">
            {previewCaption}
          </div>
          <span
            aria-hidden
            className="absolute left-1/2 top-full -translate-x-1/2 -mt-px h-2 w-2 rotate-45 border-b border-r border-black/10 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
