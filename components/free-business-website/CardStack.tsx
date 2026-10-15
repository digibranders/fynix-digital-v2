"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A stack of cards that stick under the site header (each child marked `data-stack-item`), the next sliding over the last.
 * Left to the browser, each sticky card lets go of the page as soon as its own bottom meets the end of the stack, so a tall
 * first card leaves before a shorter later one. Here the stack's box is made far taller than its content, so the browser
 * never lets go, and the whole stack is moved up together instead, from the moment the last card has settled until the
 * end of the stack scrolls past: the cards leave as one block.
 */
/** How far inside the covering card's bottom edge an earlier card is cut off, so its square corners never show behind the rounded ones. */
const COVER_INSET = 14;

export default function CardStack({ children, className }: { readonly children: ReactNode; readonly className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-stack-item]"));
    const end = root.querySelector<HTMLElement>("[data-stack-end]");
    const last = items[items.length - 1];
    if (end === null || last === undefined) return;

    let frame = 0;
    const update = (): void => {
      frame = 0;
      // Where the last card sits once settled: its sticky top plus its own height.
      const settledBottom = parseFloat(getComputedStyle(last).top) + last.offsetHeight;
      const lift = Math.min(0, end.getBoundingClientRect().top - settledBottom);
      for (const item of items) item.style.transform = lift === 0 ? "" : `translate3d(0, ${lift}px, 0)`;

      // A card that is taller than the one over it would show its lower part below that card. Cut it off just inside the
      // covering card's bottom edge, only while it is actually covered (not in the normal flow before the stack forms).
      for (let i = 0; i < items.length - 1; i += 1) {
        const behind = items[i].getBoundingClientRect();
        const cover = items[i + 1].getBoundingClientRect();
        const coverEdge = cover.bottom - COVER_INSET;
        const covered = cover.top < behind.bottom - COVER_INSET && behind.bottom > coverEdge;
        items[i].style.clipPath = covered ? `inset(-48px -48px ${behind.bottom - coverEdge}px -48px)` : "";
      }
    };
    const schedule = (): void => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
      <div data-stack-end aria-hidden />
      {/* Room below the last card so the browser keeps every card stuck; the negative margin on the stack takes it back. */}
      <div aria-hidden className="pointer-events-none h-[120vh]" />
    </div>
  );
}
