"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Variant = "up" | "left" | "right" | "scale";

type Props = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  variant?: Variant;
  blur?: boolean;
  className?: string;
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function hiddenTransform(variant: Variant, distance: number): string {
  switch (variant) {
    case "left":
      return `translate3d(-${distance}px, 0, 0) scale(0.98)`;
    case "right":
      return `translate3d(${distance}px, 0, 0) scale(0.98)`;
    case "scale":
      return `translate3d(0, 24px, 0) scale(0.94)`;
    case "up":
    default:
      return `translate3d(0, ${distance}px, 0) scale(0.96)`;
  }
}

export default function Reveal({
  children,
  delay = 0,
  duration = 1000,
  distance = 56,
  variant = "up",
  blur = true,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -80px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0, 0, 0) scale(1)" : hiddenTransform(variant, distance),
    filter: blur && !visible ? "blur(6px)" : "blur(0px)",
    transitionProperty: "opacity, transform, filter",
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: EASE,
    transitionDelay: visible ? `${delay}ms` : "0ms",
    willChange: visible ? "auto" : "opacity, transform, filter",
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
