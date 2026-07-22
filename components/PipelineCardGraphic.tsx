"use client";

export default function PipelineCardGraphic() {
  return (
    <div className="relative w-full max-w-[500px] aspect-[500/380] select-none mx-auto">
      <svg
        viewBox="0 0 500 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
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
        </defs>

        {/* ── 1. Main White Clay "New Lead" Card (Standardized Top y=25) ── */}
        <g>
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

          {/* "New Lead" Title */}
          <text
            x="52"
            y="65"
            fill="#38322B"
            fontFamily="sans-serif"
            fontSize="16"
            fontWeight="800"
          >
            New Lead
          </text>
        </g>

        {/* ── 2. User Avatar Disc & Details ── */}
        <g>
          {/* Avatar Base Disc */}
          <circle cx="75" cy="118" r="22" fill="#E8E2D5" stroke="#D8D2C4" strokeWidth="1" />
          <circle cx="75" cy="118" r="21" fill="none" stroke="white" strokeWidth="1.5" />

          {/* User Silhouette Icon */}
          <circle cx="75" cy="112" r="7" fill="#6E6659" />
          <path
            d="M 60 134 C 60 125 67 122 75 122 C 83 122 90 125 90 134 Z"
            fill="#6E6659"
          />

          {/* Right Skeleton Text Pills */}
          <g>
            <rect x="115" y="102" width="165" height="12" rx="6" fill="url(#leadPillGrad)" />
            <rect x="117" y="103" width="161" height="2" rx="1" fill="white" fillOpacity="0.4" />

            <rect x="115" y="125" width="85" height="12" rx="6" fill="url(#leadPillGrad)" />
            <rect x="117" y="126" width="81" height="2" rx="1" fill="white" fillOpacity="0.4" />
          </g>
        </g>

        {/* ── 3. Bottom 3 Floating Stage Buttons Row (Standardized Bottom y=365) ── */}

        {/* Button 1: "Qualified" (Inactive Clay Button) */}
        <g>
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

          {/* Button Text */}
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
        </g>

        {/* Button 2: "Meeting" (Inactive Clay Button) */}
        <g>
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

          {/* Button Text */}
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
        </g>

        {/* Button 3: "Closed" (Active 3D Orange Clay Button) */}
        <g>
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

          {/* 3D Checkmark Disc (✓) */}
          <circle cx="387.5" cy="318" r="14" fill="#E26414" stroke="#B84E07" strokeWidth="1" />
          <circle cx="387.5" cy="318" r="13" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />

          <path
            d="M 380.5 318 L 385.5 323 L 395 313"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
