"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * LinkedIn management hero graphic.
 *
 * A premium "clay-card" LinkedIn conversation that plays out on view: a
 * personalised outreach message is sent (steel-blue outgoing bubble), the
 * prospect starts typing, then a genuine reply lands with a delivered tick. It
 * tells the page's core story, real human conversations rather than
 * automation, and carries the page's muted steel-blue accent plus a proper
 * LinkedIn mark. The card and its contents are centred on a single content
 * grid (left margin 74, right margin 426) so every element aligns cleanly.
 * Click to replay. Honours reduced-motion.
 */
export default function LinkedInCardGraphic() {
  const prefersReducedMotion = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  const typingDots = [98, 114, 130];

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
          <linearGradient id="liConvCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F7F9FC" />
            <stop offset="100%" stopColor="#E7EDF4" />
          </linearGradient>

          <linearGradient id="liOutgoingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6f8fae" />
            <stop offset="45%" stopColor="#4a7cae" />
            <stop offset="100%" stopColor="#2c5580" />
          </linearGradient>

          <linearGradient id="liIncomingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F3F6FA" />
            <stop offset="100%" stopColor="#E2E9F1" />
          </linearGradient>

          <linearGradient id="liBadgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1284d8" />
            <stop offset="100%" stopColor="#0A66C2" />
          </linearGradient>

          <filter id="liConvCardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#0C1E2E" floodOpacity="0.16" />
          </filter>

          <filter id="liReplyGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#2c5580" floodOpacity="0.32" />
          </filter>

          <filter id="liBadgeShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0A66C2" floodOpacity="0.4" />
          </filter>

          <clipPath id="liConvAvatarClip">
            <circle cx="95" cy="112" r="20" />
          </clipPath>
        </defs>

        {/* Card */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#liConvCardShadow)"
        >
          <rect
            x="46"
            y="64"
            width="408"
            height="252"
            rx="28"
            ry="28"
            fill="url(#liConvCardGrad)"
            stroke="#E1E8F1"
            strokeWidth="1.5"
          />
          <path d="M 78 65.5 L 422 65.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Header: avatar */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "95px 112px" }}
          transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.7 }}
        >
          <circle cx="95" cy="112" r="20" fill="#E2E9F1" stroke="#CFDAE7" strokeWidth="1" />
          <g clipPath="url(#liConvAvatarClip)">
            <circle cx="95" cy="106" r="7" fill="#5f7896" />
            <path d="M 78 130 C 78 118 86 114 95 114 C 104 114 112 118 112 130 Z" fill="#5f7896" />
          </g>
          <circle cx="95" cy="112" r="19" fill="none" stroke="white" strokeWidth="1.5" />
        </motion.g>

        {/* Header: name */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
        >
          <rect x="128" y="102" width="148" height="11" rx="5.5" fill="#D2DEEA" />
          <rect x="128" y="119" width="90" height="8" rx="4" fill="#DFE7F0" />
        </motion.g>

        {/* Header: LinkedIn mark */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
          filter="url(#liBadgeShadow)"
        >
          <rect x="398" y="98" width="28" height="28" rx="7" fill="url(#liBadgeGrad)" />
          <path d="M 400 105 L 424 105" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
          {/* "in" wordmark drawn as shapes for a crisp, real LinkedIn look */}
          <circle cx="406" cy="106.5" r="1.9" fill="white" />
          <rect x="404.5" y="110" width="3" height="10.5" rx="1.1" fill="white" />
          <path
            d="M 410.5 120.5 L 410.5 110 L 413.4 110 L 413.4 111.4 C 414.1 110.4 415.2 109.7 416.7 109.7 C 419.1 109.7 420.5 111.3 420.5 113.9 L 420.5 120.5 L 417.4 120.5 L 417.4 114.4 C 417.4 113.1 416.9 112.3 415.7 112.3 C 414.6 112.3 413.6 113 413.6 114.5 L 413.6 120.5 Z"
            fill="white"
          />
        </motion.g>

        <line x1="74" y1="144" x2="426" y2="144" stroke="#E7EDF4" strokeWidth="1.5" />

        {/* Outgoing message (our personalised outreach) */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 24, scale: 0.92 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "308px 187px" }}
          transition={{ duration: 0.55, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect x="190" y="160" width="236" height="54" rx="17" fill="url(#liOutgoingGrad)" stroke="#244a70" strokeWidth="1" />
          <path d="M 420 208 q 8 6 14 4 q -10 3 -15 -5 Z" fill="#2c5580" />
          <rect x="210" y="176" width="196" height="8" rx="4" fill="white" fillOpacity="0.85" />
          <rect x="210" y="192" width="132" height="8" rx="4" fill="white" fillOpacity="0.55" />
        </motion.g>

        {/* Typing indicator (prospect) */}
        {!prefersReducedMotion ? (
          <motion.g
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 1, 1, 0] }}
            viewport={{ once: true }}
            transition={{ delay: 2.0, duration: 1.5, times: [0, 0.18, 0.82, 1], ease: "easeInOut" }}
          >
            <rect x="74" y="230" width="80" height="36" rx="17" fill="url(#liIncomingGrad)" stroke="#DBE4EE" strokeWidth="1" />
            {typingDots.map((cx, i) => (
              <motion.circle
                key={cx}
                cx={cx}
                cy="248"
                r="4.5"
                fill="#8aa0b8"
                initial={{ opacity: 0.35 }}
                whileInView={{ opacity: [0.35, 1, 0.35] }}
                viewport={{ once: true }}
                transition={{ delay: 2.0 + i * 0.15, duration: 0.9, repeat: 1, ease: "easeInOut" }}
              />
            ))}
          </motion.g>
        ) : null}

        {/* Incoming reply (a real conversation begins) */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "74px 259px" }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: prefersReducedMotion ? 0 : 3.5 }}
          filter="url(#liReplyGlow)"
        >
          <rect x="74" y="230" width="238" height="58" rx="17" fill="url(#liIncomingGrad)" stroke="#D4DFEB" strokeWidth="1" />
          <path d="M 80 282 q -8 6 -14 4 q 10 3 15 -5 Z" fill="#E2E9F1" />
          <rect x="94" y="248" width="198" height="8" rx="4" fill="#B9C7D8" />
          <rect x="94" y="266" width="132" height="8" rx="4" fill="#CBD7E5" />
        </motion.g>

        {/* Delivered tick, seated in the reply's corner */}
        <motion.g
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0, rotate: -25 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "300px 276px" }}
          transition={{ type: "spring", stiffness: 360, damping: 18, delay: prefersReducedMotion ? 0 : 3.95 }}
        >
          <circle cx="300" cy="276" r="12" fill="#2c5580" stroke="white" strokeWidth="2" />
          <motion.path
            d="M 294 276 L 298.5 280.5 L 307 271"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : 4.25, ease: "easeOut" }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
