"use client";

export default function DevCardGraphic() {
  return (
    <div className="relative w-full max-w-[500px] aspect-[500/380] select-none mx-auto">
      <svg
        viewBox="0 0 500 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
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

        {/* ── 1. Main Dark Window Body (Standardized y=25, height=305) ── */}
        <g>
          {/* Main Rounded Box */}
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
        </g>

        {/* ── 2. Sidebar Elements ── */}
        <g>
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

          {/* Embossed Sidebar Icons */}
          {/* Icon 1: Hamburger Menu */}
          <g>
            <rect x="43" y="88" width="22" height="3.5" rx="1.75" fill="#3D434B" />
            <rect x="43" y="88" width="22" height="1" rx="0.5" fill="#58616D" />
            
            <rect x="43" y="95" width="22" height="3.5" rx="1.75" fill="#3D434B" />
            <rect x="43" y="95" width="22" height="1" rx="0.5" fill="#58616D" />
            
            <rect x="43" y="102" width="22" height="3.5" rx="1.75" fill="#3D434B" />
            <rect x="43" y="102" width="22" height="1" rx="0.5" fill="#58616D" />
          </g>

          {/* Icon 2: File Tree List */}
          <g>
            <rect x="43" y="122" width="22" height="3" rx="1.5" fill="#3D434B" />
            <rect x="43" y="122" width="22" height="1" rx="0.5" fill="#58616D" />

            <rect x="43" y="128" width="16" height="3" rx="1.5" fill="#3D434B" />
            <rect x="43" y="128" width="16" height="1" rx="0.5" fill="#58616D" />

            <rect x="43" y="134" width="22" height="3" rx="1.5" fill="#3D434B" />
            <rect x="43" y="134" width="22" height="1" rx="0.5" fill="#58616D" />

            <rect x="43" y="140" width="12" height="3" rx="1.5" fill="#3D434B" />
            <rect x="43" y="140" width="12" height="1" rx="0.5" fill="#58616D" />
          </g>

          {/* Icon 3: Sliders */}
          <g>
            <rect x="43" y="160" width="22" height="3" rx="1.5" fill="#3D434B" />
            <circle cx="50" cy="161.5" r="3" fill="#2E333A" stroke="#484F59" strokeWidth="1.2" />

            <rect x="43" y="169" width="22" height="3" rx="1.5" fill="#3D434B" />
            <circle cx="58" cy="170.5" r="3" fill="#2E333A" stroke="#484F59" strokeWidth="1.2" />
          </g>

          {/* Icon 4: Ribbon */}
          <g>
            <path
              d="M 46 191 C 46 187 62 187 62 191 C 62 195 58 197 56 201 L 52 201 C 50 197 46 195 46 191 Z"
              fill="#3D434B"
            />
          </g>

          {/* Icon 5: Target Spheres */}
          <g>
            <circle cx="54" cy="222" r="3" fill="#3D434B" />
            <circle cx="54" cy="235" r="3" fill="#3D434B" />
            <circle cx="54" cy="248" r="3" fill="#3D434B" />
            <circle cx="54" cy="261" r="3" fill="#3D434B" />
          </g>
        </g>

        {/* ── 3. Top Header Bar Pills ── */}
        <g>
          <rect x="102" y="42" width="32" height="11" rx="5.5" fill="url(#orangePillGrad)" />
          <rect x="104" y="43" width="28" height="1.5" rx="0.75" fill="white" fillOpacity="0.4" />

          <rect x="142" y="42" width="45" height="11" rx="5.5" fill="url(#greenPillGrad)" />
          <rect x="144" y="43" width="41" height="1.5" rx="0.75" fill="white" fillOpacity="0.4" />
        </g>

        {/* ── 4. 3D Code Capsules ── */}
        <g>
          {/* Row 1 */}
          <rect x="115" y="86" width="75" height="11.5" rx="5.75" fill="url(#cyanPillGrad)" />
          <rect x="117" y="87" width="71" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          <circle cx="202" cy="91.75" r="5.75" fill="url(#cyanPillGrad)" />
          <circle cx="202" cy="89.5" r="2.5" fill="white" fillOpacity="0.4" />

          {/* Row 2 */}
          <rect x="127" y="105" width="55" height="11.5" rx="5.75" fill="url(#orangePillGrad)" />
          <rect x="129" y="106" width="51" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          <rect x="190" y="105" width="65" height="11.5" rx="5.75" fill="url(#cyanPillGrad)" />
          <rect x="192" y="106" width="61" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 3 (Indented) */}
          <rect x="150" y="124" width="85" height="11.5" rx="5.75" fill="url(#greenPillGrad)" />
          <rect x="152" y="125" width="81" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          <rect x="243" y="124" width="55" height="11.5" rx="5.75" fill="url(#cyanPillGrad)" />
          <rect x="245" y="125" width="51" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 4 (Indented) */}
          <rect x="150" y="143" width="105" height="11.5" rx="5.75" fill="url(#orangePillGrad)" />
          <rect x="152" y="144" width="101" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 5 (Indented) */}
          <rect x="150" y="162" width="65" height="11.5" rx="5.75" fill="url(#orangePillGrad)" />
          <rect x="152" y="163" width="61" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          <rect x="223" y="162" width="95" height="11.5" rx="5.75" fill="url(#cyanPillGrad)" />
          <rect x="225" y="163" width="91" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 6 (Indented) */}
          <rect x="150" y="181" width="115" height="11.5" rx="5.75" fill="url(#orangePillGrad)" />
          <rect x="152" y="182" width="111" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          <rect x="273" y="181" width="45" height="11.5" rx="5.75" fill="url(#greenPillGrad)" />
          <rect x="275" y="182" width="41" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 7 (Indented) */}
          <rect x="150" y="200" width="65" height="11.5" rx="5.75" fill="url(#greenPillGrad)" />
          <rect x="152" y="201" width="61" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 8 */}
          <rect x="127" y="219" width="45" height="11.5" rx="5.75" fill="url(#greenPillGrad)" />
          <rect x="129" y="220" width="41" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 9 (Indented) */}
          <rect x="150" y="238" width="45" height="11.5" rx="5.75" fill="url(#orangePillGrad)" />
          <rect x="152" y="239" width="41" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          <rect x="203" y="238" width="75" height="11.5" rx="5.75" fill="url(#greenPillGrad)" />
          <rect x="205" y="239" width="71" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 10 (Indented) */}
          <rect x="150" y="257" width="55" height="11.5" rx="5.75" fill="url(#orangePillGrad)" />
          <rect x="152" y="258" width="51" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          <rect x="213" y="257" width="65" height="11.5" rx="5.75" fill="url(#greenPillGrad)" />
          <rect x="215" y="258" width="61" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          {/* Row 11 (Indented) */}
          <rect x="150" y="276" width="95" height="11.5" rx="5.75" fill="url(#orangePillGrad)" />
          <rect x="152" y="277" width="91" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />

          <rect x="253" y="276" width="45" height="11.5" rx="5.75" fill="url(#cyanPillGrad)" />
          <rect x="255" y="277" width="41" height="1.5" rx="0.75" fill="white" fillOpacity="0.45" />
        </g>

        {/* ── 5. Terminal Prompt (Bottom Left) ── */}
        <g>
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

          <circle cx="187" cy="302" r="3.5" fill="#424750" />
        </g>

        {/* ── 6. Overlapping Floating White Clay Badge (Standardized Bottom y=365) ── */}
        <g>
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
        </g>

        {/* ── 7. Orange Brackets (< />) ── */}
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
      </svg>
    </div>
  );
}
