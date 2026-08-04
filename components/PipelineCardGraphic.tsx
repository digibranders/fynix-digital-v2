"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function PipelineCardGraphic() {
  const prefersReducedMotion = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

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
          {/* ── Main White Clay Card Gradient ── */}
          <linearGradient id="mainLeadCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FAF8F4" />
            <stop offset="100%" stopColor="#EFECE5" />
          </linearGradient>

          {/* ── Inactive Stage Button Gradient ── */}
          <linearGradient id="btnInactiveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F9F6F0" />
            <stop offset="100%" stopColor="#EDE8DC" />
          </linearGradient>

          {/* ── Active Orange Closed Button Gradient ── */}
          <linearGradient id="btnActiveOrangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFA047" />
            <stop offset="35%" stopColor="#F27A24" />
            <stop offset="100%" stopColor="#B84E07" />
          </linearGradient>

          {/* ── Skeleton Pills Gradient ── */}
          <linearGradient id="leadPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EDE8DD" />
            <stop offset="100%" stopColor="#DDD7CB" />
          </linearGradient>

          {/* ── Soft Orange Glow Filter for Active Card State Flash ── */}
          <filter id="orangeFlashGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#F27A24" floodOpacity="0.55" />
          </filter>

          {/* ── Main Card Clay Drop Shadow ── */}
          <filter id="mainCardClayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#0C1E2E" floodOpacity="0.14" />
          </filter>

          {/* ── User Avatar ClipPath ── */}
          <clipPath id="avatarDiscClip">
            <circle cx="75" cy="118" r="22" />
          </clipPath>
        </defs>

        {/* ── STEP 1: Main Blank White Clay Card Canvas (Appears First) ── */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#mainCardClayShadow)"
        >
          <rect
            x="20"
            y="25"
            width="435"
            height="225"
            rx="30"
            ry="30"
            fill="url(#mainLeadCardGrad)"
            stroke="#E8E4DA"
            strokeWidth="1.5"
          />

          {/* Top Sheen Line */}
          <path
            d="M 52 26.5 L 423 26.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>

        {/* ── STEP 2: "New Lead" Details Placed Directly onto Blank Canvas ── */}
        {/* 2A. Header Title "New Lead" (Fixed y="65", animated via translateY 0) */}
        <motion.text
          x="52"
          y="65"
          fill="#38322B"
          fontFamily="sans-serif"
          fontSize="16"
          fontWeight="800"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          New Lead
        </motion.text>

        {/* 2B. User Avatar Disc & Silhouette */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.55 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "75px 118px" }}
          transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.95 }}
        >
          {/* Avatar Base Disc */}
          <circle cx="75" cy="118" r="22" fill="#E8E2D5" stroke="#D8D2C4" strokeWidth="1" />

          {/* User Silhouette Icon Clipped inside Circle */}
          <g clipPath="url(#avatarDiscClip)">
            <circle cx="75" cy="111" r="7.5" fill="#6E6659" />
            <path
              d="M 57 137 C 57 124 65 120 75 120 C 85 120 93 124 93 137 Z"
              fill="#6E6659"
            />
          </g>

          {/* Inner Highlight Ring */}
          <circle cx="75" cy="118" r="21" fill="none" stroke="white" strokeWidth="1.5" />
        </motion.g>

        {/* 2C. Right Skeleton Text Pills */}
        <g>
          <motion.g
            initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.15, ease: "easeOut" }}
          >
            <rect x="115" y="102" width="165" height="12" rx="6" fill="url(#leadPillGrad)" />
            <rect x="117" y="103" width="161" height="2" rx="1" fill="white" fillOpacity="0.4" />
          </motion.g>

          <motion.g
            initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
          >
            <rect x="115" y="125" width="85" height="12" rx="6" fill="url(#leadPillGrad)" />
            <rect x="117" y="126" width="81" height="2" rx="1" fill="white" fillOpacity="0.4" />
          </motion.g>
        </g>

        {/* ── STEP 3: "Qualified" Card (Enters -> Slow Orange Glow Hold -> Reverts to Original Colour) ── */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 35, scale: 0.88 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "87.5px 297.5px" }}
          transition={{ duration: 0.65, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Base Inactive Card Background */}
          <rect
            x="20"
            y="230"
            width="135"
            height="135"
            rx="26"
            ry="26"
            fill="url(#btnInactiveGrad)"
            stroke="#E0D9CB"
            strokeWidth="1.5"
          />
          <path
            d="M 45 231.5 L 130 231.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Base Text */}
          <text
            x="87.5"
            y="298"
            textAnchor="middle"
            fill="#4A4338"
            fontFamily="sans-serif"
            fontSize="13"
            fontWeight="700"
          >
            Qualified
          </text>

          {/* Glowing Orange Flash Layer (Extended Hold Time for Clear Visual Pace) */}
          <motion.g
            initial={{ opacity: 0 }}
            whileInView={prefersReducedMotion ? { opacity: 0 } : { opacity: [0, 0, 1, 1, 0] }}
            viewport={{ once: true }}
            transition={{
              times: [0, 0.18, 0.35, 0.72, 1],
              duration: 2.0,
              delay: 1.7,
              ease: "easeInOut",
            }}
            filter="url(#orangeFlashGlow)"
          >
            <rect
              x="20"
              y="230"
              width="135"
              height="135"
              rx="26"
              ry="26"
              fill="url(#btnActiveOrangeGrad)"
              stroke="#D85D09"
              strokeWidth="1.5"
            />
            <path
              d="M 45 231.5 L 130 231.5"
              stroke="white"
              strokeOpacity="0.45"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <text
              x="87.5"
              y="298"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="sans-serif"
              fontSize="13"
              fontWeight="800"
            >
              Qualified
            </text>
          </motion.g>
        </motion.g>

        {/* ── STEP 4: "Meeting" Card (Enters -> Slow Orange Glow Hold -> Reverts to Original Colour) ── */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 35, scale: 0.88 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "237.5px 297.5px" }}
          transition={{ duration: 0.65, delay: 3.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Base Inactive Card Background */}
          <rect
            x="170"
            y="230"
            width="135"
            height="135"
            rx="26"
            ry="26"
            fill="url(#btnInactiveGrad)"
            stroke="#E0D9CB"
            strokeWidth="1.5"
          />
          <path
            d="M 195 231.5 L 280 231.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Base Text */}
          <text
            x="237.5"
            y="298"
            textAnchor="middle"
            fill="#4A4338"
            fontFamily="sans-serif"
            fontSize="13"
            fontWeight="700"
          >
            Meeting
          </text>

          {/* Glowing Orange Flash Layer (Extended Hold Time for Clear Visual Pace) */}
          <motion.g
            initial={{ opacity: 0 }}
            whileInView={prefersReducedMotion ? { opacity: 0 } : { opacity: [0, 0, 1, 1, 0] }}
            viewport={{ once: true }}
            transition={{
              times: [0, 0.18, 0.35, 0.72, 1],
              duration: 2.0,
              delay: 3.8,
              ease: "easeInOut",
            }}
            filter="url(#orangeFlashGlow)"
          >
            <rect
              x="170"
              y="230"
              width="135"
              height="135"
              rx="26"
              ry="26"
              fill="url(#btnActiveOrangeGrad)"
              stroke="#D85D09"
              strokeWidth="1.5"
            />
            <path
              d="M 195 231.5 L 280 231.5"
              stroke="white"
              strokeOpacity="0.45"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <text
              x="237.5"
              y="298"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="sans-serif"
              fontSize="13"
              fontWeight="800"
            >
              Meeting
            </text>
          </motion.g>
        </motion.g>

        {/* ── STEP 5: "Closed" Card (Enters -> Glows Orange -> STAYS Active Orange with Checkmark Tick) ── */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 35, scale: 0.88 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "387.5px 297.5px" }}
          transition={{ duration: 0.65, delay: 5.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Base Inactive Card Background */}
          <rect
            x="320"
            y="230"
            width="135"
            height="135"
            rx="26"
            ry="26"
            fill="url(#btnInactiveGrad)"
            stroke="#E0D9CB"
            strokeWidth="1.5"
          />
          <path
            d="M 345 231.5 L 430 231.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text
            x="387.5"
            y="298"
            textAnchor="middle"
            fill="#4A4338"
            fontFamily="sans-serif"
            fontSize="13"
            fontWeight="700"
          >
            Closed
          </text>

          {/* Active Orange Glow Layer (Transitions on & STAYS ACTIVE) */}
          <motion.g
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 6.2, ease: "easeOut" }}
            filter="url(#orangeFlashGlow)"
          >
            <rect
              x="320"
              y="230"
              width="135"
              height="135"
              rx="26"
              ry="26"
              fill="url(#btnActiveOrangeGrad)"
              stroke="#D85D09"
              strokeWidth="1.5"
            />
            <path
              d="M 345 231.5 L 430 231.5"
              stroke="white"
              strokeOpacity="0.45"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Button Text */}
            <text
              x="387.5"
              y="280"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="sans-serif"
              fontSize="14"
              fontWeight="800"
            >
              Closed
            </text>

            {/* 3D Checkmark Disc (✓) Pops in with satisfying bounce */}
            <motion.g
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0, rotate: -25 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              style={{ transformOrigin: "387.5px 318px" }}
              transition={{ type: "spring", stiffness: 360, damping: 18, delay: 6.55 }}
            >
              <circle cx="387.5" cy="318" r="14" fill="#E26414" stroke="#B84E07" strokeWidth="1" />
              <circle cx="387.5" cy="318" r="13" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />

              <motion.path
                d="M 380.5 318 L 385.5 323 L 395 313"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 6.8, ease: "easeOut" }}
              />
            </motion.g>
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}


