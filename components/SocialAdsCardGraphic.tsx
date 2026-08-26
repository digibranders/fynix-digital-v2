"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Social media advertising hero graphic.
 *
 * A targeting bullseye locks onto its audience while a sponsored ad creative
 * assembles alongside it: the locator dot snaps to centre, the "Match" pill
 * pops, the ad image and CTA settle in, and qualified "lead" bubbles lift off
 * the creative. The composition deliberately differs from the LinkedIn
 * profile-card and the social-media phone heroes so the advertising page owns a
 * distinct visual. Colour signature is the page's muted berry-rose accent. Click
 * to replay. Honours reduced-motion.
 */
export default function SocialAdsCardGraphic() {
  const prefersReducedMotion = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  // Concentric targeting rings (outer to inner).
  const rings: { r: number; strong?: boolean }[] = [
    { r: 92 },
    { r: 66 },
    { r: 40 },
    { r: 18, strong: true },
  ];
  const targetX = 138;
  const targetY = 196;

  // Rising qualified-lead bubbles that lift off the ad creative.
  const leads: { x: number; delay: number }[] = [
    { x: 322, delay: 2.6 },
    { x: 356, delay: 3.2 },
    { x: 300, delay: 3.8 },
  ];

  return (
    <div
      key={replayKey}
      onClick={handleReplay}
      className="relative w-full max-w-[500px] aspect-[500/380] select-none mx-auto cursor-pointer group"
      title="Click to replay animation"
    >
      <svg
        viewBox="0 0 500 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <radialGradient id="adRingGrad" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#F6E4EB" />
            <stop offset="100%" stopColor="#EBD0DB" />
          </radialGradient>

          <linearGradient id="adImageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b06a86" />
            <stop offset="100%" stopColor="#7d3f56" />
          </linearGradient>

          <linearGradient id="adCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FBF2F6" />
          </linearGradient>

          <linearGradient id="adPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F2DDE6" />
            <stop offset="100%" stopColor="#E7C9D6" />
          </linearGradient>

          <linearGradient id="adCtaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b06a86" />
            <stop offset="100%" stopColor="#8f4d67" />
          </linearGradient>

          <filter id="adSoftShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#0C1E2E" floodOpacity="0.16" />
          </filter>

          <filter id="adBubbleGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7d3f56" floodOpacity="0.35" />
          </filter>

          <clipPath id="adImageClip">
            <rect x="270" y="150" width="150" height="92" rx="12" />
          </clipPath>
        </defs>

        {/* ---- TARGETING BULLSEYE (left, behind) ---- */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: `${targetX}px ${targetY}px` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#adSoftShadow)"
        >
          {rings.map((ring, i) => (
            <motion.circle
              key={ring.r}
              cx={targetX}
              cy={targetY}
              r={ring.r}
              fill={ring.strong ? "url(#adImageGrad)" : "url(#adRingGrad)"}
              stroke={ring.strong ? "none" : "#E1BFCE"}
              strokeWidth="1.5"
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ transformOrigin: `${targetX}px ${targetY}px` }}
              transition={{
                duration: 0.55,
                delay: 0.4 + (rings.length - 1 - i) * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
          {/* Crosshair */}
          <line x1={targetX - 108} y1={targetY} x2={targetX + 108} y2={targetY} stroke="#D7B4C4" strokeWidth="1.5" strokeDasharray="4 5" />
          <line x1={targetX} y1={targetY - 108} x2={targetX} y2={targetY + 108} stroke="#D7B4C4" strokeWidth="1.5" strokeDasharray="4 5" />
        </motion.g>

        {/* Locator dot snapping to centre */}
        <motion.circle
          cx={targetX}
          cy={targetY}
          r="6"
          fill="#FFFFFF"
          initial={
            prefersReducedMotion
              ? { opacity: 1, x: 0, y: 0, scale: 1 }
              : { opacity: 0, x: -46, y: -38, scale: 0.5 }
          }
          whileInView={
            prefersReducedMotion
              ? { opacity: 1, x: 0, y: 0, scale: 1 }
              : { opacity: 1, x: 0, y: 0, scale: [0.5, 1.3, 1] }
          }
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Audience "Match" pill */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: `${targetX + 54}px ${targetY - 84}px` }}
          transition={{ type: "spring", stiffness: 340, damping: 18, delay: 1.7 }}
        >
          <rect x={targetX + 18} y={targetY - 96} width="88" height="26" rx="13" fill="#FFFFFF" stroke="#E1BFCE" strokeWidth="1" filter="url(#adBubbleGlow)" />
          <path d={`M ${targetX + 32} ${targetY - 83} l 4 4 l 8 -9`} stroke="#8f4d67" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x={targetX + 50} y={targetY - 79} fill="#4a1f30" fontFamily="sans-serif" fontSize="11" fontWeight="800">
            Audience
          </text>
        </motion.g>

        {/* ---- AD CREATIVE CARD (right, front) ---- */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: 24, x: 14 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#adSoftShadow)"
        >
          <rect x="252" y="70" width="186" height="256" rx="24" fill="url(#adCardGrad)" stroke="#EFDCE5" strokeWidth="1.5" />

          {/* Header: avatar, name, sponsored tag */}
          <circle cx="278" cy="102" r="13" fill="#F0DBE4" stroke="#E1BFCE" strokeWidth="1" />
          <circle cx="278" cy="98" r="4.5" fill="#a5607c" />
          <path d="M 269 116 C 269 109 273 107 278 107 C 283 107 287 109 287 116 Z" fill="#a5607c" />
          <rect x="300" y="94" width="66" height="8" rx="4" fill="url(#adPillGrad)" />
          <rect x="300" y="108" width="42" height="6" rx="3" fill="#F3E6EC" />
          <rect x="384" y="92" width="42" height="18" rx="9" fill="#F7EBF0" stroke="#E7C9D6" strokeWidth="1" />
          <text x="405" y="104.5" textAnchor="middle" fill="#8f4d67" fontFamily="sans-serif" fontSize="9" fontWeight="800">
            Ad
          </text>
        </motion.g>

        {/* Ad image */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "345px 196px" }}
          transition={{ duration: 0.6, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
        >
          <g clipPath="url(#adImageClip)">
            <rect x="270" y="150" width="150" height="92" fill="url(#adImageGrad)" />
            <circle cx="304" cy="182" r="13" fill="#FFFFFF" fillOpacity="0.85" />
            <path d="M 270 242 L 314 202 L 342 224 L 366 206 L 420 242 Z" fill="#FFFFFF" fillOpacity="0.3" />
          </g>
          <rect x="270" y="150" width="150" height="92" rx="12" fill="none" stroke="#EFDCE5" strokeWidth="1" />
        </motion.g>

        {/* Headline + CTA button */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.25, ease: "easeOut" }}
        >
          <rect x="270" y="256" width="120" height="8" rx="4" fill="url(#adPillGrad)" />
          <rect x="270" y="272" width="84" height="6" rx="3" fill="#F3E6EC" />
          <motion.g
            initial={prefersReducedMotion ? { scale: 1 } : { scale: 0.9, opacity: 0 }}
            whileInView={
              prefersReducedMotion ? { scale: 1 } : { scale: [0.9, 1.04, 1], opacity: 1 }
            }
            viewport={{ once: true }}
            style={{ transformOrigin: "345px 302px" }}
            transition={{ duration: 0.5, delay: 1.6, ease: "easeOut" }}
          >
            <rect x="270" y="290" width="150" height="26" rx="13" fill="url(#adCtaGrad)" />
            <text x="345" y="307" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="800">
              Learn More
            </text>
          </motion.g>
        </motion.g>

        {/* Rising qualified-lead bubbles */}
        {leads.map((lead, i) => (
          <motion.g
            key={i}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 0, scale: 0.5 }
            }
            whileInView={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: [0, 1, 1, 0], y: [0, -74, -112, -146], scale: [0.5, 1, 1, 0.9] }
            }
            viewport={{ once: true }}
            transition={{ duration: 2.2, delay: lead.delay, ease: "easeOut", times: [0, 0.2, 0.7, 1] }}
            filter="url(#adBubbleGlow)"
          >
            <circle cx={lead.x} cy="150" r="15" fill="#8f4d67" />
            <path d={`M ${lead.x - 6} 150 l 4 4 l 8 -9`} stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
