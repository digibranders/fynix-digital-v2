"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Home, Compass } from "lucide-react";
import Logo from "@/components/Logo";

export default function NotFoundVisual() {
  const [isLightOn, setIsLightOn] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0); // 0 to 26px extension
  const [swayAngle, setSwayAngle] = useState(0); // Rotational & wave jiggle displacement
  const animFrameRef = useRef<number | null>(null);

  // Trigger physics jiggle on initial mount & pull release
  const triggerPhysicsJiggle = () => {
    const startTime = performance.now();
    const duration = 1600; // ms

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Damped harmonic oscillation formula: e^(-decay * t) * sin(frequency * t)
      const decay = Math.exp(-progress * 4.2);
      const wave = Math.sin(progress * Math.PI * 7.5);
      const currentAngle = decay * wave * 22; // degrees / displacement px

      setSwayAngle(currentAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSwayAngle(0);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Initial mount physics entrance jiggle
    const timer = setTimeout(() => {
      triggerPhysicsJiggle();
    }, 150);
    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePullStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsPulling(true);
    setPullY(26);
    setIsLightOn((prev) => !prev);
  };

  const handlePullEnd = () => {
    setIsPulling(false);
    setPullY(0);
    triggerPhysicsJiggle();
  };

  // Calculate SVG curve coordinates for realistic rope flex
  const baseCordLength = 140;
  const currentCordLength = baseCordLength + pullY;
  const anchorX = 40;
  const anchorY = 0;

  // Handle position (sways in an arc)
  const handleX = anchorX + (isPulling ? 3 : swayAngle * 1.4);
  const handleY = currentCordLength;

  // Midpoint S-curve flex control point (gives rope bending jiggle)
  const controlX = anchorX + (isPulling ? 1.5 : -swayAngle * 0.8);
  const controlY = currentCordLength * 0.5;

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[100] flex flex-col items-center justify-between overflow-hidden select-none transition-colors duration-700 font-sans"
      style={{
        backgroundColor: isLightOn ? "#DFDCD5" : "#0C0D10",
      }}
    >
      {/* 1. STUDIO WALL BACKGROUND WITH SOFT ATMOSPHERIC LIGHT FALLOFF */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          background: isLightOn
            ? `
              radial-gradient(ellipse 70% 60% at 50% 24%, 
                rgba(255, 254, 247, 0.98) 0%, 
                rgba(242, 238, 229, 0.85) 30%, 
                rgba(218, 213, 203, 0.65) 60%, 
                rgba(178, 172, 160, 0.95) 100%)
            `
            : `
              radial-gradient(ellipse 70% 60% at 50% 24%, 
                rgba(45, 50, 60, 0.7) 0%, 
                rgba(18, 20, 24, 0.95) 60%, 
                rgba(8, 9, 11, 0.99) 100%)
            `,
        }}
      />

      {/* Subtle Studio Concrete Noise Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 2. SOFT VOLUMETRIC LIGHT BEAM CONE */}
      <div
        className="absolute top-[105px] sm:top-[125px] md:top-[140px] left-1/2 -translate-x-1/2 w-[550px] sm:w-[750px] md:w-[950px] h-[78vh] pointer-events-none transition-opacity duration-700 z-10"
        style={{
          opacity: isLightOn ? 1 : 0.03,
          background:
            "conic-gradient(from 150deg at 50% 0%, transparent 0deg, rgba(255, 255, 250, 0.45) 20deg, rgba(255, 253, 242, 0.75) 30deg, rgba(255, 255, 250, 0.45) 40deg, transparent 60deg)",
          filter: "blur(26px)",
          maskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
        }}
      />

      {/* SOFT STUDIO CYCLORAMA WALL-TO-FLOOR SEAM SHADOW */}
      <div
        className="absolute inset-x-0 bottom-[38%] h-14 -mb-7 pointer-events-none transition-opacity duration-700 z-14"
        style={{
          background: isLightOn
            ? "linear-gradient(to bottom, transparent 0%, rgba(145, 138, 125, 0.16) 50%, transparent 100%)"
            : "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.45) 50%, transparent 100%)",
          filter: "blur(5px)",
        }}
      />

      {/* 3. STUDIO FLOOR PERSPECTIVE PLANE WITH SEAMLESS BLENDED TRANSITION */}
      <div
        className="absolute inset-x-0 bottom-0 h-[38%] pointer-events-none transition-colors duration-700 z-15"
        style={{
          background: isLightOn
            ? "linear-gradient(to bottom, rgba(165, 158, 146, 0.2) 0%, rgba(218, 213, 203, 0.45) 12%, rgba(195, 189, 178, 0.85) 100%)"
            : "linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(16, 18, 22, 0.65) 12%, rgba(6, 7, 9, 0.98) 100%)",
        }}
      />

      {/* Floor Spotlight Pool Glow */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[65%] max-w-[620px] h-[170px] rounded-[100%] transition-opacity duration-700 pointer-events-none z-15"
        style={{
          opacity: isLightOn ? 0.9 : 0.05,
          background:
            "radial-gradient(ellipse at center, rgba(255, 255, 248, 0.95) 0%, rgba(255, 252, 238, 0.5) 38%, rgba(255, 255, 255, 0) 75%)",
          filter: "blur(22px)",
        }}
      />

      {/* TOP HEADER: Authentic Fynix Logo */}
      <header className="relative z-40 w-full max-w-7xl px-6 py-5 flex items-center justify-between pointer-events-auto">
        <Link href="/" className="inline-flex items-center group">
          <Logo
            className="h-8 md:h-9 w-auto transition-colors duration-500"
            style={{ color: isLightOn ? "#0C1E2E" : "#FFFFFF" }}
          />
        </Link>
      </header>

      {/* 4. HANGING PENDANT LAMP & CEILING-PINNED REALISTIC BORDERLESS SVG PULL STRING */}
      <div className="absolute top-0 inset-x-0 flex flex-col items-center pointer-events-none z-30">
        {/* Main Ceiling Wire Cord */}
        <div
          className="w-[2px] h-[45px] sm:h-[65px] md:h-[80px] transition-colors duration-500"
          style={{
            backgroundColor: isLightOn ? "#1E2126" : "#4A505A",
            boxShadow: "1px 0 3px rgba(0,0,0,0.3)",
          }}
        />

        {/* Socket Top Metallic Cap */}
        <div
          className="w-4 h-3.5 rounded-t-sm"
          style={{
            background: "linear-gradient(to right, #4A5059, #1A1C20, #4A5059)",
          }}
        />

        {/* Metallic Collar Ring */}
        <div
          className="w-6.5 h-2.5 rounded-sm"
          style={{
            background: "linear-gradient(to right, #6E7582, #2B2E35, #6E7582)",
          }}
        />

        {/* Bell Lamp Shade & Bulb */}
        <div className="relative">
          <svg
            width="90"
            height="60"
            viewBox="0 0 84 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-xl pointer-events-none"
          >
            <defs>
              <linearGradient id="shadeMatteGradSvg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#454A53" />
                <stop offset="25%" stopColor="#22252B" />
                <stop offset="65%" stopColor="#121417" />
                <stop offset="100%" stopColor="#353A42" />
              </linearGradient>
              <linearGradient id="bulbInnerGlowSvg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFF2D4" />
              </linearGradient>
            </defs>
            {/* Bell Shade Body */}
            <path
              d="M32 4 C32 10 12 24 4 48 C15 54 69 54 80 48 C72 24 52 10 52 4 Z"
              fill="url(#shadeMatteGradSvg)"
            />
            {/* Specular Highlight Rim */}
            <path
              d="M32 4 C36 12 48 12 52 4"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Lower Rim Lip */}
            <ellipse
              cx="42"
              cy="48"
              rx="38"
              ry="6"
              fill={isLightOn ? "url(#bulbInnerGlowSvg)" : "#1C1E22"}
              stroke="#0F1013"
              strokeWidth="1.5"
            />
          </svg>

          {/* Bulb Intense Light Source */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-3.5 rounded-full transition-all duration-300 pointer-events-none"
            style={{
              backgroundColor: isLightOn ? "#FFFFFF" : "#333",
              boxShadow: isLightOn
                ? "0 0 35px 15px rgba(255, 255, 245, 0.98), 0 0 70px 30px rgba(255, 240, 190, 0.7)"
                : "none",
            }}
          />
        </div>

        {/* 🌟 CEILING-PINNED BORDERLESS PHOTOREALISTIC SVG PULL STRING (NO STROKE OUTLINES!) */}
        <div
          className="absolute top-0 right-[calc(50%-88px)] sm:right-[calc(50%-96px)] md:right-[calc(50%-104px)] pointer-events-auto group cursor-grab active:cursor-grabbing"
          onMouseDown={handlePullStart}
          onMouseUp={handlePullEnd}
          onMouseLeave={handlePullEnd}
          onTouchStart={handlePullStart}
          onTouchEnd={handlePullEnd}
          title="Pull string down to toggle light"
          style={{ width: "80px", height: "200px" }}
        >
          <svg width="80" height="200" viewBox="0 0 80 200" fill="none" className="overflow-visible">
            <defs>
              <linearGradient id="brassGlowGradBorderless" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FAF0C5" />
                <stop offset="35%" stopColor="#D4AF37" />
                <stop offset="75%" stopColor="#AA820A" />
                <stop offset="100%" stopColor="#6E5004" />
              </linearGradient>
              <linearGradient id="darkMetallicGradBorderless" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7E8492" />
                <stop offset="50%" stopColor="#4A505C" />
                <stop offset="100%" stopColor="#22252B" />
              </linearGradient>
              <filter id="handleSoftShadow" x="-50%" y="-20%" width="200%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Borderless Flexible Bead String Cable */}
            <path
              d={`M ${anchorX} ${anchorY} Q ${controlX} ${controlY} ${handleX} ${handleY}`}
              stroke={isLightOn ? "#868C98" : "#454B55"}
              strokeWidth="1.8"
              strokeDasharray="2.5 2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Photorealistic Borderless Brass Teardrop Handle */}
            <g transform={`translate(${handleX}, ${handleY})`}>
              {/* Connector Ring (No Stroke) */}
              <circle cx="0" cy="1" r="2.2" fill={isLightOn ? "#D4AF37" : "#5A606C"} stroke="none" />

              {/* Seamless Teardrop Handle Body (No Stroke Border Outline!) */}
              <path
                d="M -3.5 3 C -4 3 -5.5 11 0 18.5 C 5.5 11 4 3 3.5 3 Z"
                fill={isLightOn ? "url(#brassGlowGradBorderless)" : "url(#darkMetallicGradBorderless)"}
                stroke="none"
                filter="url(#handleSoftShadow)"
                className="transition-transform duration-150 group-hover:scale-110"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* 5. CENTER SECTION: SOLID MATTE "404" & 1:1 ORGANIC 3D FLOOR RUBBLE SCATTER */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto pt-14 pb-2 pointer-events-none">
        {/* Photorealistic Solid Matte "404" Display (Tightly Spaced) */}
        <div className="relative flex items-center justify-center">
          <h1
            className="font-extrabold text-[88px] sm:text-[116px] md:text-[144px] lg:text-[160px] leading-none tracking-[0.02em] flex items-center justify-center font-sans select-none"
            style={{
              color: "#16181B",
              textShadow: isLightOn
                ? "0 10px 24px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.6)"
                : "0 10px 24px rgba(0,0,0,0.95)",
              WebkitTextStroke: "1px #0A0B0D",
            }}
          >
            404
          </h1>
        </div>

        {/* 1:1 HIGH-FIDELITY ORGANIC CONCRETE RUBBLE FIELD WITH SPATIAL 2D DEPTH */}
        {/* Anchored to the wall-to-floor seam (bottom-[38%]) via `fixed`, so the rubble
            always rests ON the divider line at every screen size — instead of riding up
            the wall with the "404" on mobile. Centered on the seam with translate-y-1/2. */}
        <div className="fixed bottom-[38%] inset-x-0 flex justify-center translate-y-1/2 pointer-events-none z-20">
          <svg
            width="760"
            height="110"
            viewBox="0 0 760 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[360px] sm:w-[500px] md:w-[640px] lg:w-[760px] h-auto"
          >
            <defs>
              <linearGradient id="rockHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5E6573" />
                <stop offset="50%" stopColor="#3B404A" />
                <stop offset="100%" stopColor="#22252C" />
              </linearGradient>
              <linearGradient id="rockShadowFace" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2D3139" />
                <stop offset="100%" stopColor="#14161B" />
              </linearGradient>
              <linearGradient id="pebbleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A505C" />
                <stop offset="100%" stopColor="#282B33" />
              </linearGradient>
              <filter id="rockDropShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0.5" dy="2" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* --- 1. FINE FLOOR FISSURES / HAIRLINE CRACKS --- */}
            <g stroke="rgba(30,33,40,0.5)" strokeWidth="0.8" strokeLinecap="round" opacity="0.75">
              <path d="M260,35 Q272,38 282,34 T298,37" fill="none" />
              <path d="M340,32 Q354,36 368,30 T384,35" fill="none" />
              <path d="M420,36 Q434,32 446,37 T462,33" fill="none" />
              <path d="M500,34 Q512,38 522,33 T535,36" fill="none" />
            </g>

            {/* --- 2. PRIMARY 3D MULTI-FACETED CONCRETE ROCK CHUNKS --- */}
            <g filter="url(#rockDropShadow)">
              <polygon points="204,58 224,64 246,55 232,44" fill="url(#rockShadowFace)" />
              <polygon points="204,58 220,50 232,44 218,52" fill="url(#rockHighlight)" />
            </g>
            <g filter="url(#rockDropShadow)">
              <polygon points="274,74 296,80 322,72 304,60" fill="url(#rockShadowFace)" />
              <polygon points="274,74 290,64 304,60 288,70" fill="url(#rockHighlight)" />
            </g>
            <g filter="url(#rockDropShadow)">
              <polygon points="352,60 378,66 402,58 384,46" fill="url(#rockShadowFace)" />
              <polygon points="352,60 368,50 384,46 368,56" fill="url(#rockHighlight)" />
            </g>
            <g filter="url(#rockDropShadow)">
              <polygon points="438,68 460,74 485,66 468,54" fill="url(#rockShadowFace)" />
              <polygon points="438,68 454,58 468,54 452,64" fill="url(#rockHighlight)" />
            </g>
            <g filter="url(#rockDropShadow)">
              <polygon points="524,60 542,65 565,58 550,48" fill="url(#rockShadowFace)" />
              <polygon points="524,60 538,52 550,48 536,56" fill="url(#rockHighlight)" />
            </g>
            <g filter="url(#rockDropShadow)">
              <polygon points="585,75 600,79 618,73 608,65" fill="url(#rockShadowFace)" />
              <polygon points="585,75 596,68 608,65 596,72" fill="url(#rockHighlight)" />
            </g>

            {/* --- 3. SECONDARY ANGULAR PEBBLES --- */}
            <g filter="url(#rockDropShadow)" opacity="0.9">
              <polygon points="160,62 172,58 178,64 166,67" fill="url(#pebbleGrad)" />
              <polygon points="230,78 242,74 248,80 236,83" fill="url(#pebbleGrad)" />
              <polygon points="255,42 266,38 272,43 261,46" fill="url(#pebbleGrad)" />
              <polygon points="315,50 326,46 332,51 321,54" fill="url(#pebbleGrad)" />
              <polygon points="335,82 348,77 354,83 341,87" fill="url(#pebbleGrad)" />
              <polygon points="410,48 422,44 428,49 416,52" fill="url(#pebbleGrad)" />
              <polygon points="425,78 438,73 444,79 431,83" fill="url(#pebbleGrad)" />
              <polygon points="495,44 507,40 513,45 501,48" fill="url(#pebbleGrad)" />
              <polygon points="508,76 520,72 526,77 514,80" fill="url(#pebbleGrad)" />
              <polygon points="570,48 582,44 588,49 576,52" fill="url(#pebbleGrad)" />
              <polygon points="630,68 642,64 648,70 636,73" fill="url(#pebbleGrad)" />
            </g>

            {/* --- 4. ORGANIC DUST & FINE CONCRETE GRAVEL --- */}
            <g opacity="0.75">
              <circle cx="125" cy="65" r="1.2" fill="#3D424B" />
              <circle cx="145" cy="58" r="1.4" fill="#4B515C" />
              <circle cx="170" cy="72" r="1.6" fill="#5A616F" />
              <circle cx="190" cy="46" r="1.5" fill="#4B515C" />
              <circle cx="245" cy="62" r="1.8" fill="#5E6573" />
              <circle cx="285" cy="45" r="1.5" fill="#4B515C" />
              <circle cx="310" cy="66" r="2.0" fill="#6A717F" />
              <circle cx="345" cy="42" r="1.4" fill="#3D424C" />
              <circle cx="365" cy="76" r="1.8" fill="#5E6573" />
              <circle cx="395" cy="44" r="1.6" fill="#4B515C" />
              <circle cx="415" cy="70" r="2.1" fill="#6A717F" />
              <circle cx="455" cy="46" r="1.5" fill="#4B515C" />
              <circle cx="475" cy="78" r="1.7" fill="#5E6573" />
              <circle cx="515" cy="52" r="1.9" fill="#6A717F" />
              <circle cx="560" cy="72" r="1.6" fill="#5A616F" />
              <circle cx="595" cy="52" r="1.4" fill="#4B515C" />
              <circle cx="625" cy="62" r="1.5" fill="#4B515C" />
              <circle cx="650" cy="56" r="1.2" fill="#3D424B" />
              <circle cx="675" cy="68" r="1.1" fill="#2E333B" />
            </g>
          </svg>
        </div>
      </div>

      {/* 6. BOTTOM SECTION: Atmospheric Copy & Action Buttons */}
      <footer className="relative z-40 w-full max-w-xl mx-auto px-4 pb-8 flex flex-col items-center text-center space-y-4 pointer-events-auto">
        <div className="space-y-1.5">
          <h1
            className="font-serif text-xl sm:text-2xl md:text-3xl font-medium tracking-tight transition-colors duration-500"
            style={{ color: isLightOn ? "#0C1E2E" : "#F0F4F8" }}
          >
            Page Not Found
          </h1>
          <p
            className="text-xs sm:text-sm font-normal max-w-sm mx-auto transition-colors duration-500"
            style={{ color: isLightOn ? "#565D64" : "#94A3B8" }}
          >
            The page you requested doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white hover:text-white font-medium text-xs rounded-full shadow-md hover:shadow-lg hover:bg-primary-hover transition-all duration-200 group"
          >
            <Home className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-xs rounded-full border transition-all duration-200 group"
            style={{
              borderColor: isLightOn ? "#D5D2C9" : "#2E333D",
              backgroundColor: isLightOn ? "rgba(255,255,255,0.75)" : "rgba(25,28,34,0.75)",
              color: isLightOn ? "#0C1E2E" : "#E2E8F0",
            }}
          >
            <Compass className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
            <span>Services</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
