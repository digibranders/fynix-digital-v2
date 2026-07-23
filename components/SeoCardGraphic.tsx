"use client";

export default function SeoCardGraphic() {
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
          <linearGradient id="seoCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FAF8F4" />
            <stop offset="100%" stopColor="#EFECE5" />
          </linearGradient>

          {/* ── Search Bar Capsule Gradient ── */}
          <linearGradient id="searchBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F9F6F0" />
            <stop offset="100%" stopColor="#EDE8DC" />
          </linearGradient>

          {/* ── Wave Area Chart Gradient Fill ── */}
          <linearGradient id="waveFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F27A24" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#F27A24" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#F27A24" stopOpacity="0.0" />
          </linearGradient>

          {/* ── 3D Orange Wave Stroke & Peak Sphere Gradient ── */}
          <linearGradient id="orangeStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9E40" />
            <stop offset="50%" stopColor="#F27A24" />
            <stop offset="100%" stopColor="#D95A06" />
          </linearGradient>
        </defs>

        {/* ── 1. Top Floating 3D Search Bar Capsule (Standardized Top y=25) ── */}
        <g>
          {/* Search Capsule Body */}
          <rect
            x="45"
            y="25"
            width="380"
            height="52"
            rx="26"
            ry="26"
            fill="url(#searchBarGrad)"
            stroke="#EAE5DB"
            strokeWidth="1.5"
          />

          {/* Top Sheen Line */}
          <path
            d="M 72 26.5 L 398 26.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Search Placeholder Text */}
          <text
            x="78"
            y="57"
            fill="#8A8275"
            fontFamily="sans-serif"
            fontSize="15"
            fontWeight="500"
          >
            Search...
          </text>

          {/* Magnifying Glass Icon */}
          <g>
            <circle
              cx="380"
              cy="48"
              r="8"
              stroke="#6B6255"
              strokeWidth="2.5"
              fill="none"
            />
            <line
              x1="386"
              y1="54"
              x2="394"
              y2="62"
              stroke="#6B6255"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* ── 2. Main Analytics White Clay Card (Standardized Bottom y=365) ── */}
        <g>
          {/* Card Body */}
          <rect
            x="20"
            y="92"
            width="435"
            height="273"
            rx="30"
            ry="30"
            fill="url(#seoCardGrad)"
            stroke="#E8E4DA"
            strokeWidth="1.5"
          />

          {/* Top Sheen Line */}
          <path
            d="M 52 93.5 L 423 93.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Card Title Label */}
          <text
            x="50"
            y="130"
            fill="#4A443B"
            fontFamily="sans-serif"
            fontSize="14"
            fontWeight="700"
          >
            Organic Traffic
          </text>

          {/* +162% Metric Text */}
          <text
            x="50"
            y="166"
            fill="#0F8A3C"
            fontFamily="sans-serif"
            fontSize="30"
            fontWeight="800"
          >
            +162%
          </text>
        </g>

        {/* ── 3. Subtle Background Analytics Grid Lines ── */}
        <g stroke="#EDE7DC" strokeWidth="1" strokeDasharray="3 3">
          <line x1="50" y1="195" x2="425" y2="195" />
          <line x1="50" y1="235" x2="425" y2="235" />
          <line x1="50" y1="275" x2="425" y2="275" />
          <line x1="50" y1="315" x2="425" y2="315" />

          <line x1="125" y1="190" x2="125" y2="335" />
          <line x1="200" y1="190" x2="200" y2="335" />
          <line x1="275" y1="190" x2="275" y2="335" />
          <line x1="350" y1="190" x2="350" y2="335" />
        </g>

        {/* ── 4. 3D Rising Wave Graph ── */}
        <g>
          {/* Wave Gradient Area Fill Under Curve */}
          <path
            d="M 50 335 Q 120 330 180 300 T 310 240 T 425 155 L 425 335 Z"
            fill="url(#waveFillGrad)"
          />

          {/* 3D Main Orange Wave Stroke */}
          <path
            d="M 50 335 Q 120 330 180 300 T 310 240 T 425 155"
            stroke="url(#orangeStrokeGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Sheen Highlight Line on Wave Stroke */}
          <path
            d="M 50 333.5 Q 120 328.5 180 298.5 T 310 238.5 T 425 153.5"
            stroke="white"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Peak Sphere Node at End of Wave (425, 155) */}
          <circle cx="425" cy="155" r="9" fill="url(#orangeStrokeGrad)" />
          <circle cx="422.5" cy="152.5" r="3" fill="white" fillOpacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
