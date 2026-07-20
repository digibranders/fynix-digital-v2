"use client";

import { useMemo, useState } from "react";
import CaseStudyCard from "@/components/CaseStudyCard";
import Reveal from "@/components/Reveal";
import {
  caseStudies,
  caseStudyCategories,
  type CaseStudyCategory,
} from "@/lib/content";

export default function CaseStudiesGrid() {
  const [active, setActive] = useState<CaseStudyCategory>("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? caseStudies
        : caseStudies.filter((s) => s.tags.includes(active)),
    [active],
  );

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter case studies"
        className="flex flex-wrap gap-2 mb-12"
      >
        {caseStudyCategories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(cat)}
              className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-medium font-mono uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-text-muted border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((study, idx) => (
          <Reveal key={study.slug} delay={idx * 100} className="h-full">
            <CaseStudyCard study={study} index={idx + 1} />
          </Reveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted text-sm font-light py-12">
          No projects in this category yet.
        </p>
      )}
    </>
  );
}
