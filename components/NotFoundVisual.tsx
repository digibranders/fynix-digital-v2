"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Compass, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function NotFoundVisual() {
  const [isLightOn, setIsLightOn] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const [isWiggling, setIsWiggling] = useState(true); // Trigger physics sway on initial mount

  useEffect(() => {
    // Initial mount physics entrance sway
    const timer = setTimeout(() => {
      setIsWiggling(false);
    }, 1450);
    return () => clearTimeout(timer);
  }, []);

  const handlePullStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsPulling(true);
    setIsWiggling(false);
    setIsLightOn((prev) => !prev);
  };

  const handlePullEnd = () => {
    setIsPulling(false);
    // Force a re-trigger of keyframe animation
    setIsWiggling(false);
    requestAnimationFrame(() => {
      setIsWiggling(true);
      setTimeout(() => {
        setIsWiggling(false);
      }, 1450);
    });
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[100] flex flex-col items-center justify-between overflow-hidden select-none transition-colors duration-700 font-sans"
      style={{
        backgroundColor: isLightOn ? "#DFDCD5" : "#0C0D10",
      }}
    >
      {/* Authentic Rotational Pendulum Physics Keyframes (Zero Straight Line Interference) */}
      <style jsx global>{`
        @keyframes truePendulumArc {
          0% {
            transform: rotate(0deg);
          }
          18% {
            transform: rotate(18deg);
          }
          36% {
            transform: rotate(-13.5deg);
          }
          54% {
            transform: rotate(9deg);
          }
          72% {
            transform: rotate(-5deg);
          }
          86% {
            transform: rotate(2.2deg);
          }
          96% {
            transform: rotate(-0.8deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes idlePhysicsSway {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(1.8deg);
          }
          75% {
            transform: rotate(-1.8deg);
          }
        }

        .animate-true-pendulum {
          animation: truePendulumArc 1.45s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
          transform-origin: 50% 0px !important;
        }

        .animate-idle-physics {
          animation: idlePhysicsSway 4.8s ease-in-out infinite !important;
          transform-origin: 50% 0px !important;
        }
      `}</style>

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

      {/* TOP HEADER: Authentic Fynix Logo & Home Link */}
      <header className="relative z-40 w-full max-w-7xl px-6 py-5 flex items-center justify-between pointer-events-auto">
        <Link href="/" className="inline-flex items-center group">
          <Logo
            className="h-8 md:h-9 w-auto transition-colors duration-500"
            style={{ color: isLightOn ? "#0C1E2E" : "#FFFFFF" }}
          />
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium rounded-full bg-primary text-white hover:bg-primary-hover transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* 4. HANGING PENDANT LAMP & PARALLEL CEILING PULL STRING WITH PURE ROTATIONAL PENDULUM ARC */}
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
              <linearGradient id="shadeMatteGradPendulumTrue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#454A53" />
                <stop offset="25%" stopColor="#22252B" />
                <stop offset="65%" stopColor="#121417" />
                <stop offset="100%" stopColor="#353A42" />
              </linearGradient>
              <linearGradient id="bulbInnerGlowPendulumTrue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFF2D4" />
              </linearGradient>
            </defs>
            {/* Bell Shade Body */}
            <path
              d="M32 4 C32 10 12 24 4 48 C15 54 69 54 80 48 C72 24 52 10 52 4 Z"
              fill="url(#shadeMatteGradPendulumTrue)"
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
              fill={isLightOn ? "url(#bulbInnerGlowPendulumTrue)" : "#1C1E22"}
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

        {/* 🌟 PARALLEL PULL STRING WITH PURE ROTATIONAL PENDULUM ARC (NO INLINE TRANSITION CONFLICT) */}
        <div
          className={`absolute top-0 right-[calc(50%-56px)] sm:right-[calc(50%-64px)] md:right-[calc(50%-72px)] flex flex-col items-center pointer-events-auto group cursor-grab active:cursor-grabbing ${
            isPulling ? "" : isWiggling ? "animate-true-pendulum" : "animate-idle-physics"
          }`}
          onMouseDown={handlePullStart}
          onMouseUp={handlePullEnd}
          onMouseLeave={handlePullEnd}
          onTouchStart={handlePullStart}
          onTouchEnd={handlePullEnd}
          title="Pull string down to toggle light"
          style={{
            height: "calc(100% + 22px)",
            transformOrigin: "50% 0px",
            transform: isPulling
              ? "translateY(24px) rotate(4deg) scaleY(1.08)"
              : undefined,
            transition: isPulling ? "transform 0.08s ease-out" : "none", // NO CSS TRANSITION ON RELEASE
          }}
        >
          {/* Full Ceiling-to-Shade Parallel Bead Chain */}
          <div
            className="w-[2px] h-[105px] sm:h-[125px] md:h-[142px] transition-colors duration-500"
            style={{
              background: "repeating-linear-gradient(to bottom, #A6ACB8 0px, #A6ACB8 2.5px, #363A42 2.5px, #363A42 5px)",
              boxShadow: "1px 0 3px rgba(0,0,0,0.35)",
            }}
          />

          {/* Polished Brass Weighted Pull Bead Handle */}
          <div className="relative -mt-0.5 flex flex-col items-center">
            {/* Top Ring Connector */}
            <div
              className="w-2 h-1.5 rounded-full border border-yellow-600/60"
              style={{
                background: "linear-gradient(to bottom, #D4AF37, #AA820A)",
              }}
            />
            {/* Teardrop Metallic Bead Handle */}
            <div
              className="w-3.5 h-6 rounded-b-full rounded-t-sm shadow-md transition-all duration-200 group-hover:scale-110 group-hover:brightness-125"
              style={{
                background: isLightOn
                  ? "linear-gradient(to bottom, #F5E8B8, #C8A35A, #8F6F25)"
                  : "linear-gradient(to bottom, #A6ABB6, #585D67, #2B2E35)",
                boxShadow: isPulling
                  ? "0 0 14px rgba(245, 232, 184, 0.9)"
                  : "0 2px 6px rgba(0,0,0,0.45)",
              }}
            />
          </div>
        </div>
      </div>

      {/* 5. CENTER SECTION: TIGHTLY-SPACED SOLID MATTE "404" & DEBRIS */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto pt-14 pb-2 pointer-events-none">
        {/* Soft Ambient Occlusion Contact Shadow */}
        <div
          className="absolute bottom-1.5 w-[65%] max-w-[480px] h-6 rounded-[100%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0) 80%)",
            filter: "blur(5.5px)",
          }}
        />

        {/* Photorealistic Solid Matte "404" Display (Tightly Spaced) */}
        <div className="relative flex items-center justify-center">
          <h1
            className="font-extrabold text-[120px] sm:text-[160px] md:text-[210px] lg:text-[250px] leading-none tracking-[0.02em] flex items-center justify-center font-sans select-none"
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

        {/* HIGH-END MINIMALIST CONCRETE DEBRIS SCATTER */}
        <div className="absolute -bottom-6 w-full flex justify-center pointer-events-none">
          <svg
            width="600"
            height="50"
            viewBox="0 0 600 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[320px] sm:w-[440px] md:w-[540px] lg:w-[620px] h-auto"
          >
            <defs>
              <linearGradient id="concreteMatteDarkSpaced" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#444A54" />
                <stop offset="100%" stopColor="#25282E" />
              </linearGradient>
              <linearGradient id="concreteMatteMidSpaced" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5B626E" />
                <stop offset="100%" stopColor="#313640" />
              </linearGradient>
              <filter id="subtleOcclusionSpaced" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* --- FINE FLOOR FISSURES BENEATH TIGHT 404 --- */}
            <g stroke="rgba(40,44,50,0.45)" strokeWidth="0.8" strokeLinecap="round" opacity="0.8">
              <path d="M230,24 Q240,26 248,23 T260,25" fill="none" />
              <path d="M295,22 Q307,25 317,21 T330,24" fill="none" />
              <path d="M365,25 Q377,23 385,26 T397,23" fill="none" />
            </g>

            {/* --- CONCRETE DEBRIS (COMPACT FIT TO TIGHT 404 BASE) --- */}
            <g filter="url(#subtleOcclusionSpaced)">
              <polygon points="175,24 189,20 197,27 183,30 173,27" fill="url(#concreteMatteDarkSpaced)" />
              <polygon points="230,26 246,21 257,28 240,32 227,29" fill="url(#concreteMatteMidSpaced)" />
              <polygon points="295,22 313,17 327,24 309,29 293,26" fill="url(#concreteMatteMidSpaced)" />
              <polygon points="368,25 384,20 396,26 380,31 366,28" fill="url(#concreteMatteMidSpaced)" />
              <polygon points="425,26 442,21 452,27 434,32 422,29" fill="url(#concreteMatteDarkSpaced)" />
            </g>

            {/* --- PEBBLE-SIZED FRAGMENTS --- */}
            <g filter="url(#subtleOcclusionSpaced)" opacity="0.88">
              <polygon points="140,30 150,27 155,32 145,34" fill="url(#concreteMatteDarkSpaced)" />
              <polygon points="202,31 211,28 217,33 207,35" fill="url(#concreteMatteMidSpaced)" />
              <polygon points="268,28 277,25 282,30 272,32" fill="url(#concreteMatteMidSpaced)" />
              <polygon points="340,29 350,26 355,31 344,33" fill="url(#concreteMatteMidSpaced)" />
              <polygon points="402,30 412,27 417,32 406,34" fill="url(#concreteMatteDarkSpaced)" />
              <polygon points="460,28 470,25 475,30 464,32" fill="url(#concreteMatteDarkSpaced)" />
            </g>

            {/* --- GRADUAL OUTWARD FADE SPECKS --- */}
            <g opacity="0.7">
              <circle cx="115" cy="33" r="1.2" fill="#3D424B" />
              <circle cx="130" cy="31" r="1.4" fill="#4B515C" />
              <circle cx="158" cy="32" r="1.6" fill="#5A616F" />
              <circle cx="215" cy="34" r="1.5" fill="#585E6B" />
              <circle cx="254" cy="30" r="1.8" fill="#6E7583" />
              <circle cx="282" cy="32" r="1.4" fill="#4E5460" />
              <circle cx="332" cy="31" r="1.6" fill="#6A717F" />
              <circle cx="360" cy="33" r="1.4" fill="#3D424C" />
              <circle cx="396" cy="32" r="1.8" fill="#626875" />
              <circle cx="445" cy="31" r="1.5" fill="#4E5460" />
              <circle cx="480" cy="30" r="1.3" fill="#3D424B" />
              <circle cx="505" cy="32" r="1.1" fill="#2E333B" />
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
