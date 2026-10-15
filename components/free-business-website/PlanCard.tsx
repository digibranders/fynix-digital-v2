import type { ReactElement } from "react";
import PlanIcon from "@/components/free-business-website/PlanIcon";
import type { CompareCard, CompareColumn } from "@/lib/free-business-website";

/** A column's head mark: a numbered circle, or a product's own mark in a soft circle. */
function Lead({ lead }: { readonly lead: NonNullable<CompareColumn["lead"]> }): ReactElement {
  return (
    <span aria-hidden className="grid size-9 shrink-0 place-items-center text-accent-strong">
      {"number" in lead ? <span className="font-serif text-3xl leading-none font-medium">{lead.number}</span> : <PlanIcon name={lead.icon} />}
    </span>
  );
}

/**
 * The plan, or one add-on, as a card: a dark header with its name and price, an optional line about it, columns of
 * what it includes (a rule between them from tablet width, stacked on a phone) and, at the foot, what costs extra.
 */
export default function PlanCard({ card, priceLine }: { readonly card: CompareCard; readonly priceLine: string }): ReactElement {
  const columnCount = card.columns.length;
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_36px_-28px_rgba(12,30,46,0.35)]">
      {/* Two lines on a phone: the tag and the name, then the price. One row from tablet width. */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-3 bg-primary px-5 py-4 text-white sm:gap-x-4 sm:px-8 sm:py-5">
        <span className="rounded-full bg-white/15 px-2.5 py-1.5 text-[10px] font-semibold tracking-widest uppercase sm:px-3 sm:text-[11px]">{card.tag}</span>
        <h3 className="min-w-0 flex-1 font-serif text-base leading-tight font-medium sm:flex-none sm:text-3xl">{card.name}</h3>
        <p className="flex basis-full items-baseline gap-2.5 sm:ml-auto sm:basis-auto">
          <span className="font-serif text-3xl leading-none font-medium tabular-nums sm:text-4xl">{card.price}</span>
          <span className="text-xs text-white/70 sm:text-sm">{priceLine}</span>
        </p>
      </header>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {card.intro ? <p className="mb-7 text-base leading-relaxed text-foreground md:text-[clamp(14px,1.55vw,18px)]">{card.intro}</p> : null}

        <div className={`grid gap-y-8 md:gap-y-0 ${columnCount > 1 ? "md:grid-cols-2 md:divide-x md:divide-border" : ""}`}>
          {card.columns.map((column, index) => (
            <div key={column.title ?? index} className={columnCount > 1 ? "md:px-8 md:first:pl-0 md:last:pr-0" : ""}>
              {column.title || column.lead ? (
                <div>
                  <div className="flex items-center gap-4">
                    {column.lead ? <Lead lead={column.lead} /> : null}
                    {column.title ? (
                      <h4 className={`font-serif text-xl leading-snug font-medium text-primary sm:text-2xl ${column.subtitle ? "whitespace-nowrap" : ""}`}>
                        {column.title}
                      </h4>
                    ) : null}
                  </div>
                  {column.subtitle ? <p className="mt-2 text-[15px] leading-snug text-text-muted sm:text-base">{column.subtitle}</p> : null}
                </div>
              ) : null}
              <ul className={`grid gap-3.5 ${column.title || column.lead ? "mt-6 sm:pl-4" : ""}`}>
                {column.items.map((item) => (
                  <li key={item.label} className="flex items-center gap-4">
                    <span aria-hidden className="grid size-8 shrink-0 place-items-center">
                      <PlanIcon name={item.icon} tone="accent" />
                    </span>
                    <span className="text-base leading-snug text-foreground">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {card.extra ? (
          <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-background-soft px-4 py-3.5 text-base font-medium text-primary sm:px-5">
            <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase">Extra</span>
            {card.extra}
          </p>
        ) : null}
      </div>
    </article>
  );
}
