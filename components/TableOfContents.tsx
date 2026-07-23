"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

type Props = {
  items: TocItem[];
  className?: string;
};

export default function TableOfContents({ items, className = "" }: Props) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Table of contents" className={className}>
      <span className="text-xs font-mono uppercase tracking-widest text-text-muted font-semibold block mb-6">
        Contents
      </span>
      <ol className="space-y-3">
        {items.map((item, idx) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`flex items-baseline gap-3 group text-sm transition-colors ${
                  isActive ? "text-primary" : "text-text-muted hover:text-primary"
                }`}
              >
                <span
                  className={`text-[11px] font-mono tabular-nums shrink-0 w-6 transition-colors ${
                    isActive ? "text-accent" : "text-text-muted/50 group-hover:text-text-muted"
                  }`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  className={`leading-snug transition-all ${
                    isActive
                      ? "font-medium border-l-2 border-accent pl-3 -ml-3"
                      : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
