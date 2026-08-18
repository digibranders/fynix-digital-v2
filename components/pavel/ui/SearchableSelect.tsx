"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface SearchableOption {
  /** Stable key. */
  code: string;
  /** Display text and the value passed to onChange. */
  name: string;
}

interface SearchableSelectProps {
  id: string;
  /** Selected option NAME ("" when none picked yet). */
  value: string;
  onChange: (name: string) => void;
  options: readonly SearchableOption[];
  /** Trigger text when nothing is selected. */
  placeholder: string;
  /** Search box placeholder. */
  searchPlaceholder?: string;
  /** Accessible name for the listbox + search box. */
  ariaLabel?: string;
  required?: boolean;
}

/**
 * A full-width searchable dropdown styled to match the checkout's country
 * picker (PhoneField): a button trigger that opens a filterable list with
 * keyboard navigation, drop-up when there's no room below, and wheel/scroll
 * handling that plays nicely with Lenis smooth scrolling.
 *
 * The trigger is a real <button>, so native `required` doesn't apply; callers
 * validate the value in their submit handler (as the checkout already does).
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Search",
  ariaLabel = "Options",
  required,
}) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = `${id}-listbox`;
  // True only when the highlight moved via arrow keys, so hover (during wheel
  // scroll) never triggers the auto-scroll that would fight the wheel.
  const navByKeyboard = useRef(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [query, options]);

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

  // Focus the search box once the menu is open.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const openMenu = () => {
    // Open upward when there isn't room for the menu below the field.
    const rect = rootRef.current?.getBoundingClientRect();
    setDropUp(!!rect && window.innerHeight - rect.bottom < 300);
    setQuery("");
    const selectedIdx = options.findIndex((o) => o.name === value);
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
    setOpen(true);
  };

  // Scroll the selected row into view when the menu opens.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const selectedIdx = options.findIndex((o) => o.name === value);
    if (selectedIdx >= 0) {
      const el = listRef.current.children[selectedIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "center" });
    }
  }, [open, value, options]);

  // Keep the highlighted row in view during KEYBOARD navigation only.
  useEffect(() => {
    if (!open || !navByKeyboard.current || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
    navByKeyboard.current = false;
  }, [activeIndex, open]);

  const choose = (name: string) => {
    onChange(name);
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
      const o = filtered[activeIndex];
      if (o) choose(o.name);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        role="combobox"
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-required={required}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background-soft px-4 py-3 text-sm transition-all focus:border-primary focus:bg-white focus:outline-none ${
          value ? "text-primary" : "text-text-muted/60"
        }`}
      >
        <span className="truncate text-left">{value || placeholder}</span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

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
            <Search aria-hidden className="h-4 w-4 shrink-0 text-text-muted" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-label={`Search ${ariaLabel.toLowerCase()}`}
              className="w-full bg-transparent text-sm text-primary placeholder-text-muted/60 focus:outline-none"
            />
          </div>
          <ul
            ref={listRef}
            id={listboxId}
            data-lenis-prevent
            role="listbox"
            aria-label={ariaLabel}
            className="custom-select-scroll max-h-56 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-text-muted">No matches.</li>
            ) : (
              filtered.map((o, i) => {
                const isSelected = o.name === value;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={o.code}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => choose(o.name)}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      isActive ? "bg-background-soft" : ""
                    } ${isSelected ? "font-medium text-primary" : "text-primary/90"}`}
                  >
                    <span className="flex-1 truncate">{o.name}</span>
                    {isSelected && (
                      <Check aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                    )}
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
