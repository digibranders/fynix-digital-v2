"use client";

import React from "react";
import { getImageProps } from "next/image";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRight, CalendarDays } from "lucide-react";
import { usePricing } from "../PricingProvider";
import { WORKSHOP } from "../workshopDetails";

/**
 * Art direction for the hero portrait.
 *
 * The phone crop and the desktop stage shot are genuinely different images, and
 * they used to be two <Image>s toggled with `md:hidden` / `hidden md:block`.
 * CSS visibility does not stop a download: both stayed in the DOM and, because
 * both were `priority`, Next emitted a `<link rel="preload" as="image">` for
 * each with no `media` attribute. The preload scanner fetched both before any
 * CSS applied, so every visitor paid for the image they could not see on top of
 * the one they could -- 37KB of dead weight on a phone, and the phone crop
 * requested at w=1920 on desktop.
 *
 * `getImageProps` gives us the optimizer's srcSet without rendering an element,
 * so the choice can move into `<picture><source media>`, where the preload
 * scanner resolves the media query itself and fetches exactly one image.
 */
const HERO_ALT = "Pavel Klimakov presenting on stage at SEO Vibes Summit";

// Matches the `md` breakpoint the two crops were previously switched on.
// Stated in `rem`, not `px`, because that is what Tailwind v4 emits: the
// `md:object-[center_22%]` / `md:scale-105` framing below is inside
// `@media (min-width:48rem)`. The two are only equal at a 16px root font size,
// so a visitor who has raised their browser's default font size would otherwise
// get the desktop crop from this <source> while the framing classes that go
// with it had not applied yet.
const HERO_DESKTOP_MEDIA = "(min-width: 48rem)";
const HERO_DESKTOP_SIZES = "(min-width: 1024px) 45vw, 100vw";

const {
  props: { srcSet: heroDesktopSrcSet },
} = getImageProps({
  alt: HERO_ALT,
  fill: true,
  priority: true,
  quality: 90,
  sizes: HERO_DESKTOP_SIZES,
  src: "/pavel/pavel-seo-vibes-summit-2025.webp",
});

// The phone crop also supplies the <img> fallback, so it keeps the prop set
// that `fill` produces (src, srcSet, sizes, style, decoding).
//
// `priority` is passed for its non-lazy semantics, but note it does NOT survive
// getImageProps the way it does on <Image>: no `fetchpriority` attribute is
// returned and no preload link is emitted, because getImageProps is a pure
// function with no way to reach the document head. The LCP hint is therefore
// set explicitly on the element below.
const { props: heroMobileProps } = getImageProps({
  alt: HERO_ALT,
  fill: true,
  priority: true,
  sizes: "100vw",
  src: "/pavel/new_hero_mobile.webp",
});

export const Hero: React.FC = () => {
  const { price, schedule, registration } = usePricing();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative pt-28 pb-20 md:pt-36 md:pb-24 bg-black text-white overflow-hidden"
    >
      {/* Ambient background blur accent */}
      <div
        aria-hidden
        className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #b1786c 0%, transparent 70%)" }}
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center lg:items-stretch">
          {/* LEFT: Text Column — on desktop it fills the image height so the
              eyebrow sits at the top (level with Pavel's head) and the CTAs drop
              to the bottom (level with the "Pavel Klimakov" label). */}
          <div className="hero-rise order-2 lg:order-1 lg:col-span-7 flex flex-col gap-8 lg:gap-0 lg:justify-between lg:pb-6">
            <div className="space-y-8 lg:mt-12
            ">
            {/* Eyebrow — date · time range · platform. Desktop only; on mobile
                the sticky banner already carries the date + time. */}
            <div className="hidden lg:flex flex-wrap items-center gap-x-5 gap-y-1 text-[13.5px] font-medium tracking-[-0.005em] text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  className="h-[13px] w-[13px] shrink-0 text-[#E8B087]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                {schedule.dateLabel}
              </span>
              <span>{schedule.timeRange}</span>
              <span className="text-white/60">Live on {WORKSHOP.platform}</span>
            </div>

            <h1 className="text-[2.4rem] leading-[1.04] sm:text-[3.25rem] sm:leading-[1.02] lg:text-[3.85rem] lg:leading-[1.02] font-medium tracking-[-0.028em] text-white">
              Semantic SEO
              <br />
              <span className="font-serif italic font-normal text-[#E8B087]">
                from confusion to clarity.
              </span>
            </h1>

            {/* <p className="text-[18px] text-white/90 leading-[1.5] font-normal max-w-[560px]">
              What you hear about Semantic SEO is just 15% of the story.
            </p> */}

            <div className="space-y-2 max-w-[560px]">
              <p className="text-[17.6px] text-white/85 leading-[1.5] font-normal">
                Taught by someone who&rsquo;s already earned the results you
                want.
              </p>
              <p className="text-[13.5px] text-white/60 leading-[1.5] font-normal">
                3 Hours Masterclass to Decode the Concepts, <br />Connect the
                Dots &amp; Get Certified
              </p>
            </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button size="lg" variant="primary" onClick={() => scrollTo("pricing")}>
                {registration.open
                  ? `Reserve my seat, ${price.display}`
                  : "Registrations closed"}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("curriculum")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/15"
              >
                See the curriculum
              </Button>
            </div>
          </div>

          {/* RIGHT: Image 1 with Seamless Transition into Pure Black (No Borders) */}
          <div className="hero-rise-delayed order-1 lg:order-2 lg:col-span-5">
            {/* The phone-sized height is measured in `svh`, not `dvh`, and that
                choice is load-bearing. `dvh` tracks the *current* viewport, which
                mobile Chrome and Safari grow the moment their address bar and
                bottom toolbar retract on the first scroll. That re-ran this
                calc mid-scroll, the box grew until `max-h` caught it, and every
                section below the hero jumped down with it. `svh` is resolved
                against the viewport with the browser chrome fully shown, so it
                is a constant for the life of the page: the hero renders exactly
                as it did under `dvh` at load, then stops moving. */}
            <div className="relative mx-auto max-w-[460px] lg:max-w-none h-[calc(100svh-16rem)] max-h-[560px] min-h-[320px] sm:h-[480px] sm:max-h-none sm:min-h-0 lg:h-[540px] w-full overflow-hidden">
              {/* One element, one download. The <source> carries the desktop
                  stage shot; the <img> falls back to the phone crop (a cleaner
                  framing with no "Refine the…" strip up top). The per-crop
                  framing that used to live on two separate elements is now
                  breakpoint-scoped on the single <img>, switching at the same
                  `md` boundary as the <source> above it. */}
              <picture>
                <source
                  media={HERO_DESKTOP_MEDIA}
                  srcSet={heroDesktopSrcSet}
                  sizes={HERO_DESKTOP_SIZES}
                />
                <img
                  {...heroMobileProps}
                  alt={HERO_ALT}
                  // This is the LCP element on every viewport. Set explicitly
                  // because `priority` above cannot emit it through
                  // getImageProps; without it the hero competes at the default
                  // image priority.
                  fetchPriority="high"
                  className="object-cover object-top md:object-[center_22%] md:scale-105"
                />
              </picture>

              {/* Edges blend into the black background — bottom, left, and a
                  small top fade so the busy screen strip up top goes to black. */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, #000000 0%, transparent 40%), linear-gradient(to right, #000000 0%, transparent 20%)",
                }}
              />

              {/* Fade scrim across the bottom so the name + LinkedIn badge stay
                  legible over busy areas of the photo. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/55 to-transparent"
              />

              {/* Instructor Name Label — flush to the photo's left edge on
                  stacked layouts so it aligns with the hero headline; inset on
                  desktop where the photo sits in its own column. */}
              <div className="absolute left-0 lg:left-6 bottom-6 z-10 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8B087]">
                  Instructor
                </p>
                <p className="mt-1 text-[1.75rem] leading-[1.05] font-semibold text-white tracking-[-0.02em]">
                  Pavel Klimakov
                </p>
                <p className="mt-2 max-w-[300px] text-[15px] italic leading-[1.4] text-white/75">
                  &ldquo;What you hear about Semantic SEO
                  <br />
                  is just 15% of the story.&rdquo;
                </p>
              </div>

              {/* LinkedIn badge, bottom-right */}
              <a
                href="https://www.linkedin.com/in/pavel-klimakov/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pavel Klimakov on LinkedIn (opens in a new tab)"
                className="absolute right-6 bottom-6 z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-[0_2px_10px_rgba(10,102,194,0.45)] transition-colors hover:bg-[#004182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
