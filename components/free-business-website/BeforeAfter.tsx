"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  /** The finished website, behind the "no website" page. */
  image: { src: string; width: number; height: number; alt: string };
  host: string;
};

/**
 * A browser window holding a finished website, with a plain "No website yet" page laid over its right side and a
 * handle to drag between the two. It explains the offer in one picture: what a business has without a website and
 * what it has with one. The visitor moves the divider by touch, mouse or arrow keys; underneath it is a real range
 * input, so a screen reader and a keyboard understand it without any script.
 */
export default function BeforeAfter({ image, host }: Props) {
  // Half and half to begin with, so both the site and what it replaces show at once.
  const [position, setPosition] = useState(50);
  const [touched, setTouched] = useState(false);
  // Only the label of the side that is mostly showing: the Fynix site once it covers half or more, the empty page below that.
  const showsFynix = position >= 50;

  return (
    <figure className="overflow-hidden rounded-xl border border-white/15 bg-[#07131d] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/25" />
          <span className="size-2.5 rounded-full bg-white/25" />
          <span className="size-2.5 rounded-full bg-white/25" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-white/10 px-3 py-1 text-center text-xs text-white/70">
          {host}
        </span>
      </div>

      <div className="relative isolate aspect-[16/10] select-none">
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          priority
          sizes="(min-width: 1024px) 42vw, 100vw"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />

        {/* "No website yet" lies over it, uncovered from the left as the divider moves right. */}
        <div aria-hidden className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <div className="grid h-full w-full place-items-center bg-[#E9E6DF] px-6 text-center text-primary">
            <div className="grid max-w-xs gap-3">
              <span
                aria-hidden
                className="mx-auto grid size-12 place-items-center rounded-full border-2 border-primary/40 font-serif text-2xl font-medium text-primary/60"
              >
                ?
              </span>
              <p className="font-serif text-2xl leading-tight font-medium sm:text-3xl">No website yet.</p>
              <p className="text-sm leading-snug text-text-muted sm:text-base">
                Customers search, find nothing to trust, and call someone else.
              </p>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className={`pointer-events-none absolute right-3 top-3 rounded-full bg-primary/90 px-3 py-1.5 font-mono text-[11px] font-medium tracking-widest text-white uppercase transition-opacity duration-300 ${showsFynix ? "opacity-0" : "opacity-100"}`}
        >
          <span className="sm:hidden">Before</span>
          <span className="max-sm:hidden">Without a website</span>
        </p>
        <p
          aria-hidden
          className={`pointer-events-none absolute left-3 top-3 rounded-full bg-accent px-3 py-1.5 font-mono text-[11px] font-medium tracking-widest text-primary uppercase transition-opacity duration-300 ${showsFynix ? "opacity-100" : "opacity-0"}`}
        >
          <span className="sm:hidden">After</span>
          <span className="max-sm:hidden">With Fynix</span>
        </p>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)]"
          style={{ left: `${position}%` }}
        >
          <span
            className={`absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-primary shadow-xl ${touched ? "" : "animate-pulse"}`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </span>
        </div>

        <p
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-primary/85 px-4 py-2 font-mono text-[11px] font-medium tracking-widest text-white uppercase transition-opacity duration-300 ${touched ? "opacity-0" : "opacity-100"}`}
        >
          Drag to compare
        </p>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          aria-label="Drag to compare a business with no website and one with a Fynix website"
          onChange={(event) => {
            setPosition(Number(event.target.value));
            setTouched(true);
          }}
          style={{ touchAction: "pan-y" }}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </figure>
  );
}
