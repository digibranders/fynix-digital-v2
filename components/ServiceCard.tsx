import Link from "next/link";
import type { Act } from "@/lib/content";

const themes: Record<Act["slug"], string> = {
  "ui-ux": "01 / BRAND",
  development: "02 / CODE",
  seo: "03 / REACH",
  "lead-generation": "04 / REVENUE",
};

type Props = { act: Act };

export default function ServiceCard({ act }: Props) {
  return (
    <div className="p-8 border border-border rounded-lg bg-background-soft/30 hover:bg-background-soft transition-all duration-300 flex flex-col justify-between">
      <div>
        <span className="text-xs font-mono text-accent font-semibold block mb-4">
          {themes[act.slug]}
        </span>
        <h3 className="font-serif text-xl text-primary font-semibold mb-6">{act.title}</h3>
        <ul className="space-y-3 text-sm text-text-muted font-normal">
          {act.deliverables.slice(0, 5).map((item) => (
            <li key={item.title} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent/60" aria-hidden />
              {item.title}
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={`/services/${act.slug}`}
        className="text-xs uppercase font-semibold text-accent tracking-widest mt-8 inline-flex items-center gap-2"
      >
        Explore {act.title} <span aria-hidden className="text-lg">&rarr;</span>
      </Link>
    </div>
  );
}
