"use client";

import { useEffect, useRef, useState } from "react";
import type { FaqCategory } from "@/lib/content";
import { emphasize } from "@/lib/emphasize";

type Props = { categories: FaqCategory[] };

/**
 * FAQ hub with a sticky "Jump To" sidebar (category navigation with scroll-spy)
 * and category-grouped accordions. Client component: active-section tracking
 * and the accordions need browser state.
 */
export default function FaqHub({ categories }: Props) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll-spy: highlight whichever category is currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
    );
    categories.forEach((c) => {
      const el = sectionRefs.current[c.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  const jumpTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      {/* Sidebar */}
      <aside className="lg:col-span-4">
        <nav className="lg:sticky lg:top-28">
          <div className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">
            Jump To
          </div>
          <ul className="flex flex-col">
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => jumpTo(c.id)}
                  className={`w-full text-left py-2 text-[15px] transition-colors ${
                    activeId === c.id
                      ? "text-accent font-medium"
                      : "text-primary/80 hover:text-accent"
                  }`}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Content */}
      <div className="lg:col-span-8">
        {categories.map((cat) => (
          <section
            key={cat.id}
            id={cat.id}
            ref={(el) => {
              sectionRefs.current[cat.id] = el;
            }}
            className="scroll-mt-28 mb-14 last:mb-0"
          >
            <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium mb-4">
              {cat.label}
            </h2>
            <div className="border-t border-border">
              {cat.items.map((faq, idx) => {
                const key = `${cat.id}-${idx}`;
                const isOpen = openKey === key;
                return (
                  <div key={faq.q} className="border-b border-border">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      className="w-full py-5 flex items-start justify-between gap-6 text-left group"
                    >
                      <span className="font-serif text-lg text-primary group-hover:text-accent font-medium transition-colors">
                        {faq.q}
                      </span>
                      <span
                        aria-hidden
                        className={`mt-1 shrink-0 text-accent transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v14M5 12h14"
                          />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-[500px] opacity-100 pb-5" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-sm md:text-base text-text-muted font-normal leading-relaxed max-w-2xl">
                        {emphasize(faq.a)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
