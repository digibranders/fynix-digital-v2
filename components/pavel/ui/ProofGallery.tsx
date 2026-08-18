"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Chart = {
  src: string;
  /** Intrinsic pixel size, required by next/image and used to size the lightbox. */
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Tailwind object-position kept in frame after object-cover crops the tile. */
  position: string;
  /** Placement classes: mobile height + the desktop 12-col bento slot. */
  layout: string;
};

const CHARTS: Chart[] = [
  {
    src: "/pavel/gsc4.webp",
    width: 353,
    height: 666,
    alt: "Google Search Console: 158K clicks and 21.5M impressions over 16 months",
    caption: "Client site · 158K clicks / 21.5M impressions",
    position: "object-[50%_22%]",
    layout:
      "h-[420px] lg:h-full lg:col-start-1 lg:col-span-3 lg:row-start-1 lg:row-span-2",
  },
  {
    src: "/pavel/gsc1.webp",
    width: 1280,
    height: 568,
    alt: "Google Search Console: 15.7K clicks and 5.36M impressions over 16 months",
    caption: "Client site · 15.7K clicks / 5.36M impressions",
    position: "object-top",
    layout: "h-[210px] lg:h-full lg:col-start-4 lg:col-span-6 lg:row-start-1",
  },
  {
    src: "/pavel/gsc2.webp",
    width: 928,
    height: 340,
    alt: "Google Search Console: 29.5K clicks and 4.05M impressions",
    caption: "Client site · 29.5K clicks / 4.05M impressions",
    position: "object-left-top",
    layout: "h-[210px] lg:h-full lg:col-start-4 lg:col-span-6 lg:row-start-2",
  },
  {
    src: "/pavel/gsc3.webp",
    width: 348,
    height: 667,
    alt: "Google Search Console: 2.07K clicks and 877K impressions",
    caption: "Client site · 2.07K clicks / 877K impressions",
    position: "object-[50%_22%]",
    layout:
      "h-[420px] lg:h-full lg:col-start-10 lg:col-span-3 lg:row-start-1 lg:row-span-2",
  },
];

export const ProofGallery: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () =>
      setOpenIndex((i) => (i === null ? i : (i - 1 + CHARTS.length) % CHARTS.length)),
    [],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % CHARTS.length)),
    [],
  );

  // Keyboard controls + scroll lock while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, prev, next]);

  const active = openIndex !== null ? CHARTS[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:auto-rows-[210px] lg:grid-cols-12">
        {CHARTS.map((chart, i) => (
          <button
            key={chart.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`Enlarge chart: ${chart.caption}`}
            className={`group relative cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(15,14,12,0.05),0_20px_40px_-28px_rgba(15,14,12,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${chart.layout}`}
          >
            <Image
              src={chart.src}
              alt={chart.alt}
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-[1.02] ${chart.position}`}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
            />
            <span className="absolute inset-x-4 bottom-3 text-left text-[12px] font-normal italic tracking-tight text-white/90">
              {chart.caption}
            </span>
          </button>
        ))}
      </div>

      {isOpen && active
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Search Console results"
              onClick={close}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                className="absolute left-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
              </button>

              <figure
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-full max-w-[min(1100px,92vw)] flex-col items-center"
              >
                <Image
                  src={active.src}
                  alt={active.alt}
                  width={active.width}
                  height={active.height}
                  sizes="92vw"
                  className="h-auto max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
                />
                <figcaption className="mt-4 text-center text-[13px] font-normal text-white/80">
                  {active.caption}
                  <span className="ml-2 tabular-nums text-white/50">
                    {openIndex + 1} / {CHARTS.length}
                  </span>
                </figcaption>
              </figure>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="absolute right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
