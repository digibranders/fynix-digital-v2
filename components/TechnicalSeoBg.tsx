"use client";

import React from "react";

// Technical SEO Section Background
// Premium watermark wave backdrop:
// 1. Soft watermark hairline contour lines.
// 2. Ultra-soft background washes for a clean, non-intrusive feel.

export default function TechnicalSeoBg() {
  // Generate 24 watermark contour lines for the main bottom wave
  const bottomLines = Array.from({ length: 24 }, (_, i) => {
    const offset = i * 8;
    // Soft watermark opacity: peak at 0.12, outer edges at 0.02
    const opacity = 0.02 + (1 - Math.abs(i - 12) / 13) * 0.10;
    const d = `
      M ${-40} ${210 + offset}
      C ${180 + i * 3} ${370 + offset * 0.9},
        ${420 + i * 5} ${670 + offset * 0.6},
        ${760 + i * 4} ${700 + offset * 0.4}
      C ${1040 + i * 2} ${720 + offset * 0.2},
        ${1260 - i * 2} ${550 - offset * 0.3},
        ${1480} ${350 + offset * 0.7}
    `;
    return { d, opacity };
  });

  // Generate 18 watermark contour lines for the top-right wave
  const topRightLines = Array.from({ length: 18 }, (_, i) => {
    const offset = i * 7;
    const opacity = 0.02 + (1 - Math.abs(i - 9) / 10) * 0.09;
    const d = `
      M ${720 + offset * 7} ${-20}
      C ${900 + offset * 4.5} ${70 + offset * 1.8},
        ${1100 + offset * 2} ${210 + offset * 1.1},
        ${1300 + offset} ${150 + offset * 0.7}
      C ${1390 + offset * 0.5} ${120 + offset * 0.4},
        ${1440} ${75 + offset * 0.2},
        ${1480} ${15 + offset * 0.1}
    `;
    return { d, opacity };
  });

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full min-w-[1200px]"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Soft base background canvas */}
          <linearGradient id="seo-bg-canvas" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDFB" />
            <stop offset="60%" stopColor="#FFF9F5" />
            <stop offset="100%" stopColor="#FFF4EF" />
          </linearGradient>

          {/* Soft ambient radial glow bottom-left */}
          <radialGradient id="bottom-left-glow" cx="15%" cy="85%" r="65%">
            <stop offset="0%" stopColor="#FDCBAE" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#FDE3D4" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#FFF9F5" stopOpacity="0" />
          </radialGradient>

          {/* Soft ambient radial glow top-right */}
          <radialGradient id="top-right-glow" cx="85%" cy="15%" r="55%">
            <stop offset="0%" stopColor="#FDCBAE" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#FDE3D4" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#FFF9F5" stopOpacity="0" />
          </radialGradient>

          {/* Watermark wave fill 1 */}
          <linearGradient id="wave-fill-main" x1="0%" y1="20%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFEFE5" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#FDD5C0" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#F9B38B" stopOpacity="0.02" />
          </linearGradient>

          {/* Watermark wave fill 2 */}
          <linearGradient id="wave-fill-soft" x1="10%" y1="0%" x2="100%" y2="90%">
            <stop offset="0%" stopColor="#FFF6EF" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#FEE9DC" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FDCCA9" stopOpacity="0.02" />
          </linearGradient>

          {/* Watermark top right wave fill */}
          <linearGradient id="top-wave-fill" x1="50%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2EA" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#FEE0CE" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#F9B890" stopOpacity="0.01" />
          </linearGradient>

          {/* Soft watermark stroke gradient */}
          <linearGradient id="contour-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E58E5E" />
            <stop offset="45%" stopColor="#EC9D6E" />
            <stop offset="80%" stopColor="#F2B088" />
            <stop offset="100%" stopColor="#F7C4A5" />
          </linearGradient>

          {/* Soft dot matrix pattern */}
          <pattern id="dot-matrix" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.25" fill="#E58E5E" fillOpacity="0.18" />
          </pattern>
        </defs>

        {/* Base Background Fill */}
        <rect width="1440" height="800" fill="url(#seo-bg-canvas)" />
        <rect width="1440" height="800" fill="url(#bottom-left-glow)" />
        <rect width="1440" height="800" fill="url(#top-right-glow)" />

        {/* Top-Left Dot Matrix */}
        <g transform="translate(36, 32)">
          <rect width="56" height="70" fill="url(#dot-matrix)" />
        </g>

        {/* Bottom-Right Dot Matrix */}
        <g transform="translate(1340, 700)">
          <rect width="70" height="56" fill="url(#dot-matrix)" />
        </g>

        {/* Subtle Top-Right Soft Wave Fill */}
        <path
          d="M 680 -10 C 850 110, 1080 230, 1280 160 C 1380 125, 1420 50, 1450 -10 Z"
          fill="url(#top-wave-fill)"
        />

        {/* Subtle Bottom Soft Wave Fill Layer 1 */}
        <path
          d="M -20 280
             C 180 400, 420 580, 740 610
             C 1020 630, 1250 490, 1460 320
             L 1460 820 L -20 820 Z"
          fill="url(#wave-fill-soft)"
        />

        {/* Subtle Bottom Wave Fill Layer 2 */}
        <path
          d="M -20 500
             C 160 560, 360 660, 680 700
             C 980 740, 1220 610, 1460 450
             L 1460 820 L -20 820 Z"
          fill="url(#wave-fill-main)"
        />

        {/* Hairline Watermark Top-Right Ribbon Contour Lines */}
        <g stroke="url(#contour-stroke)" strokeWidth="0.75" strokeLinecap="round">
          {topRightLines.map((line, idx) => (
            <path key={idx} d={line.d} strokeOpacity={line.opacity} />
          ))}
        </g>

        {/* Hairline Watermark Bottom Ribbon Contour Lines */}
        <g stroke="url(#contour-stroke)" strokeWidth="0.75" strokeLinecap="round">
          {bottomLines.map((line, idx) => (
            <path key={idx} d={line.d} strokeOpacity={line.opacity} />
          ))}
        </g>
      </svg>
    </div>
  );
}
