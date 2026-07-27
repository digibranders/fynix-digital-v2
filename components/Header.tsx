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
          className={`pointer-events-none absolute inset-x-0 top-0 h-3 md:h-4 backdrop-blur-3xl transition-[opacity,background-color] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            pillActive
              ? isDark
                ? "bg-primary/40 opacity-100"
                : "bg-white/50 opacity-100"
              : "opacity-0"
          }`}
        />
        <div
          className={`mx-auto transition-[max-width,padding-left,padding-right] duration-[1500ms] ease-[cubic-bezier(0.18,1,0.16,1)] ${
            pillActive
              ? "max-w-7xl px-6 md:px-12"
              : "max-w-full px-2 md:px-4"
          }`}
        >
        <div
          className={`relative rounded-2xl border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
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

                    {/* Mega menu — anchored to open under the Services trigger */}
                    <div
                      role="region"
                      aria-label="Services menu"
                      aria-hidden={!megaOpen}
                      className={`hidden lg:block absolute left-0 top-full mt-4 w-[380px] rounded-2xl border border-black/[0.06] bg-white/95 backdrop-blur-md shadow-[0_20px_40px_-30px_rgba(0,0,0,0.25)] transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        megaOpen
                          ? "opacity-100 translate-y-0 visible"
                          : "opacity-0 -translate-y-1 invisible"
                      }`}
                    >
                      <div className="px-6 md:px-8 py-6 md:py-8">
                        {/* Services */}
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
                        </ul>

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
