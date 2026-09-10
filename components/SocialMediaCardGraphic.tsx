"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Social media management hero graphic.
 *
 * A phone showing a live post assembles on view: the feed fills in, the like
 * heart pops, reactions rise off the screen, and a paired "reach" analytics
 * card grows its bars. The composition deliberately differs from the LinkedIn
 * profile-card hero so the social page owns a distinct visual. Colour signature
 * is the page's muted violet-plum accent. Click to replay. Honours
 * reduced-motion.
 */
export default function SocialMediaCardGraphic() {
  const prefersReducedMotion = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  // Rising reaction bubbles that lift off the phone screen.
  const reactions: { x: number; delay: number; kind: "heart" | "plus" }[] = [
    { x: 150, delay: 2.4, kind: "heart" },
    { x: 176, delay: 3.0, kind: "plus" },
    { x: 128, delay: 3.6, kind: "heart" },
  ];

  // Analytics bars that grow in the reach card.
  const bars: { x: number; h: number; strong?: boolean }[] = [
    { x: 276, h: 30 },
    { x: 310, h: 46 },
    { x: 344, h: 40 },
    { x: 378, h: 64 },
    { x: 412, h: 84, strong: true },
  ];
  const barBase = 250;

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
          <linearGradient id="smPhoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F9F7FC" />
            <stop offset="100%" stopColor="#ECE7F4" />
          </linearGradient>

          <linearGradient id="smPostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9285b8" />
            <stop offset="100%" stopColor="#5f5090" />
          </linearGradient>

          <linearGradient id="smPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E9E4F2" />
            <stop offset="100%" stopColor="#D8D0E8" />
          </linearGradient>

          <linearGradient id="smBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9285b8" />
            <stop offset="100%" stopColor="#6f5f9c" />
          </linearGradient>

          <linearGradient id="smBarStrong" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7a6bad" />
            <stop offset="100%" stopColor="#4a3d78" />
          </linearGradient>

          <linearGradient id="smCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F0FA" />
          </linearGradient>

          <filter id="smSoftShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#0C1E2E" floodOpacity="0.16" />
          </filter>

          <filter id="smBubbleGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#4a3d78" floodOpacity="0.35" />
          </filter>

          <clipPath id="smPostClip">
            <rect x="66" y="150" width="140" height="96" rx="12" />
          </clipPath>
        </defs>

        {/* ---- REACH ANALYTICS CARD (right, behind the phone) ---- */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 26, y: 12 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#smSoftShadow)"
        >
          <rect x="238" y="96" width="228" height="196" rx="26" fill="url(#smCardGrad)" stroke="#E7E1F1" strokeWidth="1.5" />
          <path d="M 270 97.5 L 434 97.5" stroke="white" strokeWidth="2" strokeLinecap="round" />

          <text x="262" y="132" fill="#33294d" fontFamily="sans-serif" fontSize="13" fontWeight="800">
            Reach
          </text>
          <text x="262" y="150" fill="#8a7fa6" fontFamily="sans-serif" fontSize="10" fontWeight="600">
            Last 30 days
          </text>

          {/* Growth pill */}
          <motion.g
            initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ transformOrigin: "420px 128px" }}
            transition={{ type: "spring", stiffness: 340, damping: 18, delay: 1.9 }}
          >
            <rect x="386" y="116" width="62" height="24" rx="12" fill="#EEEAF7" stroke="#D3CAE6" strokeWidth="1" />
            <path d="M 398 132 L 402 126 L 406 130 L 410 122" stroke="#4a3d78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <text x="416" y="132" fill="#4a3d78" fontFamily="sans-serif" fontSize="11" fontWeight="800">
              +38%
            </text>
          </motion.g>

          {/* Bars */}
          {bars.map((bar, i) => (
            <motion.rect
              key={bar.x}
              x={bar.x}
              y={barBase - bar.h}
              width="22"
              height={bar.h}
              rx="6"
              fill={bar.strong ? "url(#smBarStrong)" : "url(#smBarGrad)"}
              initial={prefersReducedMotion ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true }}
              style={{ transformOrigin: `${bar.x + 11}px ${barBase}px` }}
              transition={{ duration: 0.6, delay: 1.1 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
          <line x1="262" y1="252" x2="452" y2="252" stroke="#E2DAEF" strokeWidth="1.5" strokeLinecap="round" />
          <text x="262" y="276" fill="#5f5090" fontFamily="sans-serif" fontSize="11" fontWeight="700">
            48.2K accounts reached
          </text>
        </motion.g>

        {/* ---- PHONE (left, in front) ---- */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#smSoftShadow)"
        >
          <rect x="40" y="30" width="184" height="320" rx="34" fill="url(#smPhoneGrad)" stroke="#E7E1F1" strokeWidth="1.5" />
          <rect x="52" y="42" width="160" height="296" rx="24" fill="#FDFCFF" stroke="#EFEAF7" strokeWidth="1" />
          {/* Notch */}
          <rect x="112" y="50" width="40" height="7" rx="3.5" fill="#E2DAEF" />
        </motion.g>

        {/* Post header */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.75, ease: "easeOut" }}
        >
          <circle cx="80" cy="80" r="13" fill="#E6E0F1" stroke="#D3CAE6" strokeWidth="1" />
          <circle cx="80" cy="76" r="4.5" fill="#7a6bad" />
          <path d="M 71 90 C 71 83 75 81 80 81 C 85 81 89 83 89 90 Z" fill="#7a6bad" />
          <rect x="102" y="72" width="64" height="8" rx="4" fill="url(#smPillGrad)" />
          <rect x="102" y="86" width="40" height="6" rx="3" fill="#EBE6F4" />
        </motion.g>

        {/* Post image */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "136px 198px" }}
          transition={{ duration: 0.6, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
        >
          <g clipPath="url(#smPostClip)">
            <rect x="66" y="150" width="140" height="96" fill="url(#smPostGrad)" />
            <circle cx="98" cy="182" r="13" fill="#FFFFFF" fillOpacity="0.85" />
            <path d="M 66 246 L 108 204 L 134 226 L 158 208 L 206 246 Z" fill="#FFFFFF" fillOpacity="0.32" />
          </g>
          <rect x="66" y="150" width="140" height="96" rx="12" fill="none" stroke="#EFEAF7" strokeWidth="1" />
        </motion.g>

        {/* Like / comment / share row */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.25, ease: "easeOut" }}
        >
          {/* Heart pop */}
          <motion.g
            initial={prefersReducedMotion ? { scale: 1 } : { scale: 0.7 }}
            whileInView={prefersReducedMotion ? { scale: 1 } : { scale: [0.7, 1.25, 1] }}
            viewport={{ once: true }}
            style={{ transformOrigin: "78px 274px" }}
            transition={{ duration: 0.5, delay: 1.7, ease: "easeOut" }}
          >
            <motion.path
              d="M 78 268 c -4 -4 -11 -1.5 -11 4 c 0 5.5 11 11 11 11 c 0 0 11 -5.5 11 -11 c 0 -5.5 -7 -8 -11 -4 z"
              initial={prefersReducedMotion ? { fill: "#6f5f9c" } : { fill: "#EBE6F4" }}
              whileInView={{ fill: "#6f5f9c" }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 1.7 }}
            />
          </motion.g>
          <circle cx="112" cy="274" r="8.5" fill="none" stroke="#b3a9cd" strokeWidth="2" />
          <path d="M 138 268 h 16 v 10 h -10 l -4 4 z" fill="none" stroke="#b3a9cd" strokeWidth="2" strokeLinejoin="round" />
          <rect x="66" y="294" width="120" height="7" rx="3.5" fill="url(#smPillGrad)" />
          <rect x="66" y="308" width="86" height="7" rx="3.5" fill="#EBE6F4" />
        </motion.g>

        {/* Rising reaction bubbles */}
        {reactions.map((r, i) => (
          <motion.g
            key={i}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 0, scale: 0.5 }
            }
            whileInView={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: [0, 1, 1, 0], y: [0, -70, -108, -140], scale: [0.5, 1, 1, 0.9] }
            }
            viewport={{ once: true }}
            transition={{ duration: 2.2, delay: r.delay, ease: "easeOut", times: [0, 0.2, 0.7, 1] }}
            filter="url(#smBubbleGlow)"
          >
            <circle cx={r.x} cy="250" r="15" fill="#6f5f9c" />
            {r.kind === "heart" ? (
              <path
                d={`M ${r.x} 254 c -3 -3 -8 -1 -8 3 c 0 4 8 7 8 7 c 0 0 8 -3 8 -7 c 0 -4 -5 -6 -8 -3 z`}
                fill="#FFFFFF"
              />
            ) : (
              <text x={r.x} y="255" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontSize="14" fontWeight="800">
                +1
              </text>
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
