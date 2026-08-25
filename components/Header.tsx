"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useLenis } from "lenis/react";
import { acts, nav, siteConfig } from "@/lib/content";
import Logo from "@/components/Logo";

const HEADER_HEIGHT = 80;
const MEGA_ITEM_STAGGER = 70;
const SCROLL_THRESHOLD = 12;

export default function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();

  const handleSamePageNav =
    (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (pathname !== href) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    };

  const closeMegaNow = () => {
    setMegaOpen(false);
  };

  // Smooth-scroll to the home-page Technical SEO Audit section.
  const scrollToAudit = useCallback(() => {
    const target = document.getElementById("technical-seo-audit");
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -HEADER_HEIGHT });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, [lenis]);

  // When the audit link is tapped from the mobile menu, the scroll has to wait
  // until the menu closes: the open menu locks the page with `overflow: hidden`
  // on <body>, which clamps any scroll to 0. This ref defers the scroll until
  // that lock is released (see the effect below).
  const pendingAuditScroll = useRef(false);

  // The "Technical SEO" mega-menu item points at the home-page audit section.
  // On the home page we smooth-scroll to it; elsewhere we let the link route to
  // "/#technical-seo-audit" and the browser jumps to the anchor on load.
  const handleAuditNav = (e: MouseEvent<HTMLAnchorElement>) => {
    setMegaOpen(false);
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      setMenuOpen(false);
      return;
    }
    if (pathname !== "/") {
      // Let the Link route to "/#technical-seo-audit"; the anchor resolves on load.
      setMenuOpen(false);
      return;
    }
    e.preventDefault();
    if (menuOpen) {
      // Defer until the mobile menu's body-scroll lock is released.
      pendingAuditScroll.current = true;
      setMenuOpen(false);
    } else {
      scrollToAudit();
    }
  };

  // Runs after the mobile menu closes: React flushes every effect cleanup
  // (which restores <body> overflow) before this setup runs, so the scroll now
  // lands on the audit section instead of being clamped.
  useEffect(() => {
    if (menuOpen || !pendingAuditScroll.current) return;
    pendingAuditScroll.current = false;
    scrollToAudit();
  }, [menuOpen, scrollToAudit]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  // Reset the mega menu when the route changes. Adjusting state during render
  // (React's recommended pattern) avoids a setState-in-effect cascade.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMegaOpen(false);
  }

  const darkSectionsRef = useRef<HTMLElement[]>([]);
  const heroHeadingRef = useRef<HTMLElement | null>(null);

  const applyScrollState = useCallback((y: number) => {
    // The navbar only shrinks once the hero's first heading has scrolled up to
    // touch the bottom edge of the navbar — not on the very first pixel of
    // scroll. Falls back to a small threshold on pages with no hero heading.
    const heading = heroHeadingRef.current;
    setScrolled(
      heading
        ? heading.getBoundingClientRect().top <= HEADER_HEIGHT
        : y > SCROLL_THRESHOLD,
    );
    const sections = darkSectionsRef.current;
    if (sections.length === 0) {
      setTheme("light");
      return;
    }
    const overDark = sections.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top < HEADER_HEIGHT && r.bottom > 0;
    });
    setTheme(overDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    darkSectionsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>('[data-nav-theme="dark"]'),
    );
    // The hero's first heading is the shrink trigger for this page.
    heroHeadingRef.current = document.querySelector<HTMLElement>("main h1");

    if (darkSectionsRef.current.length === 0) {
      const frame = requestAnimationFrame(() => applyScrollState(window.scrollY));
      return () => cancelAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      () => applyScrollState(window.scrollY),
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px`, threshold: [0, 1] },
    );
    darkSectionsRef.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname, applyScrollState]);

  useLenis((lenis) => {
    applyScrollState(lenis.scroll);
  });

  useEffect(() => {
    let ticking = false;
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        applyScrollState(window.scrollY);
      });
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [applyScrollState]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isDark = theme === "dark" && !menuOpen;
  const pillActive = (scrolled || megaOpen) && !menuOpen;

  return (
    <>
      <header
        data-theme={theme}
        className="sticky top-0 z-50 pt-2 md:pt-3"
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-3 md:h-4 backdrop-blur-3xl transition-[opacity,background-color] duration-[1584ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            pillActive
              ? isDark
                ? "bg-primary/40 opacity-100"
                : "bg-white/50 opacity-100"
              : "opacity-0"
          }`}
        />
        <div
          className={`mx-auto transition-[max-width,padding-left,padding-right] duration-[1584ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            pillActive
              ? "max-w-7xl px-6 md:px-12"
              : "max-w-full px-2 md:px-4"
          }`}
        >
        <div
          className={`relative rounded-2xl border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-[1584ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            pillActive
              ? `backdrop-blur-3xl shadow-[0_18px_50px_-24px_rgba(12,30,46,0.35)] ${
                  isDark ? "border-white/20" : "border-black/[0.08]"
                }`
              : "backdrop-blur-none shadow-none border-transparent"
          } ${
            menuOpen
              ? "bg-white"
              : pillActive
                ? isDark
                  ? "bg-primary/50"
                  : "bg-white/40"
                : "bg-transparent"
          }`}
        >
          <div className="relative h-16 flex items-center justify-between px-5 md:px-8">

          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
            aria-label="Fynix home"
            onClick={(e) => {
              setMenuOpen(false);
              handleSamePageNav("/")(e);
            }}
          >
            <Logo
              className={`transition-colors ${
                isDark
                  ? "text-white group-hover:text-accent"
                  : "text-primary group-hover:text-accent"
              }`}
            />
          </Link>

          <nav
            aria-label="Primary"
            className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10 text-base font-medium transition-colors duration-300 ${
              isDark ? "text-white/70" : "text-text-muted"
            }`}
          >
            {nav.map((item) => {
              const isServices = item.href === "/services";
              const linkClass = `relative py-2 transition-colors duration-300 after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:mx-auto after:h-px after:transition-all ${
                isDark
                  ? "hover:text-white after:bg-white"
                  : "hover:text-primary after:bg-primary"
              } ${
                isServices && megaOpen
                  ? "after:w-full " + (isDark ? "text-white" : "text-primary")
                  : "after:w-0 hover:after:w-full"
              }`;

              if (isServices) {
                return (
                  <div key={item.href} className="relative">
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={megaOpen}
                      className={`${linkClass} flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit`}
                      onClick={() => setMegaOpen((o) => !o)}
                    >
                      {item.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          megaOpen ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass}
                  onClick={handleSamePageNav(item.href)}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Mega menu — centered under the nav, two columns: Growth Acts + featured Technical SEO */}
            <div
              role="region"
              aria-label="Services menu"
              aria-hidden={!megaOpen}
              className={`hidden lg:block absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[min(92vw,720px)] rounded-2xl border border-black/[0.06] bg-white/95 backdrop-blur-md shadow-[0_20px_40px_-30px_rgba(0,0,0,0.25)] transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                megaOpen
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-1 invisible"
              }`}
            >
              <div className="px-6 md:px-8 py-6 md:py-8">
                <div className="grid grid-cols-2 gap-8 lg:gap-10">
                  {/* LEFT — Growth Acts */}
                  <div>
                    <div className="flex items-center gap-6 mb-4">
                      <span className="text-xs uppercase tracking-widest text-text-muted font-mono">
                        Growth Acts
                      </span>
                      <span aria-hidden className="h-px flex-1 bg-border" />
                    </div>
                    <ul>
                      {acts.map((act, idx) => (
                        <li
                          key={act.slug}
                          style={{
                            transitionDelay: megaOpen
                              ? `${idx * MEGA_ITEM_STAGGER}ms`
                              : "0ms",
                          }}
                          className={`transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            megaOpen
                              ? "opacity-100 translate-y-0 blur-0"
                              : "opacity-0 -translate-y-2 blur-[3px]"
                          }`}
                        >
                          <Link
                            href={`/services/${act.slug}`}
                            onClick={(e) => {
                              closeMegaNow();
                              handleSamePageNav(`/services/${act.slug}`)(e);
                            }}
                            className="group flex items-center gap-4 py-2.5"
                          >
                            <span className="font-mono text-xs text-accent font-semibold tabular-nums shrink-0 w-6">
                              {act.num}
                            </span>
                            <span className="font-serif text-xl text-primary group-hover:text-accent transition-colors">
                              {act.title}
                            </span>
                            <span
                              aria-hidden
                              className="ml-auto text-accent text-base opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                            >
                              &rarr;
                            </span>
                          </Link>
                        </li>
                      ))}
                      <li
                        style={{
                          transitionDelay: megaOpen
                            ? `${acts.length * MEGA_ITEM_STAGGER}ms`
                            : "0ms",
                        }}
                        className={`mt-2 pt-2 border-t border-border transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          megaOpen
                            ? "opacity-100 translate-y-0 blur-0"
                            : "opacity-0 -translate-y-2 blur-[3px]"
                        }`}
                      >
                        <Link
                          href="/services/linkedin-personal-account"
                          onClick={(e) => {
                            closeMegaNow();
                            handleSamePageNav("/services/linkedin-personal-account")(e);
                          }}
                          className="group flex items-center gap-4 py-2.5"
                        >
                          <span className="font-mono text-xs text-accent font-semibold tabular-nums shrink-0 w-6">
                            05
                          </span>
                          <span className="font-serif text-xl text-primary group-hover:text-accent transition-colors">
                            LinkedIn Management
                          </span>
                          <span
                            aria-hidden
                            className="ml-auto text-accent text-base opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                          >
                            &rarr;
                          </span>
                        </Link>
                      </li>
                      <li
                        style={{
                          transitionDelay: megaOpen
                            ? `${(acts.length + 1) * MEGA_ITEM_STAGGER}ms`
                            : "0ms",
                        }}
                        className={`transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          megaOpen
                            ? "opacity-100 translate-y-0 blur-0"
                            : "opacity-0 -translate-y-2 blur-[3px]"
                        }`}
                      >
                        <Link
                          href="/services/social-media"
                          onClick={(e) => {
                            closeMegaNow();
                            handleSamePageNav("/services/social-media")(e);
                          }}
                          className="group flex items-center gap-4 py-2.5"
                        >
                          <span className="font-mono text-xs text-accent font-semibold tabular-nums shrink-0 w-6">
                            06
                          </span>
                          <span className="font-serif text-xl text-primary group-hover:text-accent transition-colors">
                            Social Media
                          </span>
                          <span
                            aria-hidden
                            className="ml-auto text-accent text-base opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                          >
                            &rarr;
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* RIGHT — Featured: Free Technical SEO Audit */}
                  <div
                    style={{
                      transitionDelay: megaOpen
                        ? `${acts.length * MEGA_ITEM_STAGGER}ms`
                        : "0ms",
                    }}
                    className={`flex flex-col transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      megaOpen
                        ? "opacity-100 translate-y-0 blur-0"
                        : "opacity-0 -translate-y-2 blur-[3px]"
                    }`}
                  >
                    <div className="flex items-center gap-6 mb-4">
                      <span className="text-xs uppercase tracking-widest text-text-muted font-mono">
                        Free Audit
                      </span>
                      <span aria-hidden className="h-px flex-1 bg-border" />
                    </div>

                    <Link
                      href="/#technical-seo-audit"
                      onClick={handleAuditNav}
                      className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-white p-7 shadow-[0_12px_35px_-15px_rgba(12,30,46,0.07)] hover:border-accent/40 hover:shadow-[0_18px_45px_-15px_rgba(226,115,50,0.12)] transition-all duration-300 min-w-[320px]"
                    >
                      {/* SONAR RIPPLE WATERMARK VECTOR LINES */}
                      <svg
                        className="absolute inset-0 h-full w-full pointer-events-none select-none"
                        viewBox="0 0 340 220"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMaxYMid slice"
                      >
                        <defs>
                          <radialGradient id="mega-card-sonar-glow" cx="300" cy="130" r="180" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#E27332" stopOpacity="0.10" />
                            <stop offset="60%" stopColor="#E27332" stopOpacity="0.02" />
                            <stop offset="100%" stopColor="#E27332" stopOpacity="0" />
                          </radialGradient>
                          <linearGradient id="mega-card-ring-stroke" x1="100%" y1="50%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#E27332" stopOpacity="0.32" />
                            <stop offset="50%" stopColor="#E27332" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#E27332" stopOpacity="0.04" />
                          </linearGradient>
                        </defs>

                        {/* Ambient radial glow under concentric rings */}
                        <rect width="340" height="220" fill="url(#mega-card-sonar-glow)" />

                        {/* Concentric Sonar Ripple Rings radiating out from bottom-right (300, 130) */}
                        {[22, 42, 64, 88, 114, 142, 172, 204, 238, 274, 312, 352, 394].map((r, idx) => (
                          <circle
                            key={idx}
                            cx="300"
                            cy="130"
                            r={r}
                            stroke="url(#mega-card-ring-stroke)"
                            strokeWidth="1"
                            strokeOpacity={0.08 + (1 - idx / 13) * 0.26}
                          />
                        ))}
                      </svg>

                      {/* TOP GROUP: title + FREE badge share one full-width row, then description */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-sans text-[26px] font-bold leading-tight text-primary group-hover:text-accent transition-colors duration-200">
                            Technical Audit
                          </h3>
                          <span className="shrink-0 rounded-full border border-accent/25 bg-[#FFF5EF] px-3.5 py-1 text-[11px] font-mono tracking-widest text-accent font-semibold shadow-2xs">
                            FREE
                          </span>
                        </div>
                        <p className="mt-2.5 text-sm text-text-muted/90 font-normal leading-relaxed max-w-[220px]">
                          A free, no-obligation report on what&apos;s holding your rankings back.
                        </p>
                      </div>

                      {/* BOTTOM: divider + action, pinned to the base of the card */}
                      <div className="relative z-10 mt-auto pt-8">
                        <div className="mb-4 h-px w-full max-w-[210px] bg-border/60" />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent group-hover:text-primary transition-colors duration-300 flex items-center gap-1.5">
                          REQUEST THE AUDIT
                          <span
                            aria-hidden
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          >
                            &rarr;
                          </span>
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* BOTTOM CTA BAR */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-start">
                  <Link
                    href="/services"
                    onClick={(e) => {
                      closeMegaNow();
                      handleSamePageNav("/services")(e);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-accent hover:text-primary transition-colors"
                  >
                    Explore All Services &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2 md:gap-5 shrink-0">
            <Link
              href="/contact"
              onClick={(e) => {
                setMenuOpen(false);
                handleSamePageNav("/contact")(e);
              }}
              className={`group relative inline-flex items-center justify-center gap-1.5 px-4 py-2.5 md:px-5 rounded-full text-[11px] md:text-xs font-semibold uppercase tracking-widest transition-[background-color,color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0 will-change-transform ${
                isDark
                  ? "bg-white text-primary hover:bg-gradient-to-r hover:from-[#e9af88] hover:to-[#ffd2b3] hover:text-[#0C1E2E]"
                  : "bg-primary text-white hover:bg-gradient-to-r hover:from-[#e9af88] hover:to-[#ffd2b3] hover:text-[#0C1E2E]"
              }`}
            >
              Start Project
              <span
                aria-hidden
                className="inline-block max-w-0 overflow-hidden opacity-0 -translate-x-1 transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:max-w-[1em] group-hover:opacity-100 group-hover:translate-x-0"
              >
                →
              </span>
            </Link>

            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => {
                closeMegaNow();
                setMenuOpen((o) => !o);
              }}
              className={`lg:hidden h-11 w-11 -mr-2 flex items-center justify-center rounded-full transition-colors ${
                isDark
                  ? "text-white hover:bg-white/10"
                  : "text-primary hover:bg-primary/5"
              }`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>
      </header>

      <div
        aria-hidden
        onClick={closeMegaNow}
        className={`hidden lg:block fixed inset-0 z-40 bg-primary/20 backdrop-blur-md transition-opacity duration-300 ${
          megaOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!menuOpen}
        className={`lg:hidden fixed inset-x-0 top-20 bottom-0 z-40 bg-white transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
      >
        <nav
          aria-label="Mobile primary"
          className="h-full overflow-y-auto px-6 pt-8 pb-12 flex flex-col"
        >
          <ul className="flex flex-col divide-y divide-border">
            {nav.map((item, idx) => {
              const isServices = item.href === "/services";
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      setMenuOpen(false);
                      handleSamePageNav(item.href)(e);
                    }}
                    className="flex items-center justify-between py-5 group"
                  >
                    <span className="font-serif text-3xl text-primary group-hover:text-accent transition-colors">
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className="text-xs font-mono text-text-muted tabular-nums"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </Link>

                  {isServices && (
                    <ul className="pl-4 pb-4 space-y-3 border-l-2 border-accent/30 ml-1 mb-2">
                      {acts.map((act) => (
                        <li key={act.slug}>
                          <Link
                            href={`/services/${act.slug}`}
                            onClick={(e) => {
                              setMenuOpen(false);
                              handleSamePageNav(`/services/${act.slug}`)(e);
                            }}
                            className="flex items-center gap-3 group/sub text-sm"
                          >
                            <span className="font-mono text-xs font-semibold text-accent shrink-0">
                              {act.num}
                            </span>
                            <span className="font-serif text-lg text-primary/85 group-hover/sub:text-accent transition-colors">
                              {act.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/services/linkedin-personal-account"
                          onClick={(e) => {
                            setMenuOpen(false);
                            handleSamePageNav("/services/linkedin-personal-account")(e);
                          }}
                          className="flex items-center gap-3 group/sub text-sm"
                        >
                          <span className="font-mono text-xs font-semibold text-accent shrink-0 w-5">
                            05
                          </span>
                          <span className="font-serif text-lg text-primary/85 group-hover/sub:text-accent transition-colors">
                            LinkedIn Management
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/services/social-media"
                          onClick={(e) => {
                            setMenuOpen(false);
                            handleSamePageNav("/services/social-media")(e);
                          }}
                          className="flex items-center gap-3 group/sub text-sm"
                        >
                          <span className="font-mono text-xs font-semibold text-accent shrink-0 w-5">
                            06
                          </span>
                          <span className="font-serif text-lg text-primary/85 group-hover/sub:text-accent transition-colors">
                            Social Media
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/#technical-seo-audit"
                          onClick={handleAuditNav}
                          className="flex items-center gap-3 group/sub text-sm"
                        >
                          <span className="font-mono text-xs font-semibold text-accent shrink-0">
                            &#9733;
                          </span>
                          <span className="font-serif text-lg text-primary/85 group-hover/sub:text-accent transition-colors">
                            Technical Audit
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold rounded-full border border-accent/40 px-1.5 py-0.5">
                            Free
                          </span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-auto pt-10 space-y-4 text-sm">
            <Link
              href="/faqs"
              onClick={(e) => {
                setMenuOpen(false);
                handleSamePageNav("/faqs")(e);
              }}
              className="block font-mono uppercase tracking-widest text-xs text-text-muted hover:text-primary transition-colors"
            >
              FAQs
            </Link>
            <Link
              href="/contact"
              onClick={(e) => {
                setMenuOpen(false);
                handleSamePageNav("/contact")(e);
              }}
              className="block font-mono uppercase tracking-widest text-xs text-text-muted hover:text-primary transition-colors"
            >
              {siteConfig.email}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
