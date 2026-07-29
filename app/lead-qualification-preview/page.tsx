import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown, X } from "lucide-react";
import Logo from "@/components/Logo";
import styles from "./preview.module.css";

export const metadata: Metadata = {
  title: "Lead Qualification Preview",
  description: "A code-built lead qualification hero preview.",
  robots: { index: false, follow: false },
};

type LeadNodeProps = {
  x: number;
  y: number;
  tone: "cool" | "warm" | "reject";
  scale?: number;
  rejected?: boolean;
};

function LeadNode({ x, y, tone, scale = 1, rejected = false }: LeadNodeProps) {
  return (
    <g className={`${styles.leadNode} ${styles[tone]}`} transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Floor reflection & shadow */}
      <ellipse cx="0" cy="46" rx="26" ry="7" fill="rgba(0,0,0,0.5)" filter="blur(3px)" />
      <ellipse className={styles.nodeReflection} cx="0" cy="46" rx="20" ry="5" />
      <circle className={styles.nodeAura} cx="0" cy="5" r="28" />

      {/* 3D Torso / Peg Body */}
      <path
        className={styles.nodeBody3D}
        d="M -18 42 C -18 46, -14 48, 0 48 C 14 48, 18 46, 18 42 C 16 26, 12 8, 16 -3 C 17 -9, 12 -15, 0 -15 C -12 -15, -17 -9, -16 -3 C -12 8, -16 26, -18 42 Z"
      />
      {/* Specular Rim Highlight on Left */}
      <path
        className={styles.nodeBodyHighlight}
        d="M -14 38 C -13 24, -9 8, -11 -2 C -12 -6, -9 -12, -2 -14"
      />
      {/* Volumetric Shadow on Right */}
      <path
        d="M 14 38 C 13 24, 9 8, 11 -2 C 12 -6, 9 -12, 2 -14"
        fill="none"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* 3D Sphere Head */}
      <circle className={styles.nodeHead3D} cx="0" cy="-28" r="14" />
      <path
        className={styles.nodeHeadHighlight}
        d="M -10 -35 A 11 11 0 0 1 5 -39"
      />

      {/* Rejected 'X' Icon */}
      {rejected && (
        <g className={styles.rejectGroup} transform="translate(22, -18)">
          <circle cx="0" cy="0" r="11" className={styles.rejectBg} />
          <path d="M -5 -5 L 5 5 M 5 -5 L -5 5" className={styles.rejectX} />
        </g>
      )}
    </g>
  );
}

function CircuitPath({ d, tone }: { d: string; tone: "cool" | "warm" | "reject" }) {
  return (
    <g className={`${styles.circuit} ${styles[tone]}`}>
      <path className={styles.circuitGlow} d={d} />
      <path className={styles.circuitLine} d={d} />
      <path className={styles.circuitCore} d={d} />
    </g>
  );
}

export default function LeadQualificationPreviewPage() {
  return (
    <main className={styles.preview}>
      <div className={styles.background} aria-hidden />

      {/* 100% Hard-Coded Vector Scene */}
      <svg className={styles.scene} viewBox="0 0 1672 941" role="img" aria-labelledby="scene-title scene-description">
        <title id="scene-title">Lead qualification workflow</title>
        <desc id="scene-description">Cool incoming leads pass through a glowing qualification gate. Qualified leads continue in warm light while rejected leads route upward in red.</desc>
        
        <defs>
          <linearGradient id="gate-face" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#d8e4ff" stopOpacity=".22" />
            <stop offset=".43" stopColor="#0d1624" stopOpacity=".7" />
            <stop offset="1" stopColor="#fcb377" stopOpacity=".2" />
          </linearGradient>
          <linearGradient id="gate-edge" x1="0" x2="1">
            <stop stopColor="#b8d4ff" />
            <stop offset=".46" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ff9e5d" />
          </linearGradient>
          <linearGradient id="warm-line" x1="0" x2="1">
            <stop stopColor="#d9801e" />
            <stop offset=".5" stopColor="#ffb042" />
            <stop offset="1" stopColor="#fff0cd" />
          </linearGradient>
          <linearGradient id="cool-line" x1="0" x2="1">
            <stop stopColor="#144d99" stopOpacity=".5" />
            <stop offset=".5" stopColor="#3894ff" />
            <stop offset="1" stopColor="#dbefff" />
          </linearGradient>
          <linearGradient id="reject-line" x1="0" x2="1">
            <stop stopColor="#c73220" />
            <stop offset=".6" stopColor="#ff5a47" />
            <stop offset="1" stopColor="#ffbcae" />
          </linearGradient>

          {/* 3D Person Gradients */}
          <radialGradient id="cool-head" cx="30%" cy="25%">
            <stop offset="0%" stopColor="#e8f5ff" />
            <stop offset="30%" stopColor="#55a5ff" />
            <stop offset="75%" stopColor="#14529e" />
            <stop offset="100%" stopColor="#082347" />
          </radialGradient>
          <linearGradient id="cool-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6bb6ff" />
            <stop offset="45%" stopColor="#1c65c4" />
            <stop offset="100%" stopColor="#0a2a57" />
          </linearGradient>

          <radialGradient id="warm-head" cx="30%" cy="25%">
            <stop offset="0%" stopColor="#fff8eb" />
            <stop offset="32%" stopColor="#ffc566" />
            <stop offset="78%" stopColor="#c27218" />
            <stop offset="100%" stopColor="#542c04" />
          </radialGradient>
          <linearGradient id="warm-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd88a" />
            <stop offset="45%" stopColor="#df881f" />
            <stop offset="100%" stopColor="#633203" />
          </linearGradient>

          <radialGradient id="reject-head" cx="30%" cy="25%">
            <stop offset="0%" stopColor="#ffede8" />
            <stop offset="32%" stopColor="#ff6f54" />
            <stop offset="78%" stopColor="#b62a1c" />
            <stop offset="100%" stopColor="#4f0c08" />
          </radialGradient>
          <linearGradient id="reject-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff856e" />
            <stop offset="45%" stopColor="#ce3926" />
            <stop offset="100%" stopColor="#5b110c" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="blue-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
          <filter id="orange-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="red-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="11" /></filter>
          <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="12" dy="24" stdDeviation="20" floodColor="#000" floodOpacity=".7" /></filter>

          {/* Floor Radial Gradients */}
          <radialGradient id="floor-light" cx="35%" cy="70%" r="50%">
            <stop stopColor="#1e5194" stopOpacity=".38" />
            <stop offset="60%" stopColor="#0d2342" stopOpacity=".12" />
            <stop offset="100%" stopColor="#07111c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="floor-amber" cx="70%" cy="75%" r="45%">
            <stop stopColor="#f09748" stopOpacity=".42" />
            <stop offset="40%" stopColor="#ba5e31" stopOpacity=".18" />
            <stop offset="100%" stopColor="#120f12" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="floor-red" cx="72%" cy="30%" r="35%">
            <stop stopColor="#ff453a" stopOpacity=".22" />
            <stop offset="100%" stopColor="#07111c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Floor Glow Pools */}
        <ellipse className={styles.floorHalo} cx="500" cy="720" rx="550" ry="200" fill="url(#floor-light)" />
        <ellipse className={styles.amberFloor} cx="1260" cy="750" rx="380" ry="180" fill="url(#floor-amber)" />
        <ellipse className={styles.redFloor} cx="1200" cy="320" rx="300" ry="160" fill="url(#floor-red)" />

        {/* Screen Floor Shadow & Refraction Beam */}
        <ellipse cx="850" cy="740" rx="220" ry="40" fill="rgba(0,0,0,0.6)" filter="blur(10px)" />
        <path className={styles.gateCast} d="M917 737c53 31 105 68 202 94-112 7-218-4-308-47 38-4 75-21 106-47Z" />
        <path className={styles.horizon} d="M0 671C340 618 526 607 838 625c326 20 546 64 834 18" />

        {/* --- INCOMING BLUE CIRCUIT LINES (Connected to 4 Blue People) --- */}
        <CircuitPath tone="cool" d="M 270 655 C 380 650, 480 625, 620 595 C 690 580, 740 580, 790 590" />
        <CircuitPath tone="cool" d="M 476 572 C 570 565, 660 570, 786 582" />
        <CircuitPath tone="cool" d="M 350 798 C 480 790, 600 730, 710 650 C 745 625, 768 610, 788 605" />
        <CircuitPath tone="cool" d="M 549 695 C 640 680, 710 645, 788 600" />

        {/* Organic Secondary Fiber Threads on Left */}
        <g className={styles.fibreField}>
          <path d="M 150 720 C 320 705, 520 635, 785 588" />
          <path d="M 220 810 C 410 790, 580 680, 787 594" />
          <path d="M 380 840 C 530 810, 660 700, 789 600" />
          <path d="M 180 640 C 350 630, 560 565, 785 578" />
          <path d="M 410 530 C 540 535, 670 560, 786 584" />
        </g>

        {/* --- OUTGOING REJECTED RED CURVED LINES (Connected to 3 Red People) --- */}
        <CircuitPath tone="reject" d="M 915 520 C 960 440, 1040 280, 1160 195" />
        <CircuitPath tone="reject" d="M 925 545 C 1020 480, 1150 400, 1302 323" />
        <CircuitPath tone="reject" d="M 935 565 C 1010 520, 1110 450, 1210 406" />

        {/* --- OUTGOING CAPTURED WARM GOLD RUNWAY TRACK (Under 4 Gold People) --- */}
        <path className={styles.runwayGlow} d="M 900 625 L 1560 625" />
        <path className={styles.runwayRail} d="M 900 605 L 1560 605" />
        <path className={styles.runwayRail} d="M 900 645 L 1560 645" />
        <CircuitPath tone="warm" d="M 905 625 L 1555 625" />

        {/* Runway Hatch / Cross Ticks */}
        <g className={styles.runwayTicks}>
          {[960, 1010, 1060, 1110, 1160, 1210, 1260, 1310, 1360, 1410, 1460, 1510].map((tx) => (
            <line key={tx} x1={tx} y1="607" x2={tx} y2="643" />
          ))}
        </g>

        {/* 3D Glowing Arrow at Track End */}
        <g className={styles.arrowGroup}>
          <path className={styles.arrowGlow} d="M 1540 625 L 1575 625 M 1558 607 L 1578 625 L 1558 643" />
          <path className={styles.arrowMain} d="M 1540 625 L 1575 625 M 1558 607 L 1578 625 L 1558 643" />
          <path className={styles.arrowCore} d="M 1540 625 L 1575 625 M 1558 607 L 1578 625 L 1558 643" />
        </g>

        {/* Atmospheric Particle Fields & Sparks */}
        <g className={styles.particles}>
          {/* Sparks along Blue Input Lines */}
          <circle cx="340" cy="648" r="2.5" fill="#aee2ff" />
          <circle cx="490" cy="625" r="2" fill="#75c2ff" />
          <circle cx="630" cy="592" r="3" fill="#ffffff" />
          <circle cx="560" cy="566" r="2.2" fill="#aee2ff" />
          <circle cx="470" cy="740" r="2.8" fill="#75c2ff" />

          {/* Red Embers Floating off Rejected Paths */}
          <circle cx="950" cy="470" r="2.2" fill="#ff7e6b" />
          <circle cx="990" cy="410" r="1.8" fill="#ffab9d" />
          <circle cx="1040" cy="340" r="2.5" fill="#ff624c" />
          <circle cx="1090" cy="270" r="2" fill="#ffded8" />
          <circle cx="1130" cy="220" r="1.6" fill="#ff7e6b" />
          <circle cx="1060" cy="440" r="2.2" fill="#ffab9d" />
          <circle cx="1140" cy="370" r="2" fill="#ff624c" />
          <circle cx="1220" cy="340" r="2.4" fill="#ffffff" />

          {/* Golden Sparks along Runway Track */}
          <circle cx="980" cy="625" r="2" fill="#ffe6a3" />
          <circle cx="1050" cy="625" r="2.8" fill="#ffffff" />
          <circle cx="1170" cy="625" r="2.2" fill="#ffd573" />
          <circle cx="1280" cy="625" r="2.5" fill="#ffffff" />
          <circle cx="1400" cy="625" r="2" fill="#ffe6a3" />
          <circle cx="1500" cy="625" r="3" fill="#ffffff" />
        </g>

        {/* Central Glass Gate Panel & Internal Funnel Wireframe */}
        <g filter="url(#soft-shadow)" className={styles.gate}>
          <path className={styles.gateSide} d="M929 390 978 413v317c0 13-5 20-15 26l-32 19v-34c9-6 13-13 13-26Z" />
          <path className={styles.gateReflection} d="M766 651c19 13 91 59 178 102l25 66c-88-37-161-79-202-107Z" />
          <path className={styles.gateFace} d="M766 316 922 389c20 9 30 23 30 45v291c0 27-9 44-28 32L792 683c-18-10-26-24-26-45Z" fill="url(#gate-face)" />
          <path className={styles.gateOuter} d="M766 316 922 389c20 9 30 23 30 45v291c0 27-9 44-28 32L792 683c-18-10-26-24-26-45Z" />
          <path className={styles.gateInner} d="M786 337 902 392c16 8 24 18 24 36v273c0 18-6 27-20 20L808 664c-15-9-22-19-22-36Z" />

          {/* Internal Glowing 3D Funnel Wireframe */}
          <g className={styles.funnelGroup}>
            {/* Funnel Rings */}
            <ellipse cx="850" cy="540" rx="52" ry="18" className={styles.funnelRingTop} />
            <ellipse cx="854" cy="558" rx="42" ry="14" className={styles.funnelRing} />
            <ellipse cx="858" cy="576" rx="32" ry="11" className={styles.funnelRing} />
            <ellipse cx="862" cy="594" rx="22" ry="8" className={styles.funnelRing} />
            <ellipse cx="866" cy="612" rx="14" ry="5" className={styles.funnelRingBottom} />

            {/* Funnel Vortex Lines */}
            <path d="M 798 540 Q 840 580 852 612" className={styles.funnelSpoke} />
            <path d="M 902 540 Q 875 580 870 612" className={styles.funnelSpoke} />
            <path d="M 850 522 V 617" className={styles.funnelSpokeCenter} />
          </g>

          <path className={styles.gateBeamBlue} d="M772 587 902 646 902 577 772 520Z" />
          <path className={styles.gateBeamWarm} d="M902 577 929 560v140l-27-54Z" />
          <path className={styles.gateSpark} d="M758 585C817 565 849 564 905 588" />
          
          <g className={styles.portalDust}>{[[812,510],[824,524],[835,538],[846,548],[858,559],[868,569],[879,574],[891,583],[807,551],[820,563],[832,575],[846,583],[860,589],[874,594],[889,597],[811,605],[824,615],[837,620],[852,616],[868,610]].map(([cx,cy], index) => <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 1.8 : .75} />)}</g>
          <text className={styles.gateLabel} x="852" y="428" textAnchor="middle">Lead</text>
          <text className={styles.gateLabel} x="852" y="454" textAnchor="middle">Qualification</text>
        </g>

        {/* --- 3D PEOPLE FIGURINES (Positioned Exactly as Reference Image) --- */}
        {/* Cool Incoming Leads (Left) */}
        <LeadNode x={270} y={628} tone="cool" scale={1.05} />
        <LeadNode x={476} y={545} tone="cool" scale={1.1} />
        <LeadNode x={350} y={772} tone="cool" scale={1.08} />
        <LeadNode x={549} y={668} tone="cool" scale={1.04} />

        {/* Rejected Leads (Top Right) */}
        <LeadNode x={1160} y={178} tone="reject" scale={0.94} rejected />
        <LeadNode x={1302} y={306} tone="reject" scale={0.92} rejected />
        <LeadNode x={1210} y={389} tone="reject" scale={0.9} rejected />

        {/* Captured Leads (Bottom Right, Standing on Track) */}
        <LeadNode x={1107} y={619} tone="warm" scale={1.12} />
        <LeadNode x={1223} y={620} tone="warm" scale={1.12} />
        <LeadNode x={1341} y={620} tone="warm" scale={1.12} />
        <LeadNode x={1458} y={620} tone="warm" scale={1.12} />
      </svg>

      {/* Navigation Header */}
      <header className={styles.header}>
        <Link aria-label="Fynix Digital home" href="/"><Logo className={styles.logo} width={118} height={49} /></Link>
        <nav aria-label="Primary navigation" className={styles.nav}>
          <Link href="/services">Services <ChevronDown size={15} strokeWidth={1.8} /></Link>
          <Link href="/case-studies">Case Studies</Link>
          <Link href="/about">About Us</Link>
        </nav>
        <Link className={styles.startProject} href="/contact">Start Project</Link>
      </header>

      {/* Floating Glassmorphic Badges */}
      <div className={`${styles.status} ${styles.rejectedStatus}`}>
        <X size={20} strokeWidth={3} /> Rejected
      </div>
      <div className={`${styles.status} ${styles.capturedStatus}`}>
        <Check size={18} strokeWidth={3} /> Leads Captured
      </div>
    </main>
  );
}
