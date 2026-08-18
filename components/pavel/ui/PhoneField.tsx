"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRIES, flagEmoji } from "@/components/pavel/countries";

interface PhoneFieldProps {
  /** Selected country NAME ("" when none picked yet). */
  country: string;
  onCountryChange: (name: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  /** id for the tel input so an external <label> can point at it. */
  inputId?: string;
}

/**
 * International phone input: a flag + dial-code button that opens a searchable
 * country list, sitting flush against the national-number field. The selected
 * country drives the dial code shown here and — via the parent — the pricing
 * region and local-time conversion, so it stays the single country control.
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  country,
  onCountryChange,
  phone,
  onPhoneChange,
  inputId = "pv-phone",
}) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // True only when the highlight moved via arrow keys, so hover (during wheel
  // scroll) never triggers the auto-scroll that would fight the wheel.
  const navByKeyboard = useRef(false);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.name === country),
    [country]
  );
  const dialCode = selected?.dialCode ?? "+—";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const digits = q.replace(/[^\d]/g, "");
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (digits.length > 0 && c.dialCode.replace(/\D/g, "").includes(digits))
    );
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Focus the search box once the menu is open (DOM side effect only — the
  // query/highlight are reset in openMenu so no state is set from the effect).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const openMenu = () => {
    // Open upward when there isn't room for the menu below the field, so it
    // never runs off the bottom of the screen.
    const rect = rootRef.current?.getBoundingClientRect();
    setDropUp(!!rect && window.innerHeight - rect.bottom < 300);
    setQuery("");
    const selectedIdx = COUNTRIES.findIndex((c) => c.name === country);
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
    setOpen(true);
  };

  // Scroll to selected country when dropdown opens
  useEffect(() => {
    if (!open || !listRef.current) return;
    const selectedIdx = COUNTRIES.findIndex((c) => c.name === country);
    if (selectedIdx >= 0) {
      const el = listRef.current.children[selectedIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "center" });
    }
  }, [open, country]);

  // Keep the highlighted row in view during KEYBOARD navigation only. Doing it
  // on hover too would fight wheel-scrolling — the row under the cursor changes
  // as the list scrolls, and snapping it back cancels the scroll.
  useEffect(() => {
    if (!open || !navByKeyboard.current || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
    navByKeyboard.current = false;
  }, [activeIndex, open]);

  const choose = (name: string) => {
    onCountryChange(name);
    setOpen(false);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      navByKeyboard.current = true;
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navByKeyboard.current = true;
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      navByKeyboard.current = true;
      setActiveIndex((i) => Math.min(i + 6, filtered.length - 1));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      navByKeyboard.current = true;
      setActiveIndex((i) => Math.max(i - 6, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      navByKeyboard.current = true;
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      navByKeyboard.current = true;
      setActiveIndex(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[activeIndex];
      if (c) choose(c.name);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openMenu())}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select country dial code"
          className="inline-flex items-center gap-1.5 rounded-l-xl border border-r-0 border-border bg-background-soft px-3 text-sm text-primary hover:bg-white focus:outline-none focus:border-primary transition-colors"
        >
          <span className="text-base leading-none" aria-hidden>
            {selected ? flagEmoji(selected.code) : "🌐"}
          </span>
          <ChevronDown
            aria-hidden
            className={`w-3.5 h-3.5 text-text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
          <span className="text-text-muted tnum whitespace-nowrap">{dialCode}</span>
        </button>
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required
          aria-required="true"
          autoComplete="tel-national"
          className="min-w-0 flex-1 px-4 py-3 rounded-r-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
        />
      </div>

      {open && (
        <div
          data-lenis-prevent
          onWheel={(e) => {
            if (listRef.current && !listRef.current.contains(e.target as Node)) {
              listRef.current.scrollTop += e.deltaY;
            }
          }}
          className={`absolute z-20 w-full overflow-hidden rounded-xl border border-border bg-white shadow-xl ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search aria-hidden className="w-4 h-4 text-text-muted shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Search country or code"
              aria-label="Search country"
              className="w-full bg-transparent text-sm text-primary placeholder-text-muted/60 focus:outline-none"
            />
          </div>
          <ul
            ref={listRef}
            data-lenis-prevent
            role="listbox"
            aria-label="Country"
            className="custom-select-scroll max-h-56 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-text-muted">No matches.</li>
            ) : (
              filtered.map((c, i) => {
                const isSelected = c.name === country;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => choose(c.name)}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      isActive ? "bg-background-soft" : ""
                    } ${isSelected ? "text-primary font-medium" : "text-primary/90"}`}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {flagEmoji(c.code)}
                    </span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-text-muted tnum whitespace-nowrap">
                      {c.dialCode}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
