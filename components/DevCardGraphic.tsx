"use client";

import { motion } from "motion/react";

// Code lines grouped into 11 rows for sequential row-by-row typing animation
const CODE_ROWS = [
  // Row 1
  {
    id: 1,
    pills: [
      { x: 115, y: 86, width: 75, height: 11.5, rx: 5.75, grad: "url(#cyanPillGrad)", highlightWidth: 71 },
      { isCircle: true, cx: 202, cy: 91.75, r: 5.75, grad: "url(#cyanPillGrad)" },
    ],
  },
  // Row 2
  {
    id: 2,
    pills: [
      { x: 127, y: 105, width: 55, height: 11.5, rx: 5.75, grad: "url(#orangePillGrad)", highlightWidth: 51 },
      { x: 190, y: 105, width: 65, height: 11.5, rx: 5.75, grad: "url(#cyanPillGrad)", highlightWidth: 61 },
    ],
  },
  // Row 3
  {
    id: 3,
    pills: [
      { x: 150, y: 124, width: 85, height: 11.5, rx: 5.75, grad: "url(#greenPillGrad)", highlightWidth: 81 },
      { x: 243, y: 124, width: 55, height: 11.5, rx: 5.75, grad: "url(#cyanPillGrad)", highlightWidth: 51 },
    ],
  },
  // Row 4
  {
    id: 4,
    pills: [
      { x: 150, y: 143, width: 105, height: 11.5, rx: 5.75, grad: "url(#orangePillGrad)", highlightWidth: 101 },
    ],
  },
  // Row 5
  {
    id: 5,
    pills: [
      { x: 150, y: 162, width: 65, height: 11.5, rx: 5.75, grad: "url(#orangePillGrad)", highlightWidth: 61 },
      { x: 223, y: 162, width: 95, height: 11.5, rx: 5.75, grad: "url(#cyanPillGrad)", highlightWidth: 91 },
    ],
  },
  // Row 6
  {
    id: 6,
    pills: [
      { x: 150, y: 181, width: 115, height: 11.5, rx: 5.75, grad: "url(#orangePillGrad)", highlightWidth: 111 },
      { x: 273, y: 181, width: 45, height: 11.5, rx: 5.75, grad: "url(#greenPillGrad)", highlightWidth: 41 },
    ],
  },
  // Row 7
  {
    id: 7,
    pills: [
      { x: 150, y: 200, width: 65, height: 11.5, rx: 5.75, grad: "url(#greenPillGrad)", highlightWidth: 61 },
    ],
  },
  // Row 8
  {
    id: 8,
    pills: [
      { x: 127, y: 219, width: 45, height: 11.5, rx: 5.75, grad: "url(#greenPillGrad)", highlightWidth: 41 },
    ],
  },
  // Row 9
  {
    id: 9,
    pills: [
      { x: 150, y: 238, width: 45, height: 11.5, rx: 5.75, grad: "url(#orangePillGrad)", highlightWidth: 41 },
      { x: 203, y: 238, width: 75, height: 11.5, rx: 5.75, grad: "url(#greenPillGrad)", highlightWidth: 71 },
    ],
  },
  // Row 10
  {
    id: 10,
    pills: [
      { x: 150, y: 257, width: 55, height: 11.5, rx: 5.75, grad: "url(#orangePillGrad)", highlightWidth: 51 },
      { x: 213, y: 257, width: 65, height: 11.5, rx: 5.75, grad: "url(#greenPillGrad)", highlightWidth: 61 },
    ],
  },
  // Row 11
  {
    id: 11,
    pills: [
      { x: 150, y: 276, width: 95, height: 11.5, rx: 5.75, grad: "url(#orangePillGrad)", highlightWidth: 91 },
      { x: 253, y: 276, width: 45, height: 11.5, rx: 5.75, grad: "url(#cyanPillGrad)", highlightWidth: 41 },
    ],
  },
];

export default function DevCardGraphic() {
  return (
    <div className="relative w-full max-w-[500px] aspect-[500/380] select-none mx-auto">
      <svg
        viewBox="0 0 500 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* ── Main Dark Body Gradient ── */}
          <linearGradient id="darkBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2E3238" />
            <stop offset="20%" stopColor="#24272B" />
            <stop offset="100%" stopColor="#191B1E" />
          </linearGradient>

          {/* ── Left Sidebar Dark Gradient ── */}
          <linearGradient id="sidebarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E2024" />
            <stop offset="90%" stopColor="#16181B" />
            <stop offset="100%" stopColor="#101113" />
          </linearGradient>

          {/* ── Orange Top Button & Capsule Gradient ── */}
          <linearGradient id="orangePillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFA047" />
            <stop offset="35%" stopColor="#F27A24" />
            <stop offset="100%" stopColor="#B84E07" />
          </linearGradient>

          {/* ── Cyan Capsule Gradient ── */}
          <linearGradient id="cyanPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7BE2FF" />
            <stop offset="35%" stopColor="#38B6FF" />
            <stop offset="100%" stopColor="#1E82BA" />
          </linearGradient>

          {/* ── Lime Green Capsule Gradient ── */}
          <linearGradient id="greenPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A6F065" />
            <stop offset="35%" stopColor="#7EC93B" />
            <stop offset="100%" stopColor="#508F1E" />
          </linearGradient>

          {/* ── White Clay Card Gradient ── */}
          <linearGradient id="whiteClayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FAFAF7" />
            <stop offset="100%" stopColor="#EFECE5" />
          </linearGradient>
        </defs>

        {/* ── STAGE 1: Main Blank Code Editor Frame ── */}
        <motion.g
          initial={{ opacity: 0, y: 15, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main Dark Box Window */}
          <rect
            x="20"
            y="25"
            width="405"
            height="305"
            rx="32"
            ry="32"
            fill="url(#darkBodyGrad)"
            stroke="#40464F"
            strokeWidth="1.5"
          />

          {/* Top Sheen Line */}
          <path
            d="M 52 26 L 393 26"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Left Sidebar Section Fill */}
          <path
            d="M 20 57 C 20 39.3 34.3 25 52 25 L 82 25 L 82 330 L 52 330 C 34.3 330 20 315.7 20 298 Z"
            fill="url(#sidebarGrad)"
          />

          {/* Sidebar Separator Inset Groove */}
          <line x1="82" y1="25" x2="82" y2="330" stroke="#121315" strokeWidth="2.5" />
          <line x1="83.5" y1="25" x2="83.5" y2="330" stroke="#3A3E46" strokeWidth="1" />

          {/* Top Horizontal Header Line Groove */}
          <line x1="83" y1="68" x2="390" y2="68" stroke="#121315" strokeWidth="2" />
          <line x1="83" y1="69" x2="390" y2="69" stroke="#3A3E46" strokeWidth="0.8" />
        </motion.g>

        {/* ── Sidebar Elements ── */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Top Orange Square Button */}
          <rect
            x="41"
            y="39"
            width="26"
            height="24"
            rx="7"
            fill="url(#orangePillGrad)"
          />
          <rect x="43" y="40" width="22" height="1.5" rx="0.75" fill="white" fillOpacity="0.4" />

          {/* ── Real Antigravity IDE Activity Bar Icons ── */}
          <g id="antigravitySidebarIcons">
            {/* 1. Explorer / Files */}
            <g>
              {/* Background File Sheet */}
              <path
                d="M 49 88 L 56 88 L 59 91 L 59 104 C 59 105.1 58.1 106 57 106 L 49 106 C 47.9 106 47 105.1 47 104 L 47 90 C 47 88.9 47.9 88 49 88 Z"
                fill="none"
                stroke="#58616D"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* Primary File Sheet */}
              <path
                d="M 44 92 L 52 92 L 56 96 L 56 108 C 56 109.1 55.1 110 54 110 L 44 110 C 42.9 110 42 109.1 42 108 L 42 94 C 42 92.9 42.9 92 44 92 Z"
                fill="#24272B"
                stroke="#64748B"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M 52 92 L 52 96 L 56 96" fill="none" stroke="#64748B" strokeWidth="1.4" />
            </g>

            {/* 2. Global Search */}
            <g>
              <circle
                cx="50"
                cy="131"
                r="5.5"
                fill="none"
                stroke="#64748B"
                strokeWidth="1.6"
              />
              <line
                x1="54"
                y1="135"
                x2="59"
                y2="140"
                stroke="#64748B"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>

            {/* 3. Source Control / Git */}
            <g>
              <line x1="47" y1="162" x2="47" y2="176" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
              <path
                d="M 47 173 C 47 168 57 170 57 166"
                fill="none"
                stroke="#64748B"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="47" cy="162" r="2.2" fill="#24272B" stroke="#64748B" strokeWidth="1.5" />
              <circle cx="47" cy="176" r="2.2" fill="#24272B" stroke="#64748B" strokeWidth="1.5" />
              <circle cx="57" cy="166" r="2.2" fill="#24272B" stroke="#64748B" strokeWidth="1.5" />
            </g>

            {/* 4. Run & Debug */}
            <g>
              {/* Play symbol */}
              <path
                d="M 44 196 L 52 201 L 44 206 Z"
                fill="#64748B"
                stroke="#64748B"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              {/* Bug icon body */}
              <rect x="54" y="198" width="5" height="6" rx="2.5" fill="#64748B" />
              <line x1="53" y1="199" x2="60" y2="199" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
              <line x1="53" y1="201" x2="60" y2="201" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
              <line x1="53" y1="203" x2="60" y2="203" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* 5. Extensions / Plugins */}
            <g>
              <rect x="44" y="230" width="6" height="6" rx="1.2" fill="#64748B" />
              <rect x="52" y="230" width="6" height="6" rx="1.2" fill="#64748B" />
              <rect x="44" y="238" width="6" height="6" rx="1.2" fill="#64748B" />
              <rect x="52" y="238" width="6" height="6" rx="1.2" fill="#64748B" />
            </g>
          </g>
        </motion.g>

        {/* ── Top Header Bar Pills ── */}
        <motion.g
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <rect x="102" y="42" width="32" height="11" rx="5.5" fill="url(#orangePillGrad)" />
          <rect x="104" y="43" width="28" height="1.5" rx="0.75" fill="white" fillOpacity="0.4" />

          <rect x="142" y="42" width="45" height="11" rx="5.5" fill="url(#greenPillGrad)" />
          <rect x="144" y="43" width="41" height="1.5" rx="0.75" fill="white" fillOpacity="0.4" />
        </motion.g>

        {/* ── STAGE 2: Sequential Automatic Line Writing (Row by Row Typing) ── */}
        <g id="codePillsContainer">
          {CODE_ROWS.map((row, index) => {
            // Typing delay starts at 0.6s and staggers by 0.12s per line up to ~1.9s
            const rowDelay = 0.6 + index * 0.12;

            return (
              <g key={row.id}>
                {row.pills.map((pill, pIdx) => {
                  if (pill.isCircle) {
                    return (
                      <motion.circle
                        key={pIdx}
                        cx={pill.cx}
                        cy={pill.cy}
                        r={pill.r}
                        fill={pill.grad}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.25,
                          delay: rowDelay + pIdx * 0.05,
                          ease: "easeOut",
                        }}
                      />
                    );
                  }

                  return (
                    <motion.g
                      key={pIdx}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{
                        duration: 0.35,
                        delay: rowDelay + pIdx * 0.05,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                      style={{
                        transformOrigin: `${pill.x ?? 0}px ${(pill.y ?? 0) + (pill.height ?? 0) / 2}px`,
                      }}
                    >
                      <rect
                        x={pill.x}
                        y={pill.y}
                        width={pill.width}
                        height={pill.height}
                        rx={pill.rx}
                        fill={pill.grad}
                      />
                      {pill.highlightWidth && (
                        <rect
                          x={(pill.x ?? 0) + 2}
                          y={(pill.y ?? 0) + 1}
                          width={pill.highlightWidth}
                          height={1.5}
                          rx={0.75}
                          fill="white"
                          fillOpacity={0.45}
                        />
                      )}
                    </motion.g>
                  );
                })}
              </g>
            );
          })}
        </g>

        {/* ── Terminal Prompt (Bottom Left) ── */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 2.1 }}
        >
          <path
            d="M 117 298 L 122 302 L 117 306"
            stroke="#636B77"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <rect
            x="128"
            y="297"
            width="50"
            height="10"
            rx="5"
            fill="url(#orangePillGrad)"
          />
          <rect x="130" y="298" width="46" height="1.5" rx="0.75" fill="white" fillOpacity="0.4" />

          {/* 200 OK Green Status Badge Text */}
          <motion.text
            x="186"
            y="305"
            fill="#7EC93B"
            fontSize="10.5"
            fontWeight="700"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            letterSpacing="0.6px"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 2.15, ease: "easeOut" }}
          >
            200 OK
          </motion.text>
        </motion.g>

        {/* ── STAGE 3: Overlapping Floating White Clay Badge (Placed after typing) ── */}
        <motion.g
          initial={{ opacity: 0, scale: 0.6, y: 40, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          transition={{
            duration: 0.7,
            delay: 2.3,
            ease: [0.34, 1.56, 0.64, 1], // Spring pop-in bounce
          }}
        >
          {/* Floating Subtle Ambient Bobbing Motion wrapper */}
          <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: 3.0,
            }}
          >
            {/* White Clay Card Base */}
            <rect
              x="295"
              y="225"
              width="155"
              height="140"
              rx="30"
              ry="30"
              fill="url(#whiteClayGrad)"
              stroke="#EBE7DE"
              strokeWidth="1.5"
            />

            <rect
              x="298"
              y="227"
              width="149"
              height="136"
              rx="28"
              ry="28"
              fill="none"
              stroke="#F7F5EE"
              strokeWidth="1.5"
            />

            <path
              d="M 327 226 L 418 226"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Orange Brackets (< />) inside badge */}
            <g>
              {/* Left Bracket < */}
              <path
                d="M 348 280 L 330 295 L 348 310"
                stroke="url(#orangePillGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 348 278 L 330 293 L 348 308"
                stroke="white"
                strokeOpacity="0.35"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Slash / */}
              <path
                d="M 377 274 L 365 316"
                stroke="url(#orangePillGrad)"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M 377 272 L 365 314"
                stroke="white"
                strokeOpacity="0.35"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Right Bracket > */}
              <path
                d="M 395 280 L 413 295 L 395 310"
                stroke="url(#orangePillGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 395 278 L 413 293 L 395 308"
                stroke="white"
                strokeOpacity="0.35"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}
