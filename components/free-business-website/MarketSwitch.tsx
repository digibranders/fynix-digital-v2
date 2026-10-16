"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { type ReactElement, useState, useSyncExternalStore } from "react";
import { isUsTimeZone } from "@/lib/free-business-website";

const noSubscription = (): (() => void) => () => {};
const browserTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;
const serverTimeZone = (): string => "";

/**
 * A note pointing a US visitor from the India page to the US page. It never redirects: the visitor, and every search
 * engine crawler, can still read the page they asked for. The browser's own clock decides who sees it, so the page stays
 * static and the server renders nothing for it. It is fixed to the foot of the screen, so it moves nothing when it
 * appears after load.
 */
export default function MarketSwitch({
  href,
  label,
  cta,
}: {
  readonly href: string;
  readonly label: string;
  readonly cta: string;
}): ReactElement | null {
  const timeZone = useSyncExternalStore(noSubscription, browserTimeZone, serverTimeZone);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !isUsTimeZone(timeZone)) return null;

  return (
    <aside
      aria-label="Pricing for the US"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-primary sm:rounded-full py-2 pr-2 pl-5 text-sm text-white shadow-[0_18px_40px_-16px_rgba(12,30,46,0.55)] ring-1 ring-white/10"
    >
      <p className="min-w-0 flex-1 leading-snug text-white/80">{label}</p>
      <Link
        href={href}
        className="shrink-0 rounded-full bg-white px-4 py-2 font-medium text-primary transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {cta}
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X aria-hidden className="size-4" strokeWidth={2} />
      </button>
    </aside>
  );
}
