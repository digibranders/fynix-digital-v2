"use client";

import { useState, useRef, useEffect, useId } from "react";

interface CustomSelectProps {
  id: string;
  label?: string;
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function CustomSelect({
  id,
  placeholder,
  options,
  value,
  onChange,
  required,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const triggerId = useId();
  const listboxId = `${id}-listbox`;

  /* ── Close on outside click / Escape ── */
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  /* ── Scroll focused option into view ── */
  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const listbox = listboxRef.current;
    if (!listbox) return;
    const item = listbox.children[focusedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusedIndex(value ? options.indexOf(value) : 0);
        } else if (focusedIndex >= 0) {
          onChange(options[focusedIndex]);
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const selectedLabel = value || placeholder;

  return (
    <div ref={containerRef} className="custom-select relative">
      {/* Hidden native select for form data + accessibility fallback */}
      <select
        id={id}
        name={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* Custom trigger button */}
      <button
        type="button"
        id={triggerId}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={
          open && focusedIndex >= 0 ? `${id}-option-${focusedIndex}` : undefined
        }
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) setFocusedIndex(value ? options.indexOf(value) : -1);
        }}
        onKeyDown={handleKeyDown}
        className={`custom-select__trigger w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-background-soft border rounded-full text-sm text-left transition-all duration-200 focus:outline-hidden ${
          open
            ? "border-accent ring-2 ring-accent/20"
            : "border-border hover:border-accent/50"
        } ${value ? "text-primary" : "text-text-muted/70"}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      <ul
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        data-lenis-prevent
        aria-labelledby={triggerId}
        className={`custom-select__menu absolute left-0 right-0 z-50 mt-2 py-1.5 bg-white border border-border rounded-2xl shadow-[0_12px_40px_-8px_rgba(12,30,46,0.15)] overflow-y-auto max-h-44 transition-all origin-top custom-select-scroll ${
          open
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible"
        }`}
        style={{ transitionDuration: "180ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {options.map((option, i) => {
          const isSelected = option === value;
          const isFocused = i === focusedIndex;
          return (
            <li
              key={option}
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setFocusedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                select(option);
              }}
              className={`custom-select__option flex items-center gap-3 px-5 py-3 text-sm cursor-pointer transition-colors duration-100 ${
                isFocused
                  ? "bg-accent/8 text-primary"
                  : "text-text-muted hover:text-primary"
              } ${isSelected ? "font-medium text-primary" : "font-normal"}`}
            >
              {/* Check indicator */}
              <span
                className={`w-4 h-4 shrink-0 flex items-center justify-center transition-opacity duration-150 ${
                  isSelected ? "opacity-100" : "opacity-0"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span>{option}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
