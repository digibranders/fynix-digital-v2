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

  /*
   * `children` are rendered as a plain sibling that nothing ever wraps, and the
   * Lenis setup sits *beside* them instead of around them.
   *
   * This used to be `if (disableSmooth) return <>{children}</>` above a
   * `<ReactLenis>{children}</ReactLenis>`. The two branches produce identical
   * DOM -- with `root`, ReactLenis renders a context provider and no elements
   * of its own -- but they are different element *types* at the same position
   * in the tree. So the instant the effect above flipped `disableSmooth`, React
   * unmounted the entire page and mounted it again from scratch. Every <img>
   * below was destroyed and re-created, and the browser refetched all of them:
   * that is why the hero appeared to load twice, on phones and for
   * reduced-motion users, the two audiences that flip the flag.
   *
   * Holding `children` at a fixed position makes the flip a no-op for the page:
   * only the Lenis instance is created or torn down.
   */
  return (
    <>
      {disableSmooth ? null : (
        <>
          {/* Deliberately childless. With `root`, ReactLenis publishes the
              instance to Lenis's own global store, so ScrollReset still reaches
              it via useLenis() without having to be a descendant. */}
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
          />
          <ScrollReset />
        </>
      )}
      {children}
    </>
  );
}

