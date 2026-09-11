"use client";

import { useEffect, useRef } from "react";

/**
 * The footer signature: the wordmark at container width in a band pinned to
 * the viewport bottom (`.footer-signature`, sticky) underneath the opaque
 * footer body. The body is the curtain: as its bottom edge lifts off the
 * viewport bottom, the wordmark is revealed beneath it, drifting up at half
 * the scroll speed until it settles into normal flow at the end of the page.
 *
 * Progress is the fraction of the band's height exposed below the body:
 * `(viewport height - body bottom) / band height`, clamped to 0..1, on a
 * rAF-throttled scroll listener. Lenis (the site's smooth-scroll library)
 * dispatches real `scroll` events and keeps native `window.scrollY`, so this
 * needs no special-casing for it. No easing beyond that: the wordmark tracks
 * scroll position exactly.
 */
export default function FooterSignature() {
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const curtain = band.previousElementSibling;
    if (!(curtain instanceof HTMLElement)) return;

    let pending = false;

    const update = () => {
      const exposed = window.innerHeight - curtain.getBoundingClientRect().bottom;
      const progress = Math.min(1, Math.max(0, exposed / band.offsetHeight));
      band.style.setProperty("--footer-signature-progress", progress.toFixed(4));
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        update();
        pending = false;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      band.style.removeProperty("--footer-signature-progress");
    };
  }, []);

  return (
    <div ref={bandRef} className="footer-signature" aria-hidden>
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        {/* The wordmark image is applied as a mask so the shape can carry a
            vertical fade (see `.footer-wordmark` in globals.css). */}
        <div className="footer-wordmark" />
      </div>
    </div>
  );
}
