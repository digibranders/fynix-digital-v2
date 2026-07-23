"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string;
  duration?: number;
  className?: string;
};

type Parsed = {
  prefix: string;
  number: number;
  suffix: string;
  decimals: number;
  hasCommas: boolean;
};

function parse(input: string): Parsed | null {
  if (typeof input !== "string" || input.length === 0) return null;
  const match = input.match(/^([^\d-]*?)(-?[\d,.]+)(.*)$/);
  if (!match) return null;
  const rawNumStr = match[2];
  const hasCommas = rawNumStr.includes(",");
  const cleanNumStr = rawNumStr.replace(/,/g, "");
  const number = parseFloat(cleanNumStr);
  if (Number.isNaN(number)) return null;
  const decimals = cleanNumStr.includes(".") ? cleanNumStr.split(".")[1].length : 0;
  return { prefix: match[1], number, suffix: match[3], decimals, hasCommas };
}

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

const format = (p: Parsed, n: number) => {
  const formattedNum = p.hasCommas
    ? Math.round(n).toLocaleString("en-US")
    : n.toFixed(p.decimals);
  return `${p.prefix}${formattedNum}${p.suffix}`;
};

export default function CountUp({ value, duration = 1600, className = "" }: Props) {
  const parsed = useMemo(() => parse(value), [value]);
  const finalDisplay = useMemo(
    () => (parsed ? format(parsed, parsed.number) : value),
    [parsed, value],
  );

  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() =>
    parsed ? format(parsed, 0) : value,
  );

  useEffect(() => {
    if (!parsed) return;
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveDuration = reduced ? 0 : duration;

    let rafId = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();

          if (effectiveDuration === 0) {
            setDisplay(finalDisplay);
            return;
          }

          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / effectiveDuration, 1);
            const current = parsed.number * easeOutQuint(t);
            setDisplay(format(parsed, current));
            if (t < 1) rafId = requestAnimationFrame(tick);
            else setDisplay(finalDisplay);
          };
          rafId = requestAnimationFrame(tick);
          return;
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [parsed, duration, finalDisplay]);

  return (
    <span ref={ref} className={className} aria-label={finalDisplay}>
      {display}
    </span>
  );
}
