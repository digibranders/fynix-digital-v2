# Fynix Design System

A working document for how the Fynix website is designed and built. Owned by the team, not by any one tool. If a component or page doesn't align with this, one of them is wrong — decide, then update.

---

## 1. Purpose & Voice

Fynix positions itself as a **cybersecurity growth partner**. Every design and copy decision should reinforce three qualities:

1. **Trust-first** — the reader is an enterprise cybersecurity buyer who's careful, senior, and skeptical. Nothing playful, no exclamation-driven marketing.
2. **Editorial** — reads like a design annual or a boutique consulting quarterly, not a SaaS landing page.
3. **Measured** — every claim defends itself against a business outcome (pipeline, conversion, ranking, retention).

**Tone rules**
- No em dashes anywhere (colons, commas, or split sentences instead).
- No exclamation marks in Fynix voice. Verbatim client quotes stay as-said.
- No hype words: *revolutionary*, *cutting-edge*, *unleash*, *supercharge*.
- Sentence case for headings by default; title case only for proper nouns.
- Serif for headlines, sans for body, mono for eyebrows/labels.

---

## 2. Palette

| Token | Value | Usage |
|---|---|---|
| `--background` | `#FCFCFB` | Page background (warm cream) |
| `--background-soft` | `#F6F5F2` | Secondary surfaces, alternate sections |
| `--foreground` | `#1D2125` | Body text default |
| `--text-muted` | `#565D64` | Secondary text, labels |
| `--primary` | `#0C1E2E` | Dark navy — buttons, headings, footer |
| `--primary-hover` | `#172D40` | Primary hover state |
| `--accent` | `#E9AF88` | Warm peach — the only accent color |
| `--accent-hover` | `#D89870` | Accent hover state |
| `--border` | `#E8E7E3` | Hairlines, card borders, dividers |

**Palette rules**
- Aged gold is **accent only** — eyebrows, active states, small metrics, links, gradient highlights. Never fill a button or a large surface with gold.
- Primary buttons stay navy. Gold-on-gold reads cheap.
- The palette is warm; no cool greys, no pure white. Every neutral has cream in it.

**Growth Act accents (per-service palette)**

Four muted, editorial hues — one per Act — used to identify a service across the site. Source of truth: [`actAccents`](components/ActsStack.tsx). Each Act gets a `from` (light), `to` (lighter), and `ink` (dark) value.

| Act | `from` | `to` | `ink` | Read |
|---|---|---|---|---|
| UI/UX | `#c9b57a` | `#f5ecd5` | `#5a4a1e` | champagne / bronze |
| Development | `#7f9c95` | `#dce8e4` | `#243a35` | sage / forest |
| SEO/AEO | `#b1786c` | `#efd9d1` | `#4c231c` | clay / oxblood |
| Lead Generation | `#7a6e9c` | `#e0d9ef` | `#2b2144` | muted violet / indigo |

**Rules**
- **Permitted uses only**: the `01`–`04` numeral in `ink`, small icons, or the `from`→`to` diagonal used on ActsStack poster surfaces. The 4px `inset` edge marker is reserved for ActsStack's header bar and is not applied to other cards.
- **Never** fill a card body, background, button, or large surface with these hues. Aged gold remains the single narrative accent; these hues are pure wayfinding.
- **Never** introduce a fifth Act color without extending the Acts themselves. The palette is one-to-one with the four Growth Acts.
- Contrast: `ink` values pass AA on cream when used at ≥12px semibold (their intended role — the numeric label).

---

## 3. Typography

**One family: Figtree.** Loaded via `next/font/google` in `app/layout.tsx` and exposed as `--font-sans`. In `app/globals.css`, `--font-serif`, `--font-sans`, and `--font-mono` all resolve to `--font-sans`, so every `font-serif` / `font-sans` / `font-mono` class in the codebase renders Figtree. This is intentional — the semantic classes stay so we can pivot to a display face later without touching markup, but today they're all Figtree.

| Class | Role | Rendered as |
|---|---|---|
| `font-serif` | Headlines, big numerals, italic accents | Figtree |
| `font-sans` | Body copy, UI, buttons | Figtree |
| `font-mono` | Eyebrows, labels, counters, ticks | Figtree |

**Scale (Tailwind, common uses)**
- `text-7xl` — hero H1 (desktop)
- `text-5xl` – `text-6xl` — section H2 and large metrics
- `text-3xl` – `text-4xl` — sub-section H2
- `text-xl` – `text-2xl` — card headings, blockquotes
- `text-base` – `text-lg` — body copy
- `text-sm` – `text-xs` — captions, dense meta, eyebrows

**Rules**
- Headlines: `font-serif`, `font-normal` weight, tight `leading-[1.08]` on the very largest.
- Italic + accent-gold is the "expressive" pattern reserved for the emotional pivot of a headline (e.g. *Growth Partner*, *Not Copywriters.*).
- Mono is uppercase, `tracking-widest`, ~10–12px. Never running text.
- Body copy is `font-light` when set on cream, `font-normal` on white cards.
- **Heading line count**: no headline wraps to more than **2 lines** at any breakpoint. Three-line headings read as body copy and break the editorial cadence. If a heading pushes past 2 lines: (a) widen the container (`max-w-3xl` → `max-w-4xl` → `max-w-5xl`), (b) add `text-balance` to redistribute break points, or (c) shorten the copy. Never let it wrap 3 or more lines and call it shipped.

---

## 4. Layout & Spacing

- **Container**: `max-w-7xl` for full-width pages, `max-w-4xl` – `max-w-5xl` for text-forward pages (FAQs, Contact, Case Study detail).
- **Section padding**: `py-24 md:py-32` for headline sections, `py-20 md:py-28` for CTA/utility rows.
- **Horizontal padding**: `px-6 md:px-12`.
- **Grid**: default to 12-col grids for the hero and heavy layout sections; simple 3–4 col for card grids.
- **Vertical rhythm**: every top-level section is separated by `border-b border-border`. The last section before the footer omits the border.

---

## 5. Motion System

One easing, one duration family, one principle: **premium easing = slow settle at the end**.

- **Signature curve**: `cubic-bezier(0.22, 1, 0.36, 1)` (Awwwards-standard easeOutQuint). Used by Reveal, CountUp, TestimonialsRail slide transitions.
- **Durations**: 700–1000ms for scroll reveals; 1600–1800ms for CountUp; 200–300ms for hover states.
- **`prefers-reduced-motion: reduce`** is honored globally — see `globals.css`. Any component with JS animation must also fall back cleanly (snap to final state).

### Reveal (`components/Reveal.tsx`)
Wraps any content block. Uses IntersectionObserver, fires once, then disconnects.

Props:
- `variant`: `"up"` (default), `"left"`, `"right"`, `"scale"` — directional entrance.
- `delay`, `duration`, `distance` — tuning per element.
- `blur`: adds a 6px→0 filter blur for the "focus arriving" effect.

**Rules**
- Use `variant="up"` for card grids so items stagger uniformly.
- Use `left` + `right` on paired columns for scissor-open composition (hero, contact, case study detail).
- Stagger card grids by 100–120ms per item.

### CountUp (`components/CountUp.tsx`)
Client component that animates any numeric string from 0 to its final value on viewport entry. Parses format (prefix, decimals, suffix) automatically. Wrapped element must have `tabular-nums` to prevent horizontal jitter during count.

### Lenis (`components/SmoothScroll.tsx`)
Global smooth-scroll wrapper. Disabled entirely for reduced-motion users. Never combine with CSS `scroll-behavior: smooth` (double-interpolation).

---

## 6. Components

### Buttons

Every CTA-shaped element is `rounded-full`.

- **Primary**: `bg-primary text-white ... rounded-full shadow-sm` — dark navy pill.
- **Secondary**: `rounded-full border border-border bg-white` — outlined pill.
- **Ghost text link**: no border, `text-text-muted hover:text-primary`.

Form inputs are NOT pill-shaped — they use `rounded` (small radius). Pill inputs read as search bars.

### Cards

Two card families:
- **Surface cards**: `rounded-lg` or `rounded-xl`, `bg-white` or `bg-background-soft`, `border-border`. Used for content (case studies, team members, engagement models).
- **Frosted cards** (hero illustration): semi-transparent white gradient, subtle border, layered depth.

Never mix card families in one section.

### Section headings

Every section leads with a three-part header:
1. **Eyebrow** — `text-xs uppercase tracking-widest text-accent font-mono`
2. **Heading** — `font-serif text-3xl md:text-4xl text-primary font-normal`
3. **(Optional) Description** — `text-text-muted font-light leading-relaxed`

Use `SectionHeading` component where possible for consistency.

### TestimonialsRail

Single-card carousel pattern. Client component. Prev/Next circular buttons, dot indicators (active = 40px accent bar, inactive = 6px circle), slide counter `01 / 06`, keyboard arrow support, `role="region" aria-roledescription="carousel"`. Auto-advance intentionally disabled — it reads salesy.

### ProcessTimeline

Alternating zig-zag layout (`variant="left"` odd, `variant="right"` even). Vertical spine on the left on mobile, center on desktop. Each step is a self-contained card with duration, activities, and deliverable.

---

## 7. Editorial Motifs

Three signature elements that make the site feel authored:

1. **Corner tick marks** — 4 × 4 `border-l border-t border-border` marks at all four corners of the hero. Swiss/architectural signature.
2. **Dot grid backdrop** — `radial-gradient` at 3.5% opacity, radially masked so it fades at edges. Structural grid, never dominates.
3. **Ambient gold glow** — one soft `blur-3xl` `bg-accent/12` circle in the top-right of the hero. Sole ambient light source.

**Rules**
- These belong to the hero only. Don't apply them to sub-pages.
- Never add more than these three motifs at once. Restraint > decoration.

---

## 8. Visual Semantics

Every visual element on the site must earn its place by carrying meaning. Imagery is a communication channel, not decoration — if a visual doesn't explain, structure, or evidence something, it doesn't ship.

**Use (good semantics)**
- **Relevant diagrams** — architecture, data flow, threat model, engagement lifecycle.
- **Meaningful icons** — inline SVGs that label a specific concept (a stage, a tool, a risk). Sized to context, one per idea.
- **Labeled process flows** — steps with duration, activity, and deliverable (see `ProcessTimeline`).
- **Architecture diagrams** — how systems, teams, or content pipelines fit together.
- **Comparison tables** — before/after, us vs. generic agency, tier-by-tier scope.
- **Infographics that explain a concept** — a metric visualized, a funnel annotated, a workflow mapped.

**Don't use (poor semantics)**
- **Generic stock photography** — laptops on desks, handshake shots, "diverse team in glass conference room."
- **Decorative background imagery** — patterns or gradients that don't structure the page (the dot grid and gold glow in §7 are the only exceptions and are hero-only).
- **Random office / lifestyle images** — anything that could belong to any brand.
- **Unrelated illustrations** — abstract vector art, Freepik-style scenes, mascots.
- **Icons with no clear purpose** — decorative flourishes, filler icons in card grids, "modern" 24×24 rounded-corner sets.

**Rules**
- Before adding any visual, state in one line what it explains. If you can't, remove it.
- Prefer typography, tables, and diagrams over imagery. When in doubt, set it in type.
- Icons appear only when they label a distinct concept in a set (e.g. one per engagement model). Never as ambient decoration.
- Diagrams are built in-brand as inline SVG using the palette (`--primary`, `--accent`, `--border`). No third-party clip-art or 3D renders.
- Every meaningful visual carries an accessible label (`<title>`, `aria-label`, or a caption). Decorative-only marks are `aria-hidden`.

---

## 9. Accessibility

Minimum bar: **WCAG 2.2 AA**. Non-negotiable.

- **Contrast**: warm peach accent (`#E9AF88`) passes AA on cream (`#F6F5F2`) at 16px semibold. On any smaller/lighter treatment, deepen to `#8B6A2E`.
- **Focus**: default browser outline is fine on inputs. Buttons and links MUST have a visible focus state (not `outline-none` unless replaced with a ring).
- **Landmarks**: `<header>`, `<main>`, `<footer>`, `<nav aria-label>`, `<aside aria-label>` used correctly.
- **Interactive patterns**:
  - `ActsTabs` uses `role="tablist" / "tab" / "tabpanel"` with `aria-selected` and `aria-controls`.
  - `FaqAccordion` uses `aria-expanded` + `aria-controls` + `role="region"` on the panel.
  - `TestimonialsRail` uses `role="region" aria-roledescription="carousel"` with `aria-live="polite"` on the active slide and `aria-current="true"` on the active dot.
  - `CountUp` uses `aria-label={finalValue}` so screen readers hear the final value, not intermediate digits.
- **Reduced motion**: honored by Reveal, CountUp, Lenis, and the global `*` selector in `globals.css`. Test with system setting on before shipping any animation.
- **Alt text**: decorative SVGs and glyphs are `aria-hidden`. Meaningful images (rare — most of our composition is SVG or type) require descriptive alt.

---

## 10. Content Sourcing

- Testimonials, client names, and case studies live in `lib/content.ts`. Do NOT hard-code in components.
- Testimonial quotes are copied verbatim from fynix.digital — never paraphrase real people's words.
- Case study metrics use the format `"+N% Label"`, `"#N Label"`, or `"N× Label"` so the CountUp parser can handle them.

---

## 11. Do / Don't

**Do**
- Reach for the accent color sparingly. If more than 8% of the fold is gold, reduce.
- Use `SectionHeading` and `Reveal` as your defaults for new sections.
- Prefer editorial motifs (corner marks, running heads, dot grids) over icons and stock illustrations.
- Ship every number wrapped in `CountUp` + `tabular-nums`.
- Justify every visual by what it explains: diagram, labeled flow, comparison, or infographic (see §8).

**Don't**
- Use em dashes anywhere. Not in copy, not in metadata, not in titles.
- Use exclamation marks — anywhere.
- Use icon libraries with 24×24 rounded-corner "modern" iconography. Prefer minimal inline SVGs sized to context.
- Ship stock 3D renders or Freepik-style illustrations. If we need an illustration, we build it in-brand as SVG or commission it.
- Add auto-advance to carousels, toast notifications, or animated backgrounds. They fight the editorial tone.
- Introduce a third font family, a fourth palette color, or a second easing curve without updating this document first.

---

## 12. When Something Doesn't Fit

If a request doesn't fit the system:
1. First try to reframe the request into an existing pattern.
2. If it still needs a new pattern, propose it and update this file **before** shipping.
3. If it needs a new palette color, font, or easing, that's a system-level change — pause and discuss.

The system is here so decisions get faster and more consistent, not so we ship worse work.

---

## 13. Admin Console

The console at `/admin` is a working tool, not a marketing surface. It uses the
same palette, the same typeface and the same easing, but it answers to a
different reader: one operator, many times a day, scanning dense numbers under
time pressure. Where the two goals conflict, the console optimises for reading
data and the site optimises for persuasion. The exceptions below are the whole
list; anything not named here follows the rest of this document.

### 13.1 Surfaces

| Token | Value | Usage |
|---|---|---|
| `--console-surface` | `#FFFFFF` | Cards, table body, drawers |
| `--console-sunken` | `#F6F5F2` | Toolbars, table head, wells, skeletons |
| `--console-control` | `#8E8A83` | Input, checkbox and segmented-control borders |

The page ground stays `--background` so white surfaces separate from it.

**`#FFFFFF` is the one lift of the "no pure white" rule in §2.** A 61-column
numeric table needs the maximum contrast between the reading surface and the
page behind it, and the cream ground plus the warm hairlines are what keep the
console in the family. Pure white is permitted on console surfaces only.

`--console-control` exists because §2 has no border dark enough for a control.
`--border` is 1.45:1 on white: correct for a hairline between rows, and below
the 3:1 WCAG 2.2 SC 1.4.11 asks of a boundary that is the only thing telling
you an input is there. `--console-control` is 3.44:1 on white and 3.15:1 on
`--console-sunken`. Use `--border` for rules and card edges, `--console-control`
for anything the operator types into or toggles.

### 13.2 Status colours

The marketing palette has no vocabulary for state, because a page selling a
workshop never has to say "paid", "closed", "over cap" or "this invoice was
never issued". The console says all four on every row.

| Token | Value | Tint | Meaning |
|---|---|---|---|
| `--success` | `#2E6B4F` | `--success-surface` `#EAF2ED` | Paid, open, synced, healthy |
| `--warning` | `#8A5A16` | `--warning-surface` `#FAF2E4` | Pending, closed, unissued, needs a look |
| `--danger` | `#98332F` | `--danger-surface` `#FBEDEC` | Failed, over cap, charged does not match invoiced |
| `--info` | `#2C5478` | `--info-surface` `#EAF0F6` | Neutral notice, explanation |

**Rules**
- **Console only.** Nothing on the marketing site may use these. Aged gold
  remains the site's single accent, and adding a fifth hue there is still a
  system-level change under §12.
- Each value clears 4.5:1 on `--console-surface`, on `--background`, on
  `--console-sunken` and on its own tint. They carry meaning as text, not only
  as fill, so the text bar is the one that applies.
- Colour is never the only signal. Every status pairs with a word, and the
  paid/pending indicator encodes its state in the dot's shape as well as its
  fill.
- The tints are for badges, inline alerts and row emphasis. Never wash a whole
  card or a table body in one.

### 13.3 Neutrals, type and motion

- Meta text is `--text-muted` (6.68:1 on white). The console does not introduce
  a lighter tier: a fainter grey for labels is what put the previous console
  below AA.
- Sizes come from the §3 scale. `text-sm` for data, `text-xs` for meta,
  `text-[11px]` mono uppercase for eyebrows and column heads. No other
  arbitrary sizes.
- Every figure is `tabular-nums`, so a column of numbers does not jitter
  between renders.
- Motion is 150–200ms on hover and press, 220ms for a drawer. **No scroll
  reveals.** `Reveal` and `CountUp` belong to the site; an operator opening
  this thirty times a day does not want data animating in.
- Focus is one ring everywhere: `.console-focus`, 2px `--accent-strong`, 2px
  offset.

### 13.4 Two carve-outs from §8 and §11

- **Icons.** §11 says prefer inline SVG over an icon library. The console uses
  `lucide-react` throughout, which is the right call for UI affordances at this
  density and is already a dependency. §11's rule governs marketing surfaces.
- **The em dash.** §11 bans the em dash. The console uses `—` as the
  placeholder for an absent value in tables, figures and money formatting, and
  `lib/admin/registrationTotals.ts` is tested on it. The ban applies to prose:
  no em dashes in sentences; the em dash stays the typographic placeholder for
  a value that is not there.

### 13.5 Structure

- One route per event, four views in a topbar segmented control: Overview,
  Registrations, Sessions, Referral codes. **Registrations is the default** —
  it is what the page is for.
- No sidebar. The registrations table needs every pixel of width it can get.
- All four views stay mounted and are toggled with `hidden`, never unmounted.
  Unmounting throws away in-flight action results, half-filled forms and open
  editors, which is how an operator loses a "Sync attendance" result by
  glancing at another tab.
- Filters, columns and row detail are **drawers**, not inline panels. Expanding
  a panel inline shoves the table down the page and costs the operator their
  place.
- The table is `border-separate` with hairlines drawn as inset shadows: a
  sticky cell in a `border-collapse` table loses its borders, because the table
  paints them rather than the cell.
