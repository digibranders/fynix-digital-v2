"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "@/components/Logo";

// ── Easing curve: easeOutCubic = [0.33, 1, 0.68, 1] ──
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;

// ── Step Definition Types ──
type StepId = "nav" | "heading" | "image" | "cta" | "card1" | "card2" | "card3";

interface StepConfig {
  id: StepId;
  name: string;
  initialOffset: { x: number; y: number }; // Offset relative to target position
  targetPos: { x: number; y: number; w: number; h: number }; // In canvas px (540x390 reference)
  delayMs: number; // Start time from mounting (ms)
}

// ── Assembly Steps Configuration ──
// Canvas virtual dimensions: 540px width x 390px height
// Movement paths (zig-zag):
// 1. Nav (↙ top-left): x:-100, y:-80
// 2. Heading (↗ right): x:120, y:-30
// 3. Image (↙ bottom-left): x:-110, y:100
// 4. CTA Button (↗ top-right): x:110, y:-60
// 5. Card 1 (↙ left): x:-110, y:40
// 6. Card 2 (↗ right): x:110, y:-40
// 7. Card 3 (↙ bottom): x:30, y:110
const STEPS: StepConfig[] = [
  {
    id: "nav",
    name: "Navigation Bar",
    initialOffset: { x: -100, y: -80 },
    targetPos: { x: 24, y: 20, w: 492, h: 36 },
    delayMs: 400,
  },
  {
    id: "heading",
    name: "Hero Heading",
    initialOffset: { x: 120, y: -30 },
    targetPos: { x: 24, y: 76, w: 245, h: 76 },
    delayMs: 1250,
  },
  {
    id: "image",
    name: "Hero Image",
    initialOffset: { x: -110, y: 100 },
    targetPos: { x: 285, y: 76, w: 231, h: 148 },
    delayMs: 2100,
  },
  {
    id: "cta",
    name: "CTA Button",
    initialOffset: { x: 110, y: -60 },
    targetPos: { x: 24, y: 172, w: 148, h: 36 },
    delayMs: 2950,
  },
  {
    id: "card1",
    name: "Feature Card 1",
    initialOffset: { x: -110, y: 40 },
    targetPos: { x: 24, y: 244, w: 152, h: 116 },
    delayMs: 3800,
  },
  {
    id: "card2",
    name: "Feature Card 2",
    initialOffset: { x: 110, y: -40 },
    targetPos: { x: 192, y: 244, w: 152, h: 116 },
    delayMs: 4650,
  },
  {
    id: "card3",
    name: "Feature Card 3",
    initialOffset: { x: 30, y: 110 },
    targetPos: { x: 360, y: 244, w: 156, h: 116 },
    delayMs: 5500,
  },
];

// Idle interaction types
type IdleInteraction =
  | "button_hover"
  | "card_selection"
  | "spacing_guides"
  | "text_highlight"
  | "image_selection";

export default function UiUxHeroAnimation() {
  // Track placement state per component: false = not arrived, true = placed
  const [placedSteps, setPlacedSteps] = useState<Record<StepId, boolean>>({
    nav: false,
    heading: false,
    image: false,
    cta: false,
    card1: false,
    card2: false,
    card3: false,
  });

  // Track active placement guide currently showing (flashes for 150-200ms)
  const [activeGuideStep, setActiveGuideStep] = useState<StepId | null>(null);

  // Active cursor info during automated assembly
  const [cursor, setCursor] = useState<{
    visible: boolean;
    x: number;
    y: number;
    stepId: StepId | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    stepId: null,
  });

  // Live user mouse position tracking on hover
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [userMouse, setUserMouse] = useState<{
    isHovered: boolean;
    x: number;
    y: number;
  }>({
    isHovered: false,
    x: 0,
    y: 0,
  });

  // Interactive component hover state (user inspecting specific cards)
  const [hoveredStepId, setHoveredStepId] = useState<StepId | null>(null);

  // State after initial assembly finishes
  const [assemblyComplete, setAssemblyComplete] = useState(false);

  // Idle state interaction currently active
  const [idleState, setIdleState] = useState<IdleInteraction | null>(null);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleResetRef = useRef<NodeJS.Timeout | null>(null);

  // ── Mouse Move Listener for Interactive Jason Cursor ──
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 540;
    const svgY = ((e.clientY - rect.top) / rect.height) * 390;

    setUserMouse({
      isHovered: true,
      x: svgX,
      y: svgY,
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 540;
    const svgY = ((e.clientY - rect.top) / rect.height) * 390;

    setUserMouse({
      isHovered: true,
      x: svgX,
      y: svgY,
    });
  };

  const handleMouseLeave = () => {
    setUserMouse((prev) => ({ ...prev, isHovered: false }));
    setHoveredStepId(null);
  };

  // ── Build Assembly Sequence ──
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    STEPS.forEach((step) => {
      // 1. Show Cursor dragging component towards target
      const cursorStartTimer = setTimeout(() => {
        setCursor({
          visible: true,
          x: step.targetPos.x + step.initialOffset.x / 2 + step.targetPos.w / 2,
          y: step.targetPos.y + step.initialOffset.y / 2 + step.targetPos.h / 2,
          stepId: step.id,
        });
      }, step.delayMs - 150);
      timers.push(cursorStartTimer);

      // 2. Mark placed & show smart guide for 180ms when component snaps
      const placeTimer = setTimeout(() => {
        setPlacedSteps((prev) => ({ ...prev, [step.id]: true }));
        setActiveGuideStep(step.id);

        // Move cursor to target center during placement
        setCursor({
          visible: true,
          x: step.targetPos.x + step.targetPos.w / 2 + 10,
          y: step.targetPos.y + step.targetPos.h / 2 + 5,
          stepId: step.id,
        });

        // Hide guide after 180ms
        const guideTimer = setTimeout(() => {
          setActiveGuideStep((current) => (current === step.id ? null : current));
        }, 180);
        timers.push(guideTimer);

        // Hide cursor shortly after release
        const cursorHideTimer = setTimeout(() => {
          setCursor((c) => (c.stepId === step.id ? { ...c, visible: false } : c));
        }, 220);
        timers.push(cursorHideTimer);
      }, step.delayMs + 450); // 450ms animation duration
      timers.push(placeTimer);
    });

    // 3. Mark Assembly Complete after Card 3 snaps & guides hide
    const completeTimer = setTimeout(() => {
      setAssemblyComplete(true);
    }, 6450);
    timers.push(completeTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // ── Calm Idle State Loop (Every 8-10 seconds trigger ONE subtle interaction) ──
  useEffect(() => {
    if (!assemblyComplete) return;

    const interactions: IdleInteraction[] = [
      "button_hover",
      "card_selection",
      "spacing_guides",
      "text_highlight",
      "image_selection",
    ];

    let currentIndex = 0;

    const scheduleNextIdle = () => {
      // Random interval between 8000ms and 10000ms
      const interval = Math.floor(Math.random() * 2000) + 8000;

      idleTimerRef.current = setTimeout(() => {
        // If user is actively hovering over a component, don't interrupt with auto idle
        if (!hoveredStepId) {
          const nextInteraction = interactions[currentIndex % interactions.length];
          currentIndex++;
          setIdleState(nextInteraction);

          // Clear interaction after 1800ms
          idleResetRef.current = setTimeout(() => {
            setIdleState(null);
            scheduleNextIdle();
          }, 1800);
        } else {
          scheduleNextIdle();
        }
      }, interval);
    };

    // First idle action after 4 seconds of completion
    idleTimerRef.current = setTimeout(() => {
      if (!hoveredStepId) {
        setIdleState("card_selection");
        idleResetRef.current = setTimeout(() => {
          setIdleState(null);
          scheduleNextIdle();
        }, 1800);
      } else {
        scheduleNextIdle();
      }
    }, 4000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (idleResetRef.current) clearTimeout(idleResetRef.current);
    };
  }, [assemblyComplete, hoveredStepId]);

  // Determine active cursor position & visibility
  const showCursor = userMouse.isHovered || cursor.visible || idleState === "button_hover";
  const activeCursorX = userMouse.isHovered
    ? userMouse.x
    : idleState === "button_hover"
    ? 100
    : cursor.x;
  const activeCursorY = userMouse.isHovered
    ? userMouse.y
    : idleState === "button_hover"
    ? 190
    : cursor.y;

  return (
    <div className="relative w-full max-w-[560px] aspect-[540/390] select-none mx-auto">
      {/* Outer Glow behind the Canvas */}
      <div
        aria-hidden
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(248,160,122,0.18), transparent 75%)",
        }}
      />

      {/* Outer Corner Crosshair Brackets (+ Marks) */}
      <div aria-hidden className="absolute -top-3 -left-3 text-white/30 text-xs font-mono select-none">
        +
      </div>
      <div aria-hidden className="absolute -top-3 -right-3 text-white/30 text-xs font-mono select-none">
        +
      </div>
      <div aria-hidden className="absolute -bottom-3 -left-3 text-white/30 text-xs font-mono select-none">
        +
      </div>
      <div aria-hidden className="absolute -bottom-3 -right-3 text-white/30 text-xs font-mono select-none">
        +
      </div>

      {/* Main Design Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full h-full rounded-3xl bg-[#070a12] border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between ${
          userMouse.isHovered ? "cursor-none" : ""
        }`}
      >
        {/* Glowing Top-Right & Bottom-Left Peach Accent Borders */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-48 h-[1.5px]"
          style={{
            background:
              "linear-gradient(to left, rgba(248,160,122,0.9), rgba(255,210,179,0.5), transparent)",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 w-48 h-[1.5px]"
          style={{
            background:
              "linear-gradient(to right, rgba(248,160,122,0.9), rgba(255,210,179,0.5), transparent)",
          }}
        />

        {/* Subtle Dotted Layout Grid Overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Very Soft Central Peach Radial Glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, rgba(248,160,122,0.06), transparent 60%)",
          }}
        />

        {/* ── Virtual Canvas Workspace (540 x 390 coordinates) ── */}
        <div className="relative w-full h-full p-0">
          <svg
            viewBox="0 0 540 390"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 1. NAVIGATION BAR */}
            <ComponentWrapper
              config={STEPS[0]}
              isPlaced={placedSteps.nav}
              isHighlighted={hoveredStepId ? hoveredStepId === "nav" : false}
              onMouseEnter={() => assemblyComplete && setHoveredStepId("nav")}
              onMouseLeave={() => setHoveredStepId(null)}
            >
              <foreignObject x={STEPS[0].targetPos.x} y={STEPS[0].targetPos.y} width={STEPS[0].targetPos.w} height={STEPS[0].targetPos.h}>
                <div className="w-full h-full bg-[#0b101c] border border-white/10 rounded-xl px-3.5 py-1.5 flex items-center justify-between shadow-lg">
                  {/* Fynix Logo */}
                  <div className="flex items-center">
                    <Logo className="h-4 w-auto text-white" />
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-1.5 rounded-full bg-white/20" />
                    <div className="w-10 h-1.5 rounded-full bg-white/20" />
                    <div className="w-8 h-1.5 rounded-full bg-white/20" />
                  </div>

                  {/* Nav CTA */}
                  <div className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[10px] font-medium text-white/80">
                    Sign In
                  </div>
                </div>
              </foreignObject>
            </ComponentWrapper>

            {/* 2. HERO HEADING */}
            <ComponentWrapper
              config={STEPS[1]}
              isPlaced={placedSteps.heading}
              isHighlighted={hoveredStepId ? hoveredStepId === "heading" : idleState === "text_highlight"}
              onMouseEnter={() => assemblyComplete && setHoveredStepId("heading")}
              onMouseLeave={() => setHoveredStepId(null)}
            >
              <foreignObject x={STEPS[1].targetPos.x} y={STEPS[1].targetPos.y} width={STEPS[1].targetPos.w} height={STEPS[1].targetPos.h}>
                <div className="w-full h-full flex flex-col justify-center">
                  <h3 className="text-[18px] leading-[1.2] font-bold text-white tracking-tight">
                    Crafting Digital
                  </h3>
                  <h3 className="text-[18px] leading-[1.2] font-serif italic text-[#f8a07a] tracking-tight">
                    User Experiences
                  </h3>
                  <p className="text-[10px] text-white/50 mt-1 font-normal line-clamp-1">
                    Interfaces built with clear purpose & precision.
                  </p>
                </div>
              </foreignObject>
            </ComponentWrapper>

            {/* 3. HERO IMAGE */}
            <ComponentWrapper
              config={STEPS[2]}
              isPlaced={placedSteps.image}
              isHighlighted={hoveredStepId ? hoveredStepId === "image" : idleState === "image_selection"}
              onMouseEnter={() => assemblyComplete && setHoveredStepId("image")}
              onMouseLeave={() => setHoveredStepId(null)}
            >
              <foreignObject x={STEPS[2].targetPos.x} y={STEPS[2].targetPos.y} width={STEPS[2].targetPos.w} height={STEPS[2].targetPos.h}>
                <div className="w-full h-full rounded-xl bg-[#0c111e] border border-white/10 p-3 shadow-xl flex flex-col justify-between overflow-hidden relative group">
                  <div className="flex items-center justify-between text-[10px] text-white/60">
                    <span className="font-mono text-[9px] text-[#f8a07a]">Dashboard_v2.fig</span>
                  </div>

                  {/* Wireframe Mini Graphic */}
                  <div className="space-y-2 my-auto">
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-2 rounded bg-white/20" />
                      <div className="w-8 h-2 rounded bg-[#f8a07a]/40" />
                    </div>
                    <div className="h-10 w-full rounded-lg bg-black/40 border border-white/5 p-1.5 flex items-end gap-1">
                      <div className="flex-1 bg-[#f8a07a]/60 h-[40%] rounded-sm" />
                      <div className="flex-1 bg-[#f8a07a]/80 h-[70%] rounded-sm" />
                      <div className="flex-1 bg-[#f8a07a] h-[100%] rounded-sm" />
                      <div className="flex-1 bg-white/30 h-[50%] rounded-sm" />
                      <div className="flex-1 bg-white/40 h-[65%] rounded-sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-white/40 font-mono">
                    <span>99.4% Uptime</span>
                    <span>Live Preview</span>
                  </div>
                </div>
              </foreignObject>
            </ComponentWrapper>

            {/* 4. CTA BUTTON */}
            <ComponentWrapper
              config={STEPS[3]}
              isPlaced={placedSteps.cta}
              isHighlighted={hoveredStepId ? hoveredStepId === "cta" : false}
              isHovered={idleState === "button_hover"}
              onMouseEnter={() => assemblyComplete && setHoveredStepId("cta")}
              onMouseLeave={() => setHoveredStepId(null)}
            >
              <foreignObject x={STEPS[3].targetPos.x} y={STEPS[3].targetPos.y} width={STEPS[3].targetPos.w} height={STEPS[3].targetPos.h}>
                <div
                  className={`w-full h-full rounded-lg bg-gradient-to-r from-[#f8a07a] to-[#ffd2b3] text-[#070a12] font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 ${
                    idleState === "button_hover" || hoveredStepId === "cta"
                      ? "scale-[1.03] shadow-[0_0_20px_rgba(248,160,122,0.6)] ring-2 ring-white"
                      : "hover:brightness-105"
                  }`}
                >
                  Book Consultation
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </foreignObject>
            </ComponentWrapper>

            {/* 5. FEATURE CARD 1 */}
            <ComponentWrapper
              config={STEPS[4]}
              isPlaced={placedSteps.card1}
              isHighlighted={hoveredStepId ? hoveredStepId === "card1" : false}
              onMouseEnter={() => assemblyComplete && setHoveredStepId("card1")}
              onMouseLeave={() => setHoveredStepId(null)}
            >
              <foreignObject x={STEPS[4].targetPos.x} y={STEPS[4].targetPos.y} width={STEPS[4].targetPos.w} height={STEPS[4].targetPos.h}>
                <div className="w-full h-full rounded-xl bg-[#0c111e] border border-white/10 p-3 flex flex-col justify-between shadow-lg">
                  <div className="w-6 h-6 rounded-lg bg-[#f8a07a]/15 text-[#f8a07a] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-white/90">UX Research</h4>
                    <div className="w-full h-1.5 bg-white/10 rounded mt-1.5" />
                    <div className="w-3/4 h-1.5 bg-white/10 rounded mt-1" />
                  </div>
                </div>
              </foreignObject>
            </ComponentWrapper>

            {/* 6. FEATURE CARD 2 */}
            <ComponentWrapper
              config={STEPS[5]}
              isPlaced={placedSteps.card2}
              isHighlighted={hoveredStepId ? hoveredStepId === "card2" : idleState === "card_selection"}
              onMouseEnter={() => assemblyComplete && setHoveredStepId("card2")}
              onMouseLeave={() => setHoveredStepId(null)}
            >
              <foreignObject x={STEPS[5].targetPos.x} y={STEPS[5].targetPos.y} width={STEPS[5].targetPos.w} height={STEPS[5].targetPos.h}>
                <div className="w-full h-full rounded-xl bg-[#0c111e] border border-white/10 p-3 flex flex-col justify-between shadow-lg">
                  <div className="w-6 h-6 rounded-lg bg-[#f8a07a]/15 text-[#f8a07a] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-white/90">UI Design</h4>
                    <div className="w-full h-1.5 bg-white/10 rounded mt-1.5" />
                    <div className="w-2/3 h-1.5 bg-white/10 rounded mt-1" />
                  </div>
                </div>
              </foreignObject>
            </ComponentWrapper>

            {/* 7. FEATURE CARD 3 */}
            <ComponentWrapper
              config={STEPS[6]}
              isPlaced={placedSteps.card3}
              isHighlighted={hoveredStepId ? hoveredStepId === "card3" : false}
              onMouseEnter={() => assemblyComplete && setHoveredStepId("card3")}
              onMouseLeave={() => setHoveredStepId(null)}
            >
              <foreignObject x={STEPS[6].targetPos.x} y={STEPS[6].targetPos.y} width={STEPS[6].targetPos.w} height={STEPS[6].targetPos.h}>
                <div className="w-full h-full rounded-xl bg-[#0c111e] border border-white/10 p-3 flex flex-col justify-between shadow-lg">
                  <div className="w-6 h-6 rounded-lg bg-[#f8a07a]/15 text-[#f8a07a] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-white/90">Design Systems</h4>
                    <div className="w-full h-1.5 bg-white/10 rounded mt-1.5" />
                    <div className="w-4/5 h-1.5 bg-white/10 rounded mt-1" />
                  </div>
                </div>
              </foreignObject>
            </ComponentWrapper>

            {/* ── SMART ALIGNMENT GUIDES & MEASUREMENTS (Figma Pink/Magenta #ff24bd) ── */}
            <AnimatePresence>
              {(activeGuideStep || idleState === "spacing_guides") && (
                <SmartGuidesOverlay
                  activeStep={activeGuideStep}
                  isIdleSpacing={idleState === "spacing_guides"}
                />
              )}
            </AnimatePresence>

            {/* ── DESIGNER CURSOR (Figma Style with "Jason" Tag) ── */}
            <AnimatePresence>
              {showCursor && (
                <motion.g
                  key="designer-cursor"
                  initial={{ opacity: 0, scale: 0.8, x: activeCursorX, y: activeCursorY }}
                  animate={{ opacity: 1, scale: 1, x: activeCursorX, y: activeCursorY }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    x: {
                      duration: userMouse.isHovered ? 0.04 : 0.4,
                      ease: userMouse.isHovered ? "linear" : EASE_OUT_CUBIC,
                    },
                    y: {
                      duration: userMouse.isHovered ? 0.04 : 0.4,
                      ease: userMouse.isHovered ? "linear" : EASE_OUT_CUBIC,
                    },
                    opacity: { duration: 0.2, ease: "easeOut" },
                    scale: { duration: 0.2, ease: "easeOut" },
                  }}
                  className="pointer-events-none"
                >
                  {/* Figma Pointer Cursor Icon */}
                  <path
                    d="M0 0L0 16L4.5 12L8.5 19.5L11.5 18L7.5 10.5L13 10.5L0 0Z"
                    fill="#ff007a"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  {/* Cursor Label Badge: Jason */}
                  <g transform="translate(14, 12)">
                    <rect x="0" y="0" width="46" height="15" rx="3" fill="#ff007a" />
                    <text x="6" y="11" fill="#ffffff" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                      Jason
                    </text>
                  </g>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Component Wrapper handles entrance animation & Figma Selection Highlight ──
function ComponentWrapper({
  config,
  isPlaced,
  isHighlighted = false,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  config: StepConfig;
  isPlaced: boolean;
  isHighlighted?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: React.ReactNode;
}) {
  const { targetPos, initialOffset } = config;

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <motion.g
        initial={{
          x: initialOffset.x,
          y: initialOffset.y,
          opacity: 0,
        }}
        animate={{
          x: isPlaced ? 0 : initialOffset.x,
          y: isPlaced ? 0 : initialOffset.y,
          opacity: isPlaced ? 1 : 0,
        }}
        transition={{
          duration: 0.45,
          ease: EASE_OUT_CUBIC,
        }}
      >
        {children}

        {/* Figma Selection Bounding Box & Tooltip Tag when highlighted */}
        {isPlaced && isHighlighted && (
          <g className="pointer-events-none">
            <rect
              x={targetPos.x - 2}
              y={targetPos.y - 2}
              width={targetPos.w + 4}
              height={targetPos.h + 4}
              fill="none"
              stroke="#ff007a"
              strokeWidth="1.5"
              rx="6"
            />
            {/* 4 Corner Resize Handles */}
            <rect x={targetPos.x - 4} y={targetPos.y - 4} width="5" height="5" fill="#ffffff" stroke="#ff007a" strokeWidth="1" />
            <rect x={targetPos.x + targetPos.w - 1} y={targetPos.y - 4} width="5" height="5" fill="#ffffff" stroke="#ff007a" strokeWidth="1" />
            <rect x={targetPos.x - 4} y={targetPos.y + targetPos.h - 1} width="5" height="5" fill="#ffffff" stroke="#ff007a" strokeWidth="1" />
            <rect x={targetPos.x + targetPos.w - 1} y={targetPos.y + targetPos.h - 1} width="5" height="5" fill="#ffffff" stroke="#ff007a" strokeWidth="1" />

            {/* Dimension Tooltip Badge */}
            <g transform={`translate(${targetPos.x}, ${targetPos.y - 18})`}>
              <rect x="0" y="0" width="70" height="14" rx="3" fill="#ff007a" />
              <text x="6" y="10" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="600">
                {`${targetPos.w} × ${targetPos.h}`}
              </text>
            </g>
          </g>
        )}
      </motion.g>
    </g>
  );
}

// ── Smart Alignment Guides Overlay (Figma Pink/Magenta #ff007a) ──
function SmartGuidesOverlay({
  activeStep,
  isIdleSpacing,
}: {
  activeStep: StepId | null;
  isIdleSpacing: boolean;
}) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Nav Guides (Step 1) */}
      {(activeStep === "nav" || isIdleSpacing) && (
        <g>
          {/* Top Margin Guide */}
          <line x1="270" y1="0" x2="270" y2="20" stroke="#ff007a" strokeWidth="1" strokeDasharray="2 2" />
          <g transform="translate(258, 4)">
            <rect x="0" y="0" width="24" height="12" rx="2" fill="#ff007a" />
            <text x="4" y="9" fill="#ffffff" fontSize="8" fontWeight="700">20</text>
          </g>
          {/* Left & Right Margin Guides */}
          <line x1="0" y1="38" x2="24" y2="38" stroke="#ff007a" strokeWidth="1" />
          <line x1="516" y1="38" x2="540" y2="38" stroke="#ff007a" strokeWidth="1" />
        </g>
      )}

      {/* Heading Guides (Step 2) */}
      {activeStep === "heading" && (
        <g>
          {/* Vertical Alignment with Nav Left */}
          <line x1="24" y1="20" x2="24" y2="152" stroke="#ff007a" strokeWidth="1" />
          {/* Gap between Nav and Heading */}
          <line x1="140" y1="56" x2="140" y2="76" stroke="#ff007a" strokeWidth="1" strokeDasharray="2 2" />
          <g transform="translate(128, 60)">
            <rect x="0" y="0" width="24" height="12" rx="2" fill="#ff007a" />
            <text x="4" y="9" fill="#ffffff" fontSize="8" fontWeight="700">20</text>
          </g>
        </g>
      )}

      {/* Image Guides (Step 3) */}
      {activeStep === "image" && (
        <g>
          {/* Top Alignment Line with Heading */}
          <line x1="24" y1="76" x2="516" y2="76" stroke="#ff007a" strokeWidth="1" strokeDasharray="3 3" />
          {/* Gap between Heading and Image */}
          <line x1="269" y1="150" x2="285" y2="150" stroke="#ff007a" strokeWidth="1" />
          <g transform="translate(265, 134)">
            <rect x="0" y="0" width="20" height="12" rx="2" fill="#ff007a" />
            <text x="4" y="9" fill="#ffffff" fontSize="8" fontWeight="700">16</text>
          </g>
        </g>
      )}

      {/* CTA Button Guides (Step 4) */}
      {activeStep === "cta" && (
        <g>
          {/* Left Alignment Line with Heading */}
          <line x1="24" y1="76" x2="24" y2="208" stroke="#ff007a" strokeWidth="1" />
          {/* Gap between Heading and CTA */}
          <line x1="90" y1="152" x2="90" y2="172" stroke="#ff007a" strokeWidth="1" strokeDasharray="2 2" />
          <g transform="translate(78, 156)">
            <rect x="0" y="0" width="24" height="12" rx="2" fill="#ff007a" />
            <text x="4" y="9" fill="#ffffff" fontSize="8" fontWeight="700">20</text>
          </g>
        </g>
      )}

      {/* Card Guides (Step 5, 6, 7 & Idle Spacing) */}
      {(activeStep === "card1" || activeStep === "card2" || activeStep === "card3" || isIdleSpacing) && (
        <g>
          {/* Cards Top Alignment Line */}
          <line x1="24" y1="244" x2="516" y2="244" stroke="#ff007a" strokeWidth="1" strokeDasharray="3 3" />

          {/* Gap between Card 1 & Card 2 */}
          <line x1="176" y1="300" x2="192" y2="300" stroke="#ff007a" strokeWidth="1" />
          <g transform="translate(172, 284)">
            <rect x="0" y="0" width="20" height="12" rx="2" fill="#ff007a" />
            <text x="4" y="9" fill="#ffffff" fontSize="8" fontWeight="700">16</text>
          </g>

          {/* Gap between Card 2 & Card 3 */}
          <line x1="344" y1="300" x2="360" y2="300" stroke="#ff007a" strokeWidth="1" />
          <g transform="translate(340, 284)">
            <rect x="0" y="0" width="20" height="12" rx="2" fill="#ff007a" />
            <text x="4" y="9" fill="#ffffff" fontSize="8" fontWeight="700">16</text>
          </g>
        </g>
      )}
    </motion.g>
  );
}
