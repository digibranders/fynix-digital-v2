import Link from "next/link";
import type { CaseStudy } from "@/lib/content";
import DossierTile from "@/components/DossierTile";

type Props = { study: CaseStudy; index?: number };

export default function CaseStudyCard({ study, index }: Props) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      className="group flex flex-col h-full bg-white border border-border rounded-lg overflow-hidden hover:shadow-sm hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <DossierTile
          domain={study.domain}
          name={study.name}
          iconUrl={study.iconUrl}
          index={index}
          size="lg"
          showName
        />
      </div>

      <div className="flex flex-col flex-1 p-6 md:p-7">
        <h3 className="font-serif text-2xl text-primary font-normal group-hover:text-accent transition-colors">
          {study.name}
        </h3>
        <span className="mt-2 text-xs font-mono text-text-muted group-hover:text-accent transition-colors">
          {study.domain}
        </span>

        <div className="mt-auto pt-6 flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {study.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          <span
            aria-hidden
            className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-accent whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            Read
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
