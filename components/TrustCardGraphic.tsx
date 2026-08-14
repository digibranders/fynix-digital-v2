export default function TrustCardGraphic() {
  return (
    <div className="relative w-full max-w-[500px] aspect-[500/380] select-none mx-auto">
      <svg
        viewBox="0 0 500 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* ── Main Browser Window Gradient ── */}
          <linearGradient id="whiteWindowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FAF8F4" />
            <stop offset="100%" stopColor="#EFEBE2" />
          </linearGradient>

          {/* ── Image Card Background Gradient ── */}
          <linearGradient id="imageCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F2ECE2" />
            <stop offset="100%" stopColor="#E3DDD1" />
          </linearGradient>

          {/* ── Orange Sun & Checkmark Gradient ── */}
          <linearGradient id="orangeSunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFA047" />
            <stop offset="35%" stopColor="#F27A24" />
            <stop offset="100%" stopColor="#B84E07" />
          </linearGradient>

          {/* ── Top Window Dots Gradients ── */}
          <linearGradient id="orangeDotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF9F38" />
            <stop offset="100%" stopColor="#E66819" />
          </linearGradient>

          <linearGradient id="amberDotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFC04D" />
            <stop offset="100%" stopColor="#E69519" />
          </linearGradient>

          <linearGradient id="grayDotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0DDD7" />
            <stop offset="100%" stopColor="#BEB9AD" />
          </linearGradient>

          {/* ── Text Skeleton Pills Gradient ── */}
          <linearGradient id="textPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EDE8DD" />
            <stop offset="100%" stopColor="#DDD7CB" />
          </linearGradient>

          {/* ── Shield Clay Body & Border Gradient ── */}
          <linearGradient id="shieldBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFF4ED" />
            <stop offset="100%" stopColor="#F7E6DC" />
          </linearGradient>

          <linearGradient id="shieldStrokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBEAE0" />
            <stop offset="50%" stopColor="#F3D5C3" />
            <stop offset="100%" stopColor="#E5B9A1" />
          </linearGradient>
        </defs>

        {/* ── 1. Main White Window Body ── */}
        <g>
          {/* Main Card Rect (Standardized y=25, height=305) */}
          <rect
            x="20"
            y="25"
            width="405"
            height="305"
            rx="32"
            ry="32"
            fill="url(#whiteWindowGrad)"
            stroke="#E8E4DA"
            strokeWidth="1.5"
          />

          {/* Top Sheen Line */}
          <path
            d="M 52 26 L 393 26"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Header Divider Line */}
          <line x1="20" y1="68" x2="425" y2="68" stroke="#E3DFD5" strokeWidth="1.5" />
        </g>

        {/* ── 2. Top Window Control Dots (3D Spheres) ── */}
        <g>
          <circle cx="52" cy="46.5" r="7.5" fill="url(#orangeDotGrad)" />
          <circle cx="50.5" cy="44" r="2.5" fill="white" fillOpacity="0.4" />

          <circle cx="74" cy="46.5" r="7.5" fill="url(#amberDotGrad)" />
          <circle cx="72.5" cy="44" r="2.5" fill="white" fillOpacity="0.4" />

          <circle cx="96" cy="46.5" r="7.5" fill="url(#grayDotGrad)" />
          <circle cx="94.5" cy="44" r="2.5" fill="white" fillOpacity="0.5" />
        </g>

        {/* ── 3. Left Image Card Container ── */}
        <g>
          <rect
            x="50"
            y="90"
            width="165"
            height="155"
            rx="22"
            ry="22"
            fill="url(#imageCardGrad)"
            stroke="#D8D0C2"
            strokeWidth="1"
          />

          {/* Mountain Peak Paths Clip */}
          <g clipPath="url(#mountainClipTrust)">
            <clipPath id="mountainClipTrust">
              <rect x="50" y="90" width="165" height="155" rx="22" ry="22" />
            </clipPath>

            {/* Back Mountain Peak */}
            <path
              d="M 120 246 L 170 160 C 172 156.5 178 156.5 180 160 L 230 246 Z"
              fill="#B5AEA2"
            />

            {/* Front Mountain Peak */}
            <path
              d="M 45 248 L 120 142 C 122 139 128 139 130 142 L 205 248 Z"
              fill="#90897F"
            />
            {/* Highlight Sheen */}
            <path
              d="M 120 142 L 130 142 L 110 170 Z"
              fill="white"
              fillOpacity="0.2"
            />
          </g>

          {/* 3D Orange Sun Sphere */}
          <circle cx="172" cy="125" r="13" fill="url(#orangeSunGrad)" />
          <circle cx="169" cy="121" r="4.5" fill="white" fillOpacity="0.4" />
        </g>

        {/* ── 4. Right Side Skeleton Text Pills ── */}
        <g>
          <rect x="235" y="100" width="115" height="12" rx="6" fill="url(#textPillGrad)" />
          <rect x="237" y="101" width="111" height="2" rx="1" fill="white" fillOpacity="0.4" />

          <rect x="235" y="124" width="70" height="12" rx="6" fill="url(#textPillGrad)" />
          <rect x="237" y="125" width="66" height="2" rx="1" fill="white" fillOpacity="0.4" />

          <rect x="235" y="148" width="135" height="12" rx="6" fill="url(#textPillGrad)" />
          <rect x="237" y="149" width="131" height="2" rx="1" fill="white" fillOpacity="0.4" />

          <rect x="235" y="172" width="105" height="12" rx="6" fill="url(#textPillGrad)" />
          <rect x="237" y="173" width="101" height="2" rx="1" fill="white" fillOpacity="0.4" />

          <rect x="235" y="196" width="85" height="12" rx="6" fill="url(#textPillGrad)" />
          <rect x="237" y="197" width="81" height="2" rx="1" fill="white" fillOpacity="0.4" />
        </g>

        {/* ── 5. Bottom Sub-bar Line ── */}
        <g>
          <rect x="50" y="270" width="145" height="10" rx="5" fill="url(#textPillGrad)" />
          <rect x="52" y="271" width="141" height="2" rx="1" fill="white" fillOpacity="0.4" />
        </g>

        {/* ── 6. Overlapping Floating 3D Peach Shield Badge (Standardized Bottom y=365) ── */}
        <g>
          <path
            d="M 380 365 C 342 346 332 308 332 265 C 356 265 370 260 380 254 C 390 260 404 265 428 265 C 428 308 418 346 380 365 Z"
            fill="url(#shieldBodyGrad)"
            stroke="url(#shieldStrokeGrad)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Inner Highlight Line */}
          <path
            d="M 380 258 C 388 263 401 267 421 267 C 421 303 412 338 380 356 C 348 338 339 303 339 267 C 359 267 372 263 380 258 Z"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* 3D Orange Rubber Checkmark (✓) */}
          <path
            d="M 362 304 L 374 316 L 398 287"
            stroke="url(#orangeSunGrad)"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 362 302 L 374 314 L 398 285"
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
