# Fynix

Marketing site for [fynix.digital](https://fynix.digital) — a studio that helps cybersecurity companies turn their websites into growth engines through UI/UX, technical excellence, AI-ready SEO, and predictable lead generation.

[![Uptime](https://uptime.betterstack.com/status-badges/v1/monitor/2tett.svg)](https://uptime.betterstack.com/?utm_source=status_badge) ![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![Motion](https://img.shields.io/badge/Motion-12.42-FF0055?style=flat-square&logo=framer&logoColor=white) ![Sentry](https://img.shields.io/badge/Sentry-10.68-362D59?style=flat-square&logo=sentry&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?style=flat-square&logo=vercel&logoColor=white)

---

## Overview

The site is organised around four **Acts** — the studio's service model — each with its own landing page, deliverables, proof metrics, and linked case studies:

| Act | Slug | Focus |
|---|---|---|
| 01 · UI/UX | `ui-ux` | Interfaces that earn trust before a line is read |
| 02 · Development | `development` | Technical execution and performance |
| 03 · SEO | `seo` | AI-ready organic visibility |
| 04 · Lead Generation | `lead-generation` | Predictable, measurable pipeline |

Everything is statically prerendered except the two API routes, so pages ship as HTML and hydrate for motion and interaction.

## Tech stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.10 |
| UI runtime | React | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) | 4.3.2 |
| Animation | Motion | 12.42.2 |
| Smooth scroll | Lenis | 1.3.25 |
| WebGL | OGL | 1.0.11 |
| Map rendering | dotted-map | 3.1.0 |
| Error monitoring | `@sentry/nextjs` | 10.68.0 |
| Transactional email | Brevo API | — |
| Uptime | Better Stack | — |
| Hosting | Vercel | — |
| Linting | ESLint (`eslint-config-next`) | 9.39.5 |

## Getting started

**Requirements:** Node.js `>=20.9.0` (enforced by Next 16) and npm.

```bash
git clone https://github.com/digibranders/fynix-digital-v2.git
cd fynix-digital-v2
npm install
cp .env.example .env      # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `BREVO_API_KEY` | Server | Yes, for the contact form | Sends the admin notification and user auto-reply |
| `SENTRY_AUTH_TOKEN` | Build | Production only | Uploads source maps so production stack traces are readable |
| `NEXT_PUBLIC_SITE_URL` | Client | Optional | Overrides the canonical URL used in metadata |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Server / Client | Optional | Override the DSN; the project DSN is hardcoded as a fallback |

`VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV` and `VERCEL_PROJECT_PRODUCTION_URL` are injected by Vercel and need no local configuration.

Never commit `.env` — it is gitignored, and `SENTRY_AUTH_TOKEN` and `BREVO_API_KEY` are both secrets.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build (uploads source maps when `SENTRY_AUTH_TOKEN` is set) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck |

## Project structure

```
app/                    App Router pages, all Server Components
  api/contact/          Contact form → Brevo (admin + auto-reply)
  api/lead-diagnostic/  Act-specific diagnostic capture
  case-studies/[slug]/  Per-client case studies
  services/[slug]/      Per-Act service pages
  global-error.tsx      Root-layout error boundary → Sentry
  robots.ts             Generated robots.txt
  sitemap.ts            Generated sitemap.xml
components/             Client Components ("use client")
lib/
  content.ts            Single source of truth: acts, case studies, siteConfig
  email/                Brevo client, templates, HTML previews
  emphasize.tsx         Renders **bold** spans inside content strings
scripts/                One-off asset generation
instrumentation*.ts     Sentry init per runtime
sentry.*.config.ts      Sentry init per runtime
```

## Routes

| Path | Type |
|---|---|
| `/` | Static |
| `/about`, `/process`, `/faqs`, `/contact` | Static |
| `/privacy`, `/terms` | Static |
| `/services`, `/services/[slug]` | SSG (4 acts) |
| `/case-studies`, `/case-studies/[slug]` | SSG (5 case studies) |
| `/robots.txt`, `/sitemap.xml` | Generated |
| `/api/contact` | Dynamic (Node runtime) |
| `/api/lead-diagnostic` | Dynamic |
| `/monitoring` | Sentry tunnel (rewrite, bypasses ad blockers) |

## Conventions

- **Page-level components are Server Components.** Anything interactive lives in `components/` behind `"use client"`.
- **State is local.** React hooks only — no global store.
- **Content is data.** Copy, metrics, deliverables and case studies live in `lib/content.ts`, not in JSX. `**double asterisks**` in content strings are rendered as emphasis by `lib/emphasize.tsx`.
- **Design tokens** are defined in `app/globals.css` via Tailwind v4's `@theme`. Use the semantic names (`--color-primary`, `--color-text-muted`, …) rather than raw values.
- See `CLAUDE.md` and `DESIGN.md` for the fuller architectural and visual direction.

> **Note:** `AGENTS.md` flags that this is Next.js 16 — APIs and conventions differ from older versions. Check `node_modules/next/dist/docs/` before relying on remembered patterns.

## Observability

Sentry is wired across all three runtimes (browser, Node, Edge) via `instrumentation.ts`, with `onRequestError` capturing server component, route handler and server action failures, and `app/global-error.tsx` catching root-layout crashes.

| Signal | Status |
|---|---|
| Errors | On, unsampled |
| Tracing | On, 10% in production (100% in dev) |
| Logs | On, console capture at `warn`/`error` |
| Session Replay | Off |
| Profiling | Off |

Replay and profiling are deliberately disabled. **Sentry bills quotas per organization, not per project**, so the free plan's 50 replays/month are shared across every project in the org and are worth more on the app projects than on a marketing site. Continuous profiling is not included on the free plan at all.

**Privacy:** request bodies are excluded from every runtime (`dataCollection: { httpBodies: [] }`) because the contact and lead-diagnostic routes receive names, emails, phone numbers and free-text messages. Console capture is scoped to `warn`/`error` for the same reason — `app/api/lead-diagnostic/route.ts` logs submitter details at `log` level, which must not reach Sentry.

## Email

`/api/contact` validates the submission (required name, email, phone and at least one service; 2000-character field cap) then sends two transactional emails through Brevo: an admin notification and a user auto-reply.

All 15 outbound emails share one design system.

| File | Holds |
|---|---|
| `lib/email/design.ts` | Palette, type scale, document shell, and the primitives every template composes. The only file that touches raw colour or opens a `<table>`. |
| `lib/email/templates.ts` | Contact form and Technical SEO Audit, customer reply plus internal notification. |
| `lib/email/pavelTemplates.ts` | The workshop lifecycle: priority list, paid confirmation, reminders, certificate, recording, missed-you. |

To see them, render the gallery and open it:

```bash
npm run email:preview
```

That writes `.email-preview/` (gitignored). Serve it with the `email-preview` entry in `.claude/launch.json`, or open `.email-preview/index.html` directly. Every template is rendered from source with sample data, alongside its plain-text alternative.

The masthead uses `public/email/logo.png`, exported from `components/Logo.tsx`. Re-run `npx tsx scripts/generate-email-logo.tsx` after any change to the logo component. It has to be a raster image: no mainstream mail client renders an SVG `<img>`.

`lib/email/templates.test.ts` asserts the invariants that hold across every template (escaping, one masthead and one footer, no 8-digit hex, no SVG images, subject and body agreeing on what they promise). Add a template, and it is covered automatically once it is listed there.

## Deployment

Hosted on Vercel. `vercel.json` restricts automatic deployments to `main`:

```jsonc
{ "git": { "deploymentEnabled": { "*": false, "main": true } } }
```

Work happens on `development` and reaches production by merging to `main`. `SENTRY_AUTH_TOKEN` must be set in the Vercel project environment for production source maps — Vercel sets `CI=1`, so the Sentry upload report appears in the build log.

## Known gaps

- `/api/lead-diagnostic` currently logs submissions and returns success. It does not yet dispatch email, hit a CRM webhook, or persist anything.
- `components/Header.tsx` has a standing ESLint error (`setState` inside an effect) and two unused-variable warnings.
