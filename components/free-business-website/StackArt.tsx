"use client";

import { useId, type ReactElement, type ReactNode } from "react";

interface StackArtProps {
  /** Matches a layer's id in content/services.ts. */
  readonly layer: string;
  readonly className?: string;
}

/**
 * Every scene is drawn on this frame, so the eight layers share one size and one optical centre as the pinned
 * panel swaps between them.
 */
const FRAME = { width: 480, height: 320 } as const;

/** The Fynix palette (navy, cream, peach), repeated here because SVG paint attributes cannot read Tailwind theme tokens. The names are Firstfold's, where this art was drawn. */
const INK = "#0C1E2E";
const INK_SOFT = "#3F4E5C";
const MUTED = "#6B7580";
const BURGUNDY = "#0C1E2E";
const BURGUNDY_DEEP = "#07131D";
const LINE = "#E8E7E3";
const PAPER = "#F6F5F2";
const BLUSH = "#F7E6D6";
const WHITE = "#ffffff";
const SCREEN_BEZEL = "#0A1823";
const GREEN = "#2f9e5f";

interface SceneProps {
  /** Prefix for gradient, clip and filter ids, unique per rendered scene. */
  readonly uid: string;
}

/* ------------------------------------------------------------------ 01 Experience */

/**
 * The same site on a laptop and a phone. Swap the two `<ExperienceScreen>` calls for
 * `<image href="/stack/experience.webp" …>` inside the existing clip paths to drop in a real capture.
 */
function ExperienceScreen({ uid, scale }: SceneProps & { readonly scale: "desktop" | "phone" }): ReactElement {
  const desktop = scale === "desktop";
  return (
    <g>
      <rect x="0" y="0" width="300" height="200" fill={`url(#${uid}-sky)`} />
      <path d="M0 132 52 78 96 118 146 66 204 122 258 82 300 116V200H0Z" fill="#cdbdb4" />
      <path d="M0 158 42 118 88 150 142 106 190 146 240 114 300 154V200H0Z" fill="#9c8b88" />
      <path d="M0 182 60 152 118 178 176 146 232 176 300 148V200H0Z" fill="#6f5f60" />
      <rect x="0" y="0" width={desktop ? 220 : 300} height="200" fill={`url(#${uid}-scrim)`} />
    </g>
  );
}

function Experience({ uid }: SceneProps): ReactElement {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe6dd" />
          <stop offset="1" stopColor="#d9c9bf" />
        </linearGradient>
        <linearGradient id={`${uid}-scrim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fbf6ef" stopOpacity="0.96" />
          <stop offset="1" stopColor="#fbf6ef" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-desktop`}>
          <rect x="34" y="78" width="286" height="158" />
        </clipPath>
        <clipPath id={`${uid}-phone`}>
          <rect x="355" y="104" width="90" height="161" />
        </clipPath>
      </defs>

      {/* Laptop. */}
      <rect x="26" y="48" width="302" height="196" rx="12" fill={SCREEN_BEZEL} />
      <rect x="34" y="56" width="286" height="180" rx="6" fill={WHITE} />

      <g clipPath={`url(#${uid}-desktop)`}>
        <g transform="translate(34 78) scale(0.9533 0.79)">
          <ExperienceScreen uid={uid} scale="desktop" />
        </g>
      </g>

      {/* Site chrome and hero copy, drawn over the picture. */}
      <path d="M34 78h286" stroke={LINE} strokeWidth="1" />
      <text x="48" y="72" fontSize="12" fontWeight="600" fill={INK} fontFamily="var(--font-serif)">
        W
      </text>
      <text x="308" y="71" fontSize="7.5" fill={INK_SOFT} textAnchor="end" letterSpacing="0.4">
        Home About Work Contact
      </text>
      <text x="52" y="140" fontSize="18" fontWeight="500" fill={INK} fontFamily="var(--font-serif)">
        Build what’s next
      </text>
      <text x="52" y="160" fontSize="8" fill={INK_SOFT}>
        Modern websites for growing businesses.
      </text>
      <rect x="52" y="172" width="66" height="21" rx="10.5" fill={BURGUNDY} />
      <text x="85" y="186.5" fontSize="7.5" fill={WHITE} textAnchor="middle">
        Get started →
      </text>

      {/* Laptop foot. */}
      <rect x="8" y="244" width="338" height="9" rx="4.5" fill={SCREEN_BEZEL} />
      <rect x="150" y="246" width="54" height="3" rx="1.5" fill="#22384A" />

      {/* Phone. */}
      <rect x="348" y="84" width="104" height="188" rx="18" fill={SCREEN_BEZEL} />
      <rect x="355" y="91" width="90" height="174" rx="12" fill={WHITE} />
      <rect x="386" y="96" width="28" height="5" rx="2.5" fill={SCREEN_BEZEL} />

      <g clipPath={`url(#${uid}-phone)`}>
        <g transform="translate(355 104) scale(0.3 0.805)">
          <ExperienceScreen uid={uid} scale="phone" />
        </g>
      </g>

      <text x="366" y="118" fontSize="8" fontWeight="600" fill={INK} fontFamily="var(--font-serif)">
        W
      </text>
      <path d="M426 114h10M426 118h10" stroke={INK_SOFT} strokeWidth="1.2" strokeLinecap="round" />
      <text x="366" y="152" fontSize="12" fontWeight="500" fill={INK} fontFamily="var(--font-serif)">
        Build
      </text>
      <text x="366" y="168" fontSize="12" fontWeight="500" fill={INK} fontFamily="var(--font-serif)">
        what’s next
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ 02 Performance */

function Performance({ uid }: SceneProps): ReactElement {
  /** Front to back: the pane nearest the card is the most solid, the rest fall away to the right. */
  const panes = [0.34, 0.24, 0.17, 0.11, 0.06];

  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-pane`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BURGUNDY} />
          <stop offset="1" stopColor={BURGUNDY_DEEP} />
        </linearGradient>
      </defs>

      <g transform="translate(240 78) skewY(-16)">
        {panes.map((opacity, index) => (
          <rect
            key={opacity}
            x={index * 27}
            y="0"
            width="88"
            height="150"
            rx="7"
            fill={`url(#${uid}-pane)`}
            fillOpacity={opacity}
            stroke={BURGUNDY}
            strokeOpacity={Math.max(opacity + 0.12, 0.18)}
            strokeWidth="1"
          />
        ))}
      </g>

      <rect x="44" y="100" width="208" height="140" rx="18" fill={WHITE} stroke={LINE} strokeWidth="1" />
      <text x="72" y="134" fontSize="13" fill={INK_SOFT}>
        Page Speed
      </text>
      <text x="70" y="196" fontSize="58" fontWeight="600" fill={BURGUNDY} letterSpacing="-2">
        98
      </text>
      <circle cx="77" cy="215" r="5" fill={GREEN} />
      <text x="90" y="220" fontSize="13" fill={INK_SOFT}>
        Great
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ 03 Security */

function Security({ uid }: SceneProps): ReactElement {
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor={BLUSH} stopOpacity="0.85" />
          <stop offset="1" stopColor={BLUSH} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-shield`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#2E4A63" />
          <stop offset="0.55" stopColor={BURGUNDY} />
          <stop offset="1" stopColor={BURGUNDY_DEEP} />
        </linearGradient>
      </defs>

      <circle cx="240" cy="166" r="112" fill={`url(#${uid}-glow)`} />

      {/* Two orbits: what the shield is standing in the middle of. */}
      <ellipse
        cx="240"
        cy="190"
        rx="150"
        ry="44"
        transform="rotate(-14 240 190)"
        fill="none"
        stroke={BURGUNDY}
        strokeOpacity="0.28"
        strokeWidth="1"
      />
      <ellipse
        cx="240"
        cy="186"
        rx="168"
        ry="52"
        transform="rotate(9 240 186)"
        fill="none"
        stroke={BURGUNDY}
        strokeOpacity="0.14"
        strokeWidth="1"
      />

      <path d="M240 58 320 89v82c0 49-36 78-80 93-44-15-80-44-80-93V89Z" fill={`url(#${uid}-shield)`} />
      <path
        d="M240 74 306 99v70c0 40-30 65-66 78-36-13-66-38-66-78V99Z"
        fill="none"
        stroke={WHITE}
        strokeOpacity="0.22"
        strokeWidth="1.25"
      />

      {/* Padlock. */}
      <path d="M226 157v-13a14 14 0 0 1 28 0v13" fill="none" stroke={WHITE} strokeWidth="6" strokeLinecap="round" />
      <rect x="215" y="155" width="50" height="40" rx="8" fill={WHITE} />
      <circle cx="240" cy="171" r="4.5" fill={BURGUNDY} />
      <path d="M240 175v8" stroke={BURGUNDY} strokeWidth="3.5" strokeLinecap="round" />

      {/* Nodes riding the near orbit. */}
      <circle cx="94" cy="226" r="6" fill={BURGUNDY} />
      <circle cx="380" cy="170" r="7" fill={BURGUNDY} />
      <circle cx="145" cy="246" r="5" fill={BURGUNDY} fillOpacity="0.55" />
      <circle cx="342" cy="248" r="4" fill={BURGUNDY} fillOpacity="0.4" />
    </g>
  );
}

/* ------------------------------------------------------------------ 04 Content */

/** One row of the editor's left sidebar. */
function SidebarRow({
  y,
  label,
  current,
}: {
  readonly y: number;
  readonly label: string;
  readonly current: boolean;
}): ReactElement {
  return (
    <g>
      {current ? <rect x="52" y={y - 11} width="88" height="20" rx="6" fill={BLUSH} /> : null}
      <rect
        x="60"
        y={y - 7}
        width="10"
        height="10"
        rx="2.5"
        fill="none"
        stroke={current ? BURGUNDY : MUTED}
        strokeWidth="1.2"
      />
      <text x="78" y={y + 2} fontSize="9.5" fill={current ? BURGUNDY : INK_SOFT}>
        {label}
      </text>
    </g>
  );
}

/** One row of the editor's right column. */
function PublishRow({ y, label }: { readonly y: number; readonly label: string }): ReactElement {
  return (
    <g>
      <rect x="348" y={y - 7} width="10" height="10" rx="2.5" fill="none" stroke={MUTED} strokeWidth="1.2" />
      <text x="366" y={y + 2} fontSize="9.5" fill={INK_SOFT}>
        {label}
      </text>
    </g>
  );
}

function Content({ uid }: SceneProps): ReactElement {
  const sidebar = ["Posts", "Pages", "Media", "Categories", "Tags", "Settings"] as const;

  return (
    <g transform="translate(0 -10)">
      <defs>
        <clipPath id={`${uid}-window`}>
          <rect x="40" y="46" width="400" height="248" rx="14" />
        </clipPath>
      </defs>

      <rect x="40" y="46" width="400" height="248" rx="14" fill={WHITE} stroke={LINE} strokeWidth="1" />

      <g clipPath={`url(#${uid}-window)`}>
        {/* Title bar. */}
        <rect x="40" y="46" width="400" height="26" fill={PAPER} />
        <circle cx="60" cy="59" r="3.5" fill="#e0a7a7" />
        <circle cx="72" cy="59" r="3.5" fill="#e3cba0" />
        <circle cx="84" cy="59" r="3.5" fill="#b9cfae" />

        {/* Sidebar. */}
        <rect x="40" y="72" width="108" height="222" fill={PAPER} />
        {sidebar.map((label, index) => (
          <SidebarRow key={label} y={100 + index * 26} label={label} current={index === 0} />
        ))}
      </g>
      <path d="M40 72h400M148 72v222" stroke={LINE} strokeWidth="1" />

      {/* Composer. */}
      <rect x="162" y="86" width="176" height="28" rx="7" fill={WHITE} stroke={LINE} strokeWidth="1" />
      <text x="174" y="104" fontSize="10" fill={MUTED}>
        Write your story…
      </text>

      <rect x="162" y="124" width="176" height="26" rx="7" fill={WHITE} stroke={LINE} strokeWidth="1" />
      <text x="176" y="142" fontSize="10.5" fontWeight="700" fill={INK_SOFT}>
        B
      </text>
      <text x="196" y="142" fontSize="10.5" fontStyle="italic" fill={INK_SOFT} fontFamily="var(--font-serif)">
        I
      </text>
      <path
        d="M212 137a4 4 0 0 1 4-4h3M226 133h3a4 4 0 0 1 0 8h-3M219 141h-3a4 4 0 0 1-3.6-2.3M217 137h11"
        fill="none"
        stroke={INK_SOFT}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect x="240" y="131" width="14" height="11" rx="2" fill="none" stroke={INK_SOFT} strokeWidth="1.2" />
      <path d="M240 139l4-4 3.5 3 2.5-2 4 3" fill="none" stroke={INK_SOFT} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M266 133h12M266 137h12M266 141h8" stroke={INK_SOFT} strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M292 133h12M292 137h12M292 141h12M288 133h1M288 137h1M288 141h1"
        stroke={INK_SOFT}
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Draft body: one picture and the paragraph beside it. */}
      <rect x="162" y="160" width="80" height="58" rx="7" fill={BLUSH} />
      <circle cx="180" cy="176" r="5" fill={WHITE} fillOpacity="0.8" />
      <path d="M166 210l16-16 12 11 10-8 18 13v10h-56Z" fill={WHITE} fillOpacity="0.72" />
      <path
        d="M254 166h84M254 178h84M254 190h84M254 202h60M162 230h176M162 242h140"
        stroke={LINE}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Publish column. */}
      <path d="M338 72v222" stroke={LINE} strokeWidth="1" />
      <rect x="348" y="86" width="80" height="28" rx="7" fill={BURGUNDY} />
      <text x="388" y="104.5" fontSize="10.5" fill={WHITE} textAnchor="middle">
        Publish
      </text>
      <PublishRow y={136} label="Save draft" />
      <PublishRow y={162} label="Preview" />
      <PublishRow y={188} label="Schedule" />
    </g>
  );
}

/* ------------------------------------------------------------------ 05 Architecture */

interface SlabProps {
  readonly uid: string;
  readonly cy: number;
  readonly opacity: number;
  readonly label: string;
}

/** One layer of the stack: an isometric slab with its name led out to the right. */
function Slab({ uid, cy, opacity, label }: SlabProps): ReactElement {
  const cx = 168;
  const halfWidth = 88;
  const halfHeight = 42;
  const depth = 13;
  const right = cx + halfWidth;
  const leadY = cy + depth / 2;

  return (
    <g>
      <path
        d={`M${cx} ${cy - halfHeight} ${right} ${cy} ${cx} ${cy + halfHeight} ${cx - halfWidth} ${cy}Z`}
        fill={`url(#${uid}-slab)`}
        fillOpacity={opacity}
        stroke={BURGUNDY}
        strokeOpacity={Math.min(opacity + 0.25, 0.6)}
        strokeWidth="1"
      />
      <path
        d={`M${cx - halfWidth} ${cy} ${cx} ${cy + halfHeight} ${cx} ${cy + halfHeight + depth} ${cx - halfWidth} ${cy + depth}Z`}
        fill={BURGUNDY_DEEP}
        fillOpacity={opacity * 0.85}
      />
      <path
        d={`M${cx} ${cy + halfHeight} ${right} ${cy} ${right} ${cy + depth} ${cx} ${cy + halfHeight + depth}Z`}
        fill={BURGUNDY}
        fillOpacity={opacity * 0.6}
      />
      <path d={`M${right - 4} ${leadY}H302`} stroke={LINE} strokeWidth="1" />
      <circle cx="302" cy={leadY} r="2.5" fill={BURGUNDY} fillOpacity="0.7" />
      <text x="312" y={leadY + 4} fontSize="11.5" fill={INK_SOFT}>
        {label}
      </text>
    </g>
  );
}

function Architecture({ uid }: SceneProps): ReactElement {
  const slabs = [
    { cy: 84, opacity: 0.16, label: "Frontend (Next.js)" },
    { cy: 132, opacity: 0.26, label: "Application (Server)" },
    { cy: 180, opacity: 0.44, label: "Database" },
    { cy: 228, opacity: 0.66, label: "Infrastructure (Cloud)" },
  ] as const;

  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-slab`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2E4A63" />
          <stop offset="1" stopColor={BURGUNDY_DEEP} />
        </linearGradient>
      </defs>
      {slabs.map((slab) => (
        <Slab key={slab.label} uid={uid} cy={slab.cy} opacity={slab.opacity} label={slab.label} />
      ))}
    </g>
  );
}
/* ------------------------------------------------------------------ 06 Integrations */

/** The hub the services plug into, in frame coordinates. */
const HUB = { x: 240, y: 170, r: 40 } as const;
/** Side of a service tile. Each mark is drawn on a 24-unit grid and scaled into it. */
const TILE = 52;
const MARK = 30;

/** Where each service sits around the hub. */
const SERVICES = [
  { key: "whatsapp", x: 116, y: 80 },
  { key: "calendar", x: 364, y: 64 },
  { key: "chat", x: 70, y: 152 },
  { key: "maps", x: 416, y: 150 },
  { key: "search", x: 80, y: 262 },
  { key: "analytics", x: 372, y: 252 },
] as const;

/** A dashed spoke that stops short of both the hub and the tile, so it never runs underneath either. */
function spokeOf(service: { readonly x: number; readonly y: number }): {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
} {
  const dx = service.x - HUB.x;
  const dy = service.y - HUB.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  return {
    x1: HUB.x + ux * (HUB.r + 5),
    y1: HUB.y + uy * (HUB.r + 5),
    x2: service.x - ux * (TILE / 2 + 7),
    y2: service.y - uy * (TILE / 2 + 7),
  };
}

function Tile({
  x,
  y,
  children,
}: {
  readonly x: number;
  readonly y: number;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <g>
      <rect
        x={x - TILE / 2}
        y={y - TILE / 2}
        width={TILE}
        height={TILE}
        rx="15"
        fill={WHITE}
        stroke={LINE}
        strokeWidth="1"
      />
      <g transform={`translate(${x} ${y}) scale(${MARK / 24}) translate(-12 -12)`}>{children}</g>
    </g>
  );
}

/*
 * The service marks below are hand-vectored on a 24-unit grid so they read at this size. They stand for real
 * integrations, so swap any of them for the owner's official asset if their brand guidelines require it.
 */

function WhatsAppMark(): ReactElement {
  return (
    <g>
      <path d="M12.04 2.2a9.75 9.75 0 0 0-8.2 14.98L2.5 22l4.95-1.3a9.75 9.75 0 1 0 4.59-18.5Z" fill="#25d366" />
      <path
        d="M17.2 14.3c-.28-.14-1.66-.82-1.92-.91-.26-.1-.44-.14-.63.14-.19.28-.72.91-.89 1.1-.16.19-.33.21-.61.07-.28-.14-1.19-.44-2.26-1.4-.84-.74-1.4-1.66-1.57-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.63-1.52-.87-2.08-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1 2.71 1.14 2.9.14.19 1.97 3.02 4.78 4.23.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.66-.68 1.89-1.33.23-.66.23-1.22.16-1.34-.07-.12-.26-.19-.54-.33Z"
        fill="#ffffff"
      />
    </g>
  );
}

function CalendarMark(): ReactElement {
  return (
    <g>
      <rect x="2.5" y="4" width="19" height="17.5" rx="3" fill="#1a73e8" />
      <path d="M2.5 7a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v1.5h-19Z" fill="#1558c0" />
      <path d="M7.5 2.5v3.5M16.5 2.5v3.5" stroke="#1558c0" strokeWidth="2.6" strokeLinecap="round" />
      <text x="12" y="18" fontSize="9.5" fontWeight="700" fill="#ffffff" textAnchor="middle">
        31
      </text>
    </g>
  );
}

/**
 * The chat widget's own mark, traced from public/oyechats.png (32 x 32) so it stays crisp at any size and
 * needs no extra request. Re-run the trace if the logo changes.
 */
function ChatMark(): ReactElement {
  return (
    <g fill="#363636" fillRule="evenodd">
      <path d="M12.62 0.00Q14.70 0.00 15.83 0.44Q16.97 0.88 18.54 1.88Q20.11 2.89 20.86 3.84Q21.62 4.79 21.18 5.33Q20.73 5.86 19.89 6.37Q19.05 6.88 18.66 6.81Q18.27 6.74 17.06 5.62Q15.85 4.51 14.90 4.19Q13.95 3.88 12.56 3.94Q11.17 4.00 9.59 4.76Q8.02 5.51 7.39 6.14Q6.76 6.77 6.07 7.96Q5.38 9.15 5.25 11.11Q5.12 13.07 5.63 14.33Q6.13 15.60 7.27 16.67Q8.40 17.74 10.13 18.25Q11.86 18.76 11.99 18.91Q12.12 19.05 12.00 19.88Q11.88 20.71 12.08 20.98Q12.28 21.24 14.32 19.99Q16.36 18.74 17.63 17.18Q18.90 15.63 19.50 15.76Q20.10 15.88 21.23 16.70Q22.36 17.52 22.05 18.19Q21.74 18.86 20.73 19.86Q19.73 20.86 18.35 21.62Q16.97 22.37 15.78 22.75Q14.58 23.12 12.62 23.12Q10.67 23.12 9.41 22.75Q8.15 22.37 6.84 21.62Q5.52 20.86 3.95 19.11Q2.39 17.36 1.63 15.41Q0.88 13.46 0.88 11.69Q0.88 9.92 1.25 8.72Q1.63 7.53 2.45 6.09Q3.26 4.64 4.95 3.14Q6.64 1.64 8.60 0.82Q10.55 0.00 12.62 0.00Z" />
      <path d="M9.08 10.44Q9.72 10.51 10.11 11.02Q10.50 11.54 10.43 12.07Q10.37 12.60 9.85 13.05Q9.33 13.50 8.74 13.43Q8.15 13.37 7.77 12.91Q7.38 12.46 7.50 11.62Q7.63 10.78 8.03 10.58Q8.43 10.38 9.08 10.44Z" />
      <path d="M13.33 10.50Q14.10 10.63 14.30 11.09Q14.50 11.54 14.31 12.32Q14.12 13.10 13.73 13.30Q13.33 13.50 12.81 13.43Q12.28 13.37 11.83 12.85Q11.38 12.33 11.44 11.80Q11.51 11.27 12.03 10.82Q12.55 10.38 13.33 10.50Z" />
      <path d="M17.33 10.44Q17.97 10.51 18.36 11.02Q18.75 11.54 18.68 12.07Q18.62 12.60 18.10 13.05Q17.58 13.50 16.99 13.43Q16.40 13.37 16.02 12.85Q15.63 12.33 15.75 11.56Q15.88 10.78 16.28 10.58Q16.68 10.38 17.33 10.44Z" />
    </g>
  );
}

function MapsMark({ uid }: SceneProps): ReactElement {
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-pin`}>
          <path d="M12 1.5a7.6 7.6 0 0 1 7.6 7.6c0 3.3-2.7 7.2-7.6 13.3-4.9-6.1-7.6-10-7.6-13.3A7.6 7.6 0 0 1 12 1.5Z" />
        </clipPath>
      </defs>
      {/* Four quadrants meeting at the head's centre, clipped to the marker's teardrop. */}
      <g clipPath={`url(#${uid}-pin)`}>
        <path d="M12 9.1 12-22-22-22-22 9.1Z" fill="#34a853" />
        <path d="M12 9.1 12-22 46-22 46 9.1Z" fill="#ea4335" />
        <path d="M12 9.1-22 9.1-22 42 12 42Z" fill="#fbbc04" />
        <path d="M12 9.1 46 9.1 46 42 12 42Z" fill="#4285f4" />
      </g>
      <circle cx="12" cy="9.1" r="3.6" fill="#ffffff" />
    </g>
  );
}

function SearchConsoleMark({ uid }: SceneProps): ReactElement {
  const blue = { x: 15.3, y: 2.4, width: 6, height: 17.2 } as const;
  const green = { x: 10.5, y: 7.6, width: 6, height: 12 } as const;
  const lens = { cx: 9.7, cy: 15.8, r: 3.55 } as const;

  return (
    <g>
      <defs>
        <clipPath id={`${uid}-green`}>
          <rect {...green} rx="3" />
        </clipPath>
      </defs>
      <rect {...blue} rx="3" fill="#4285f4" />
      <rect {...green} rx="3" fill="#34a853" />
      {/* The strips the shapes share read as their own colour, as in the mark. */}
      <g clipPath={`url(#${uid}-green)`}>
        <rect {...blue} rx="3" fill="#1967d2" />
      </g>
      <path d="M7.2 18.3 3.7 21.6" stroke="#fbbc04" strokeWidth="2.1" strokeLinecap="round" />
      <circle {...lens} fill="#fbbc04" />
      <g clipPath={`url(#${uid}-green)`}>
        <circle {...lens} fill="#ea4335" />
      </g>
    </g>
  );
}

function AnalyticsMark(): ReactElement {
  return (
    <g>
      <rect x="15.5" y="2" width="6" height="20" rx="3" fill="#f9ab00" />
      <rect x="9" y="8" width="6" height="14" rx="3" fill="#e37400" />
      <rect x="2.5" y="14" width="6" height="8" rx="3" fill="#f9ab00" />
    </g>
  );
}

const SERVICE_MARKS: Readonly<Record<string, (props: SceneProps) => ReactElement>> = {
  whatsapp: WhatsAppMark,
  calendar: CalendarMark,
  chat: ChatMark,
  maps: MapsMark,
  search: SearchConsoleMark,
  analytics: AnalyticsMark,
};

function Integrations({ uid }: SceneProps): ReactElement {
  return (
    <g>
      {SERVICES.map((service) => {
        const line = spokeOf(service);
        return (
          <line
            key={service.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={BURGUNDY}
            strokeOpacity="0.3"
            strokeWidth="1"
            strokeDasharray="1 5"
            strokeLinecap="round"
          />
        );
      })}

      {/* The hub: the site everything plugs into. */}
      <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill={WHITE} stroke={LINE} strokeWidth="1" />
      <g
        transform={`translate(${HUB.x} ${HUB.y}) scale(1.75) translate(-12 -12)`}
        fill="none"
        stroke={BURGUNDY}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.2 1.2" />
        <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.2-1.2" />
      </g>

      {SERVICES.map((service) => {
        const Mark = SERVICE_MARKS[service.key];
        if (Mark === undefined) return null;
        return (
          <Tile key={service.key} x={service.x} y={service.y}>
            <Mark uid={`${uid}-${service.key}`} />
          </Tile>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ 07 Privacy */

function Privacy({ uid }: SceneProps): ReactElement {
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor={BLUSH} stopOpacity="0.9" />
          <stop offset="1" stopColor={BLUSH} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-shield`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#2E4A63" />
          <stop offset="1" stopColor={BURGUNDY_DEEP} />
        </linearGradient>
      </defs>

      <ellipse cx="228" cy="156" rx="152" ry="106" fill={`url(#${uid}-glow)`} />

      {/* The shield sits behind the panel, so the panel reads first. */}
      <path d="M382 56 424 72v42c0 26-18 41-42 49-24-8-42-23-42-49V72Z" fill={`url(#${uid}-shield)`} />
      <path
        d="M368 104l9 10 20-22"
        fill="none"
        stroke={WHITE}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect x="56" y="98" width="304" height="156" rx="16" fill={WHITE} stroke={LINE} strokeWidth="1" />
      <text x="82" y="134" fontSize="15" fontWeight="600" fill={INK}>
        We value your privacy
      </text>
      <text x="82" y="162" fontSize="11.5" fill={INK_SOFT}>
        We use cookies to improve your experience
      </text>
      <text x="82" y="180" fontSize="11.5" fill={INK_SOFT}>
        and analyse our traffic.
      </text>

      <rect x="82" y="200" width="110" height="34" rx="9" fill={BURGUNDY} />
      <text x="137" y="222" fontSize="12.5" fill={WHITE} textAnchor="middle">
        Accept all
      </text>
      <rect x="202" y="200" width="110" height="34" rx="9" fill={WHITE} stroke={LINE} strokeWidth="1.25" />
      <text x="257" y="222" fontSize="12.5" fill={INK} textAnchor="middle">
        Customise
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ 08 Monitoring */

interface StatProps {
  readonly x: number;
  readonly value: string;
  readonly label: string;
}

function Stat({ x, value, label }: StatProps): ReactElement {
  return (
    <g>
      <rect x={x} y="116" width="83" height="58" rx="10" fill={PAPER} />
      <text x={x + 12} y="146" fontSize="19" fontWeight="600" fill={INK}>
        {value}
      </text>
      <text x={x + 12} y="162" fontSize="9.5" fill={INK_SOFT}>
        {label}
      </text>
    </g>
  );
}

function Monitoring({ uid }: SceneProps): ReactElement {
  const stats = [
    { x: 62, value: "99.9%", label: "Uptime" },
    { x: 153, value: "98", label: "Performance" },
    { x: 244, value: "0", label: "Critical errors" },
    { x: 335, value: "12 ms", label: "Avg. response" },
  ] as const;

  /** The month's trace: up and to the right, with the usual dips left in. */
  const trace =
    "M62 254 92 242 122 248 152 230 182 238 212 220 242 228 272 208 302 216 332 202 362 212 392 198 418 204";

  return (
    <g transform="translate(0 -10)">
      <defs>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BURGUNDY} stopOpacity="0.24" />
          <stop offset="1" stopColor={BURGUNDY} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="36" y="42" width="408" height="256" rx="16" fill={WHITE} stroke={LINE} strokeWidth="1" />

      <text x="62" y="78" fontSize="15" fontWeight="600" fill={INK}>
        Website Health
      </text>
      <circle cx="66" cy="96" r="4" fill={GREEN} />
      <text x="78" y="100" fontSize="11" fill={INK_SOFT}>
        All systems operational
      </text>

      <rect x="326" y="64" width="92" height="26" rx="13" fill={PAPER} stroke={LINE} strokeWidth="1" />
      <text x="340" y="81" fontSize="10.5" fill={INK_SOFT}>
        Last 30 days
      </text>
      <path
        d="M402 75l4 4 4-4"
        fill="none"
        stroke={INK_SOFT}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {stats.map((stat) => (
        <Stat key={stat.label} x={stat.x} value={stat.value} label={stat.label} />
      ))}

      <path d={`${trace} L418 274 L62 274Z`} fill={`url(#${uid}-area)`} />
      <path d={trace} fill="none" stroke={BURGUNDY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M62 274h356" stroke={LINE} strokeWidth="1" />
      <circle cx="392" cy="198" r="5.5" fill={WHITE} stroke={BURGUNDY} strokeWidth="2.5" />

      <rect x="62" y="182" width="60" height="22" rx="11" fill={PAPER} stroke={LINE} strokeWidth="1" />
      <text x="92" y="197" fontSize="10" fill={INK_SOFT} textAnchor="middle">
        Stable
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */

/**
 * How each scene is fitted to the shared frame: `dx`/`dy` bring the composition back to the centre, then `scale`
 * enlarges it about that centre until it sits just inside the edges. Measured from each scene's rendered bounds.
 */
const FIT: Readonly<Record<string, { readonly scale: number; readonly dx: number; readonly dy: number }>> = {
  experience: { scale: 1, dx: 0, dy: 0 },
  performance: { scale: 1.2, dx: 0, dy: 18 },
  security: { scale: 1.36, dx: 0, dy: -1 },
  content: { scale: 1.19, dx: 0, dy: -6 },
  architecture: { scale: 1.28, dx: -11, dy: -2 },
  integrations: { scale: 1.18, dx: -3, dy: -3 },
  privacy: { scale: 1.28, dx: 0, dy: 5 },
  monitoring: { scale: 1.16, dx: 0, dy: 0 },
};

const SCENES: Readonly<Record<string, (props: SceneProps) => ReactElement>> = {
  experience: Experience,
  performance: Performance,
  security: Security,
  content: Content,
  architecture: Architecture,
  integrations: Integrations,
  privacy: Privacy,
  monitoring: Monitoring,
};

/**
 * The illustration for one layer of the stack: a drawn mock-up of what that layer actually produces — the site on
 * two devices, a speed score, a shield, the editor, the slabs, the services, the consent panel, the health report.
 *
 * Decorative: the layer's name, sentence and item list carry the meaning, so the SVG is hidden from assistive tech.
 */
export function StackArt({ layer, className }: StackArtProps): ReactElement | null {
  const rawId = useId();
  const Scene = SCENES[layer];
  if (Scene === undefined) return null;

  // useId embeds colons; strip them so the value is safe inside url(#…) references.
  const uid = rawId.replace(/:/g, "");

  const { scale, dx, dy } = FIT[layer] ?? { scale: 1, dx: 0, dy: 0 };
  const cx = FRAME.width / 2;
  const cy = FRAME.height / 2;
  const fit = `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy}) translate(${dx} ${dy})`;

  return (
    <svg
      viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
      aria-hidden="true"
      focusable="false"
      className={`h-auto w-full ${className ?? ""}`.trim()}
    >
      <g transform={fit}>
        <Scene uid={uid} />
      </g>
    </svg>
  );
}
