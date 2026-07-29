"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// ── Node Configuration ──
interface NodeData {
  id: string;
  line1: string;
  line2?: string;
  angleDeg: number; // -90 (top), -30 (top-right), 30 (bottom-right), 90 (bottom), 150 (bottom-left), -150 (top-left)
  labelPosition: "top" | "right" | "bottom" | "left";
  iconType: "search" | "shield-star" | "user" | "barchart" | "code" | "document";
}

const NODES: NodeData[] = [
  {
    id: "keyword-intent",
    line1: "KEYWORD",
    line2: "INTENT",
    angleDeg: -90,
    labelPosition: "top",
    iconType: "search",
  },
  {
    id: "authority-building",
    line1: "AUTHORITY",
    line2: "BUILDING",
    angleDeg: -30,
    labelPosition: "right",
    iconType: "shield-star",
  },
  {
    id: "user-experience",
    line1: "USER",
    line2: "EXPERIENCE",
    angleDeg: 30,
    labelPosition: "right",
    iconType: "user",
  },
  {
    id: "rankings",
    line1: "RANKINGS",
    angleDeg: 90,
    labelPosition: "bottom",
    iconType: "barchart",
  },
  {
    id: "technical-optimization",
    line1: "TECHNICAL",
    line2: "OPTIMIZATION",
    angleDeg: 150,
    labelPosition: "left",
    iconType: "code",
  },
  {
    id: "content-strategy",
    line1: "CONTENT",
    line2: "STRATEGY",
    angleDeg: -150,
    labelPosition: "left",
    iconType: "document",
  },
];

// Initial load sequential reveal order:
// Keyword Intent -> Content Strategy -> Technical Optimization -> Authority Building -> User Experience -> Rankings
const INTRO_SEQUENCE = [
  "keyword-intent",
  "content-strategy",
  "technical-optimization",
  "authority-building",
  "user-experience",
  "rankings",
];

const CENTER_X = 260;
const CENTER_Y = 260;
const RADIUS_OUTER_NODE = 165; // Radius to node centers
const RADIUS_MIDDLE_RING = 120; // Middle concentric ring
const RADIUS_INNER_RING = 75; // Inner concentric ring

// Easing curves specified: easeOutCubic = cubic-bezier(0.33, 1, 0.68, 1)
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;
const EASE_IN_OUT_CUBIC = [0.65, 0, 0.35, 1] as const;

export default function SeoHeroAnimation() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Initial Load Sequence States
  const [introFinished, setIntroFinished] = useState(false);
  const [revealedLines, setRevealedLines] = useState<Record<string, boolean>>({});
  const [activePulseLine, setActivePulseLine] = useState<string | null>(null);
  const [centerPulse, setCenterPulse] = useState(false);

  // Idle Animation System States
  const [idleActiveNode, setIdleActiveNode] = useState<string | null>(null);
  const [idleTravelingPulse, setIdleTravelingPulse] = useState<string | null>(null);
  const [metallicReflectionActive, setMetallicReflectionActive] = useState(false);
  const lastSelectedNodeRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax Motion Values (Max displacement: 3px X/Y on center glow ONLY)
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const parallaxX = useSpring(rawMouseX, { stiffness: 80, damping: 22 });
  const parallaxY = useSpring(rawMouseY, { stiffness: 80, damping: 22 });

  // Calculate pixel coordinates for each node
  const nodesWithCoords = useMemo(() => {
    return NODES.map((node) => {
      const rad = (node.angleDeg * Math.PI) / 180;
      const x = CENTER_X + RADIUS_OUTER_NODE * Math.cos(rad);
      const y = CENTER_Y + RADIUS_OUTER_NODE * Math.sin(rad);

      // Junction points on inner & middle rings
      const innerX = CENTER_X + RADIUS_INNER_RING * Math.cos(rad);
      const innerY = CENTER_Y + RADIUS_INNER_RING * Math.sin(rad);
      const middleX = CENTER_X + RADIUS_MIDDLE_RING * Math.cos(rad);
      const middleY = CENTER_Y + RADIUS_MIDDLE_RING * Math.sin(rad);

      return { ...node, x, y, innerX, innerY, middleX, middleY };
    });
  }, []);

  // ── 1. INITIAL LOAD SEQUENCE (~4 Seconds, Plays ONCE) ──
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    INTRO_SEQUENCE.forEach((lineId, idx) => {
      const lineStartTime = 500 + idx * 480;
      const lineEndTime = lineStartTime + 420;

      // Reveal line drawing
      timeouts.push(
        setTimeout(() => {
          setRevealedLines((prev) => ({ ...prev, [lineId]: true }));
          setActivePulseLine(lineId);
        }, lineStartTime)
      );

      // Trigger Center Response when line arrives at center
      timeouts.push(
        setTimeout(() => {
          setActivePulseLine(null);
          setCenterPulse(true);
          timeouts.push(setTimeout(() => setCenterPulse(false), 300));
        }, lineEndTime)
      );
    });

    // Mark Intro Finished after last line completes
    const totalIntroTime = 500 + INTRO_SEQUENCE.length * 480 + 350;
    timeouts.push(
      setTimeout(() => {
        setIntroFinished(true);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("seo-hero-intro-complete"));
        }
      }, totalIntroTime)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // ── 2. IDLE BEHAVIOUR SYSTEM (Random Node Selection every 4–7s) ──
  useEffect(() => {
    if (!introFinished) return;

    let isMounted = true;
    let idleTimeout: NodeJS.Timeout;
    const sequenceTimeouts: NodeJS.Timeout[] = [];

    const scheduleNextIdleEvent = () => {
      // Random delay between 4000ms and 7000ms
      const delay = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000;

      idleTimeout = setTimeout(() => {
        if (!isMounted) return;

        // Filter out the previously selected node to avoid 2 consecutive repeats
        const availableNodes = NODES.filter(
          (n) => n.id !== lastSelectedNodeRef.current
        );
        const selectedNode =
          availableNodes[Math.floor(Math.random() * availableNodes.length)];
        lastSelectedNodeRef.current = selectedNode.id;

        // Step A: Node Activation (0ms - 250ms): Scale 1 -> 1.03, glow +15%
        setIdleActiveNode(selectedNode.id);

        // Step B: Information Flow Pulse (200ms - 700ms): Travelling pulse along line
        sequenceTimeouts.push(
          setTimeout(() => {
            if (!isMounted) return;
            setIdleTravelingPulse(selectedNode.id);
          }, 200)
        );

        // Step C: Center Response (700ms): Pulse arrives at center -> Glow +20%, Radius +6px for 300ms
        sequenceTimeouts.push(
          setTimeout(() => {
            if (!isMounted) return;
            setIdleTravelingPulse(null);
            setCenterPulse(true);

            sequenceTimeouts.push(
              setTimeout(() => {
                if (!isMounted) return;
                setCenterPulse(false);
                setIdleActiveNode(null);
              }, 300)
            );
          }, 700)
        );

        // Step D: Schedule next random idle event
        sequenceTimeouts.push(
          setTimeout(() => {
            if (isMounted) scheduleNextIdleEvent();
          }, 1000)
        );
      }, delay);
    };

    scheduleNextIdleEvent();

    return () => {
      isMounted = false;
      clearTimeout(idleTimeout);
      sequenceTimeouts.forEach(clearTimeout);
    };
  }, [introFinished]);

  // ── 3. IDLE METALLIC RING REFLECTION (Every 18–22 seconds) ──
  useEffect(() => {
    if (!introFinished) return;

    let isMounted = true;
    let ringTimeout: NodeJS.Timeout;
    let resetTimeout: NodeJS.Timeout;

    const scheduleRingReflection = () => {
      // Random delay between 18000ms and 22000ms
      const delay = Math.floor(Math.random() * (22000 - 18000 + 1)) + 18000;

      ringTimeout = setTimeout(() => {
        if (!isMounted) return;

        setMetallicReflectionActive(true);
        resetTimeout = setTimeout(() => {
          if (!isMounted) return;
          setMetallicReflectionActive(false);
          scheduleRingReflection();
        }, 4000);
      }, delay);
    };

    scheduleRingReflection();

    return () => {
      isMounted = false;
      clearTimeout(ringTimeout);
      clearTimeout(resetTimeout);
    };
  }, [introFinished]);

  // ── 4. MOUSE PARALLAX HANDLER (Max 3px movement on Center Glow ONLY) ──
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Clamp displacement to max 3px
    rawMouseX.set(Math.max(-1, Math.min(1, deltaX)) * 3);
    rawMouseY.set(Math.max(-1, Math.min(1, deltaY)) * 3);
  };

  const handleMouseLeave = () => {
    rawMouseX.set(0);
    rawMouseY.set(0);
    setHoveredNode(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[560px] aspect-square mx-auto flex items-center justify-center select-none"
    >
      {/* ── Initial Load Container Blur-Fade (Opacity 0->1, Blur 6px->0px over 700ms) ── */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(6px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: EASE_OUT_CUBIC }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* ── Background Clean Grid Overlay ── */}
        <div
          aria-hidden
          className="absolute inset-[-20px] opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(233, 175, 136, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(233, 175, 136, 0.4) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 75%)",
            maskImage:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 75%)",
          }}
        />

        {/* ── CENTER AMBIENT BACKLIGHT (Continuous 10s Center Breathing 35% <-> 40% + 3px Mouse Parallax + Center Response +6px & +20%) ── */}
        <motion.div
          aria-hidden
          style={{ x: parallaxX, y: parallaxY }}
          className="absolute pointer-events-none rounded-full blur-3xl transition-all duration-300"
          animate={{
            scale: centerPulse ? 1.08 : hoveredNode ? 1.04 : 1,
            opacity: centerPulse ? 0.6 : hoveredNode ? 0.48 : [0.35, 0.4, 0.35],
          }}
          transition={{
            scale: { duration: 0.3, ease: EASE_OUT_CUBIC },
            opacity: centerPulse || hoveredNode
              ? { duration: 0.3, ease: EASE_OUT_CUBIC }
              : { repeat: Infinity, duration: 10, ease: "easeInOut" },
          }}
        >
          <div
            className="w-[280px] h-[280px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(243,178,139,0.32), rgba(243,178,139,0.06) 55%, transparent 75%)",
            }}
          />
        </motion.div>

        {/* ── Main SVG Layer (Rings, Vector Spoke Lines, Junctions) ── */}
        <svg
          viewBox="0 0 520 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            {/* Subtle Copper Glow Filters */}
            <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Radial Core Glow */}
            <radialGradient id="centerRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f3b28b" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#e9af88" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#e9af88" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Radial Center Glow Disk */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="100"
            fill="url(#centerRadial)"
          />

          {/* ── 3 Concentric Circular Rings ── */}
          {/* Inner Ring (Continuous Slow Clockwise Rotation Loop) */}
          <motion.circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={RADIUS_INNER_RING}
            stroke="#e9af88"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="3 6"
            style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 42, ease: "linear" }}
          />

          {/* Middle Ring (Continuous Slow Counter-Clockwise Rotation Loop) */}
          <motion.circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={RADIUS_MIDDLE_RING}
            stroke="#e9af88"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeDasharray="4 8"
            style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 52, ease: "linear" }}
          />

          {/* Soft Metallic Light Reflection (Sweeps slowly around middle ring every 18-22s, opacity 8%) */}
          <motion.circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={RADIUS_MIDDLE_RING}
            stroke="#ffd2b3"
            strokeWidth="1.2"
            strokeDasharray="60 500"
            initial={{ strokeDashoffset: 560, opacity: 0 }}
            animate={{
              strokeDashoffset: metallicReflectionActive ? 0 : 560,
              opacity: metallicReflectionActive ? 0.08 : 0,
            }}
            transition={{ duration: 4.0, ease: EASE_IN_OUT_CUBIC }}
            filter="url(#subtleGlow)"
          />

          {/* Outer Ring (Passes through all 6 node centers) */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={RADIUS_OUTER_NODE}
            stroke="#e9af88"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />

          {/* ── 6 Radial Vector Spoke Lines ── */}
          {nodesWithCoords.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isRevealed = revealedLines[node.id];
            const isIntroPulsing = activePulseLine === node.id;
            const isIdlePulsing = idleTravelingPulse === node.id;
            const isLineHighlighted = isHovered || isIntroPulsing || isIdlePulsing;

            return (
              <g key={`spoke-${node.id}`}>
                {/* Connection Line: Node -> Center */}
                <motion.line
                  x1={node.x}
                  y1={node.y}
                  x2={CENTER_X}
                  y2={CENTER_Y}
                  stroke={isLineHighlighted ? "#ffe0cc" : "#e9af88"}
                  strokeWidth={isLineHighlighted ? 2.2 : 1.2}
                  strokeOpacity={isLineHighlighted ? 0.95 : isRevealed ? 0.45 : 0}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isRevealed ? 1 : 0 }}
                  transition={{ duration: 0.42, ease: EASE_OUT_CUBIC }}
                  filter={isLineHighlighted ? "url(#goldGlow)" : undefined}
                />

                {/* Information Flow Light Pulse (6px soft glow travelling along line to center) */}
                {(isIntroPulsing || isIdlePulsing) && (
                  <motion.circle
                    r="3.5"
                    fill="#ffffff"
                    filter="url(#subtleGlow)"
                    initial={{ cx: node.x, cy: node.y, opacity: 0 }}
                    animate={{
                      cx: [node.x, CENTER_X],
                      cy: [node.y, CENTER_Y],
                      opacity: [0, 0.95, 0.85, 0],
                    }}
                    transition={{ duration: 0.5, ease: EASE_OUT_CUBIC }}
                  />
                )}

                {/* Inner Ring Junction Dot */}
                <circle
                  cx={node.innerX}
                  cy={node.innerY}
                  r="2.5"
                  fill="#ffd2b3"
                  fillOpacity={isRevealed ? 0.8 : 0}
                  className="transition-opacity duration-300"
                />

                {/* Middle Ring Junction Dot */}
                <circle
                  cx={node.middleX}
                  cy={node.middleY}
                  r="3"
                  fill={isLineHighlighted ? "#ffffff" : "#f3b28b"}
                  fillOpacity={isRevealed ? 1 : 0}
                  filter="url(#subtleGlow)"
                  className="transition-opacity duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* ── Interactive Overlay (Center Emblem + 6 Fixed Nodes) ── */}
        <div className="relative w-full h-full z-20 pointer-events-auto">
          {/* ── Central Core Emblem (Centered Dead-On Origin) ── */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group"
          >
            {/* Glowing Core Ring */}
            <div
              className={`relative w-20 h-20 md:w-22 md:h-22 rounded-full p-[3px] bg-gradient-to-tr from-[#f3b28b] via-[#e59b6e] to-[#ffd2b3] flex items-center justify-center transition-all duration-300 ${
                centerPulse
                  ? "shadow-[0_0_45px_rgba(243,178,139,0.95)] scale-[1.04]"
                  : hoveredNode
                  ? "shadow-[0_0_38px_rgba(243,178,139,0.8)]"
                  : "shadow-[0_0_32px_rgba(243,178,139,0.65)]"
              }`}
            >
              <div className="w-full h-full rounded-full bg-[#0a101b] border border-[#f3b28b]/40 flex items-center justify-center shadow-inner">
                {/* Search + Bar Chart Composite Icon */}
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Ascending Chart Bars */}
                  <rect x="11" y="18" width="2.5" height="6" rx="1" fill="#f3b28b" />
                  <rect x="15.5" y="14" width="2.5" height="10" rx="1" fill="#f3b28b" />

                  {/* 3rd Bar */}
                  <rect x="20" y="11" width="2.5" height="13" rx="1" fill="#f3b28b" />

                  {/* Search Magnifying Lens Circle */}
                  <circle
                    cx="16.5"
                    cy="16.5"
                    r="9.5"
                    stroke="#ffd2b3"
                    strokeWidth="2.2"
                  />

                  {/* Magnifying Handle */}
                  <path
                    d="M23.5 23.5L28 28"
                    stroke="#ffd2b3"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ── 6 Primary Nodes & Text Labels (Fixed position, reacts ONLY when hovered or idle active) ── */}
          {nodesWithCoords.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isRevealed = revealedLines[node.id];
            const isIdleActive = idleActiveNode === node.id;

            // Convert SVG (520x520) coords to percentage position
            const leftPercent = (node.x / 520) * 100;
            const topPercent = (node.y / 520) * 100;

            // Calculate text label offset classes based on labelPosition
            let labelContainerClasses =
              "absolute flex flex-col font-sans uppercase font-bold tracking-[0.14em] text-[10.5px] md:text-[11.5px] leading-tight pointer-events-none transition-all duration-200 ";
            switch (node.labelPosition) {
              case "top":
                labelContainerClasses +=
                  "-top-11 left-1/2 -translate-x-1/2 items-center text-center";
                break;
              case "right":
                labelContainerClasses += "-top-1 left-16 items-start text-left";
                break;
              case "bottom":
                labelContainerClasses +=
                  "-bottom-9 left-1/2 -translate-x-1/2 items-center text-center";
                break;
              case "left":
                labelContainerClasses += "-top-1 right-16 items-end text-right";
                break;
            }

            return (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Circular Node Icon Container: Reacts on hover (1.05) or Idle Activation (1.03) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isRevealed ? 1 : 0,
                    scale: isHovered ? 1.05 : isIdleActive ? 1.03 : isRevealed ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
                  className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-250 backdrop-blur-md ${
                    isHovered
                      ? "bg-[#131d2f] border-[2px] border-[#ffd2b3] shadow-[0_0_22px_rgba(243,178,139,0.8)]"
                      : isIdleActive
                      ? "bg-[#101929] border border-[#ffd2b3]/80 shadow-[0_0_18px_rgba(243,178,139,0.55)]"
                      : "bg-[#0b121e] border border-[#f3b28b]/50 shadow-[0_0_15px_rgba(243,178,139,0.3)]"
                  }`}
                >
                  {/* Render Node Icon */}
                  {node.iconType === "search" && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isHovered || isIdleActive ? "#ffffff" : "#f3b28b"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  )}

                  {node.iconType === "shield-star" && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isHovered || isIdleActive ? "#ffffff" : "#f3b28b"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polygon
                        points="12 8 13.5 11 17 11.5 14.5 14 15 17.5 12 16 9 17.5 9.5 14 7 11.5 10.5 11 12 8"
                        fill={isHovered || isIdleActive ? "#ffffff" : "#f3b28b"}
                      />
                    </svg>
                  )}

                  {node.iconType === "user" && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isHovered || isIdleActive ? "#ffffff" : "#f3b28b"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}

                  {node.iconType === "barchart" && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isHovered || isIdleActive ? "#ffffff" : "#f3b28b"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  )}

                  {node.iconType === "code" && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isHovered || isIdleActive ? "#ffffff" : "#f3b28b"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  )}

                  {node.iconType === "document" && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isHovered || isIdleActive ? "#ffffff" : "#f3b28b"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>
                  )}
                </motion.div>

                {/* Text Label Container */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isRevealed ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_CUBIC }}
                  className={`${labelContainerClasses} ${
                    isHovered || isIdleActive
                      ? "text-[#ffd2b3] drop-shadow-[0_0_10px_rgba(243,178,139,0.7)]"
                      : "text-[#ffd2b3]/90"
                  }`}
                >
                  <span>{node.line1}</span>
                  {node.line2 && <span>{node.line2}</span>}
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
