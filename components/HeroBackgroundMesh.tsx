"use client";

import React, { useEffect, useRef } from "react";

export default function HeroBackgroundMesh() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Dotted wave configurations
    const numLines = 14;
    
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // We want to draw multiple flowing diagonal curves made of dots
      ctx.fillStyle = "rgba(233, 175, 136, 0.15)"; // var(--accent) in rgb with low opacity

      for (let i = 0; i < numLines; i++) {
        // Position variables for each line
        const progress = i / numLines;
        
        // Base vertical starting position of the line
        const baseY = height * (0.1 + progress * 0.9);
        
        // Horizontal spacing of dots
        const dotSpacing = 16;
        
        for (let x = 0; x < width + 100; x += dotSpacing) {
          // A beautiful compound wave function to create elegant swooping curves
          const angle = x * 0.0012 + progress * 1.8 + time * 0.015;
          const secondaryAngle = x * 0.0006 - progress * 0.8 - time * 0.008;
          
          // Compound wave offset
          const waveOffsetY = Math.sin(angle) * 70 + Math.cos(secondaryAngle) * 40;
          
          // Add a diagonal downward slant to the lines to mimic the flow in the image
          const slantY = x * 0.18; 
          
          const y = baseY + waveOffsetY - slantY;

          // Only draw dots that are inside or near the viewport
          if (y > -10 && y < height + 10) {
            // Radial fade: dots closer to the center/bottom-right are slightly more visible,
            // while those near edges fade out
            const distToLeft = x / width;
            const distToTop = y / height;
            
            // Adjust opacity based on coordinate positions for an elegant fade
            const opacity = 0.03 + (1 - distToLeft) * distToTop * 0.16;
            
            ctx.fillStyle = `rgba(233, 175, 136, ${opacity})`;
            
            // Vary dot size slightly based on position
            const radius = 0.8 + (1 - distToLeft) * 0.8;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (!prefersReducedMotion) {
        time += 0.05;
        animationId = requestAnimationFrame(draw);
      }
    };

    // Use IntersectionObserver to only draw when the canvas is visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (prefersReducedMotion) {
            draw(); // Draw once for static background
          } else {
            animationId = requestAnimationFrame(draw);
          }
        } else {
          cancelAnimationFrame(animationId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.45]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
