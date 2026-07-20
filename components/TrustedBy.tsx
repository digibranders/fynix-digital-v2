"use client";

import { useState } from "react";
import { clients } from "@/lib/content";
import Reveal from "./Reveal";

// Duplicate for seamless -50% translate loop.
const loop = [...clients, ...clients];

export default function TrustedBy() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      aria-labelledby="trusted-by-heading"
      className="pt-20 md:pt-28 pb-16 md:pb-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Editorial header */}
        <Reveal>
          <div className="border-b border-border pb-8 mb-12 md:mb-16">
            <h2
              id="trusted-by-heading"
              className="font-serif text-3xl md:text-5xl text-primary font-normal leading-tight"
            >
              Trusted by Global Brands
            </h2>
          </div>
        </Reveal>

        {/* Function-style single-row marquee - 48s, floating logos, no cards. */}
        <Reveal delay={80}>
          <div
            className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]"
            role="list"
            aria-label="Client logos"
          >
            <div
              className={`flex items-center gap-14 md:gap-20 w-max animate-[marqueeScroll_76s_linear_infinite] motion-reduce:animate-none group-hover:[animation-play-state:paused] ${
                paused ? "[animation-play-state:paused]" : ""
              }`}
            >
              {loop.map((client, i) => (
                <div
                  key={`${client.name}-${i}`}
                  role="listitem"
                  aria-hidden={i >= clients.length}
                  className="shrink-0 flex items-center justify-center"
                  title={i < clients.length ? client.name : undefined}
                >
                  {/* Plain <img> - natural aspect per logo, so fixed `gap` on
                      the parent produces truly equal spacing between logo edges. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={client.logo}
                    alt={i < clients.length ? client.name : ""}
                    loading="lazy"
                    decoding="async"
                    className="max-h-8 md:max-h-10 max-w-[140px] md:max-w-[160px] w-auto h-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-[filter,opacity] duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pause / play toggle - Function-style caption underneath */}
          <div className="mt-10 md:mt-12 motion-reduce:hidden">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? "Play logo marquee motion" : "Pause logo marquee motion"}
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-[10px] h-[10px] shrink-0"
              >
                {paused ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M2 1v8l7-4z" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <rect x="1.5" y="1" width="2.5" height="8" />
                    <rect x="6" y="1" width="2.5" height="8" />
                  </svg>
                )}
              </span>
              {paused ? "Play motion" : "Pause motion"}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
