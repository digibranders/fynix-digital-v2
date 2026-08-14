"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";

type Props = { children: ReactNode };

function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const href = target.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#") || href.startsWith("javascript:")) return;

      try {
        const url = new URL(target.href, window.location.href);
        if (url.pathname === window.location.pathname && !url.hash) {
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo(0, 0);
          }
        }
      } catch {
        // Invalid URL
      }
    };

    window.addEventListener("click", handleAnchorClick, true);
    return () => window.removeEventListener("click", handleAnchorClick, true);
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: Props) {
  const [disableSmooth, setDisableSmooth] = useState(false);

  useEffect(() => {
    // Skip Lenis when the user prefers reduced motion OR is on a touch device.
    // Touch scrolling already bypasses Lenis (syncTouch is off), so on phones/
    // tablets it adds nothing but a constant requestAnimationFrame loop that
    // competes with hydration and delays the hero image paint on throttled CPUs.
    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(pointer: coarse)"),
    ];
    const update = () => setDisableSmooth(queries.some((q) => q.matches));
    update();
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);

  if (disableSmooth) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      }}
    >
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}

