"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

const ROTATE_X_DEG = 10;
const TILT_SCALE = 1.15;
const PERSPECTIVE_PX = 1200;

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

  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<SVGCircleElement>(null);
  const [pinPosition, setPinPosition] = useState<{ left: number; top: number } | null>(null);

  // The pin is drawn inside a 3D-tilted (rotateX + scale) layer, so its
  // rendered screen position doesn't match a flat percentage of the
  // container box. Measuring the actual rendered pin via
  // getBoundingClientRect (rather than re-deriving the CSS transform math)
  // means this stays correct no matter what ancestor transforms are
  // currently in effect.
  //
  // That matters here because the whole map sits inside a <Reveal>
  // entrance-animation wrapper, which holds an additional
  // `translate3d(...) scale(0.98)` transform until it scrolls into view,
  // then animates to `scale(1)` via a CSS transition. A ResizeObserver on
  // the container alone won't catch that transition finishing (the
  // container's own box size never changes, only its ancestor's
  // transform), so a stale pre-animation position would stick permanently.
  // Re-measure on any transitionend bubbling up from that animation too.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const pin = pinRef.current;
    if (!container || !pin) return;

    const updatePosition = () => {
      const containerRect = container.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();

      // getBoundingClientRect reports rendered/visual pixels, which can
      // differ from the element's layout size (offsetWidth/offsetHeight) —
      // e.g. under a page/viewport zoom. CSS `left`/`top` are resolved in
      // layout pixels, so convert the measured screen-space offset back to
      // layout pixels before assigning it, or the overlay drifts from the
      // pin by exactly that zoom ratio.
      const scaleX = containerRect.width / (container.offsetWidth || containerRect.width);
      const scaleY = containerRect.height / (container.offsetHeight || containerRect.height);

      setPinPosition({
        left: (pinRect.left + pinRect.width / 2 - containerRect.left) / scaleX,
        top: (pinRect.top + pinRect.height / 2 - containerRect.top) / scaleY,
      });
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(container);

    document.addEventListener("transitionend", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener("transitionend", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[2/1] bg-transparent rounded-lg relative font-sans"
      style={{
        perspective: `${PERSPECTIVE_PX}px`,
      }}
    >
      <div
        className="w-full h-full relative"
        style={{
          transform: `rotateX(${ROTATE_X_DEG}deg) scale(${TILT_SCALE})`,
          transformOrigin: "center center",
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

        {/* Vertical beam — short, stops just above the tooltip */}
        <rect
          x={x - 1}
          y={y - 55}
          width={2}
          height={55}
          fill="url(#beam-gradient)"
        />

        {/* Soft glow at the base of the beam */}
        <ellipse cx={x} cy={y} rx={24} ry={8} fill="url(#beam-glow)" />

        {/* Solid pin */}
        <circle ref={pinRef} cx={x} cy={y} r={3} fill={beamColor} />

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

      {pinPosition ? (
        <>
          {/* Interactive hover zone spanning the tooltip bubble down to the pin
              (kept flat above the tilted map) */}
          <div
            className="absolute -translate-x-1/2"
            style={{
              left: `${pinPosition.left}px`,
              top: `${pinPosition.top - 56}px`,
              width: "110px",
              height: "70px",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            tabIndex={0}
            aria-label={`${markerLabel} — ${previewCaption}`}
          />

          {/* "We are here" tooltip anchored to the marker, kept flat above the tilted map */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${pinPosition.left}px`,
              top: `${pinPosition.top}px`,
              transform: `translate(-50%, calc(-100% - 14px))`,
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
            className={`absolute pointer-events-none transition-all duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${pinPosition.left}px`,
              top: `${pinPosition.top}px`,
              transform: `translate(-50%, calc(-100% - 14px))`,
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
        </>
      ) : null}
    </div>
  );
}
