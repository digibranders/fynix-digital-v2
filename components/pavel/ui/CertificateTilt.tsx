"use client";

import React, { useEffect, useRef } from "react";

const MAX_TILT_DEG = 7; // peak rotation at the corners

/**
 * Wraps the certificate preview and tilts it in 3D toward the cursor, giving a
 * subtle "wobble" as the pointer moves across it.
 *
 * Performance: the pointer position is written straight to the element's
 * `transform` via a ref inside a `requestAnimationFrame` callback — there is no
 * React state and therefore no re-render on `mousemove` (which fires dozens of
 * times a second). Multiple moves within a frame collapse to a single style
 * write, and `transform` is GPU-composited, so it never triggers layout/paint.
 * Honours `prefers-reduced-motion` by staying flat.
 */
export const CertificateTilt: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    // Cancel any pending frame if the component unmounts mid-gesture.
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const apply = (rx: number, ry: number) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    });
  };

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    // Cursor right/left → rotate around Y; up/down → rotate around X (inverted
    // so the surface leans toward the pointer, like a physical card).
    apply(-py * MAX_TILT_DEG, px * MAX_TILT_DEG);
  };

  const reset = () => apply(0, 0);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={className}
      style={{
        transform: "perspective(1200px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 200ms ease-out",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};
