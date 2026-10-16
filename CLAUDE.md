@AGENTS.md

# fynix-digital-v2

The fynix.digital codebase: the marketing site for Fynix Digital, the paid "Semantic SEO Workshop with Pavel Klimakov" funnel and its API, and the internal admin console that reports on it. `README.md` has setup, env vars and runbooks; `DESIGN.md` has the visual system. This file is the working guide.

Stack: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Drizzle ORM with `postgres-js` · Razorpay · Brevo · Zoom Server-to-Server OAuth · Sentry · Vitest. npm, Node 20 (CI) and `>=20.9`.

## Branches and deploys

- Work on `development`. `main` is production and only changes through a PR from `development`.
- Merging to `main` deploys twice. Vercel builds `main` only (`vercel.json`). GitHub Actions (`.github/workflows/deploy.yml`) runs lint, typecheck, tests and build, then ships `main` to the DigitalOcean droplet. PRs into `main` run the same CI without deploying.

## One codebase, two deployments

| | Vercel: fynix.digital | Droplet: api.fynix.digital |
|---|---|---|
| Serves | Marketing pages, `/pavel`, the `/admin` console | `/api/pavel/*` and `/api/admin/data/*` |
| Database | Not reachable | Postgres on localhost |
| Key env | `NEXT_PUBLIC_API_BASE_URL=https://api.fynix.digital`, `ADMIN_API_ORIGIN` (falls back to the former) | `NEXT_PUBLIC_API_BASE_URL` empty, `ADMIN_UI_DISABLED=true`, `ALLOWED_ORIGIN` |

- Browser calls to the Pavel API go through `apiUrl()` in `lib/pavel/apiBase.ts`: cross-origin on Vercel, same-origin locally and on the droplet.
- `middleware.ts` adds credential-less CORS for `/api/pavel/*` from `ALLOWED_ORIGIN`, and rewrites `/pavel` to a prerendered variant at `app/pavel/v/[country]/[zone]` chosen from the visitor's country and time zone. `?country=` is a QA override and skips the rewrite.
- The console on Vercel reads data through `lib/admin/gateway.ts`, which calls the droplet's `/api/admin/data/*` server to server with `ADMIN_PROXY_SECRET`. Locally, with `DATABASE_URL` set, it queries the database directly.
- `lib/admin/host.ts` 404s the console on any host with `ADMIN_UI_DISABLED=true`, so fynix.digital/admin is the only login.

## Where things live

| Path | Holds |
|---|---|
| `app/(site)/` | Marketing pages: home, about, services (`[slug]` for the four Acts, plus `social-media`, `social-media-advertisement`, `linkedin-personal-account`), case studies, contact, faqs, `in/free-business-website` and `us/free-business-website`, `signatures` (internal email-signature tool), privacy, terms |
| `app/(viewer)/free-business-website/live/[slug]` | Framed live previews of sample client sites (`lib/work-sites.ts`, `lib/frame-sandbox.ts`) |
| `app/pavel/` | Workshop landing page and its variants, `thank-you`, `certificate` lookup and `certificate/[credentialId]` |
| `app/api/pavel/` | `form-token`, `register`, `checkout`, `verify`, `webhook` (Razorpay), `thank-you-verify`, `referral`, `schedule`, `invoice/[ref]`, `certificate/*`, `audit-submission`, `zoom/webhook`, `cron/reminders` |
| `app/admin/`, `app/api/admin/` | Console pages, `login`/`logout`, `invoice/[ref]`, and the droplet data API `data/{registrations,sessions,referrals,operations,invoice}` |
| `app/api/contact`, `technical-seo-audit`, `lead-diagnostic`, `health` | Contact form and SEO audit form (both email through Brevo), lead diagnostic (only logs; sends and stores nothing yet), health check (200 only when Postgres answers) |
| `lib/content.ts` | Marketing copy and data: acts, case studies, `siteConfig`. `**bold**` in strings renders via `lib/emphasize.tsx` |
| `lib/pavel/` | Workshop domain: `gst.ts` and `tax.ts`, `invoice*.ts` (numbering, PDF, download), `referral*.ts`, `schedule.ts` and `sessionTimes.ts`, `landingVariant.ts`, `confirm.ts`, `webinarAccess.ts`, `attendanceSync.ts`, `certificate*.ts`, `recording*.ts` |
| `lib/admin/` | Console auth (`auth.ts`), gateway, filters, grouping, totals, CSV export |
| `lib/email/` | `brevo.ts` (transport), `dispatch.ts` (workshop email choke point), `design.ts`, `templates.ts`, `pavelTemplates.ts` |
| `lib/zoom/`, `lib/razorpay/`, `lib/security/` | Zoom registrants and attendance, Razorpay client, honeypot and rate limiting |
| `lib/free-business-website.ts` | `/in/free-business-website` and `/us/free-business-website` content (one page per market; `/free-business-website` redirects to `/in/`). Sign-up buttons go to `NEXT_PUBLIC_LOCAL_BUSINESS_URL` + `/login?plan=...` (the fynix-platform dashboard), or to `/contact` while that is unset |
| `lib/db/schema.ts`, `lib/db/client.ts`, `drizzle/` | Tables `registrations`, `email_log`, `referral_codes`, `invoices`, `invoice_counters`, `webinar_sessions`, `certificates`; the server-only client (returns `null` without `DATABASE_URL`); SQL migrations |
| `components/` | Shared site components at the top level, plus `pavel/`, `admin/`, `free-business-website/` |
| `docs/finance/` | Spend and invoice control: designed, not built |
| `scripts/` | Email preview, email logo export, referral seed, Zoom webinar settings check, audits |

## The workshop purchase flow

1. The checkout modal fetches a signed token from `/api/pavel/form-token` (bot screening, `lib/security/honeypot.ts`).
2. `/api/pavel/register` stores a `pending` registration with an unguessable `ref` (`PVL-...`). It sends no email.
3. `/api/pavel/checkout` creates the Razorpay order. Price and country come from the stored row, never from the client.
4. Payment is confirmed by `/api/pavel/webhook` (authoritative, HMAC over the raw body) and `/api/pavel/verify` (fast path). Both call `confirmRegistrationPaid` in `lib/pavel/confirm.ts`, which is idempotent.
5. Confirmation flips the row to `paid`, issues the GST invoice, grants Zoom access (`lib/pavel/webinarAccess.ts`) and sends email through `dispatchPavelEmail`, which claims an `email_log` row per registration and type so nothing is sent twice.
6. `/api/pavel/cron/reminders` (guarded by `CRON_SECRET` or `PAVEL_CRON_SECRET`, scheduled outside this repo) sends reminders, then a certificate to attendees or the recording to absentees.

## Conventions

- Pages and layouts are Server Components. Add `"use client"` only to components that need state, effects or browser APIs; many files in `components/` are server components.
- Content is data: put copy in `lib/content.ts` (or the feature's own content file), not in JSX.
- Use the semantic design tokens from `app/globals.css` (`--color-primary`, `--color-text-muted`, ...), never raw values. Follow `DESIGN.md`: trust-first, editorial, measured.
- Import with the `@/` alias (repo root).
- Tests are `*.test.ts` next to the source under `lib/` or `components/`, run by Vitest in a Node environment (no DOM tests).
- All mail goes through `lib/email/brevo.ts`. Each file has an `EMAILS_ENABLED` kill switch (both `true` now). Send from `hello@fynix.digital`, the Brevo-verified sender; other addresses are silently dropped.
- Only `lib/email/design.ts` may use raw colours or `<table>`. Add new templates to `lib/email/templates.test.ts` so the shared invariants cover them.

## Rules that are easy to break

- **Migrations must be additive.** The deploy migrates before it builds, so the old process runs against the new schema for a while. Split drops and renames across two deploys.
- **Droplet env comes from the workflow.** Every deploy regenerates `/opt/fynix/.env` from GitHub secrets and variables, so a value set by hand on the server is lost. Add new variables to `deploy.yml` and `.env.example`.
- **GST and invoice numbering are compliance code.** A wrong tax split or a reused invoice number is a legal defect. Keep `lib/pavel/*.test.ts` passing and extend them with any change.
- **Naming trap:** `invoices` means tax invoices issued to workshop buyers. The planned finance system uses the `finance_` prefix and calls inbound files documents.
- **Zoom:** create each cohort's webinar from the `Semantic SEO Masterclass (Fynix emails only)` template and keep registration on manual approval. See README, "Opening a new cohort".
- **Sentry privacy:** request bodies are never sent, and console capture is limited to `warn` and `error`. Do not log personal data at those levels.

## Commands

```bash
npm install
npm run dev              # localhost:3000 (.claude/launch.json: fynix-dev)
npm run lint
npx tsc --noEmit
npm test                 # vitest run
npm run build
npm run db:generate      # SQL migration from lib/db/schema.ts into drizzle/
npm run db:migrate       # apply migrations to DATABASE_URL
npm run db:seed          # referral codes
npm run email:preview    # render every email to .email-preview/ (launch.json: email-preview)
```

Before calling a change done, run `npm run lint`, `npx tsc --noEmit`, `npm test` and `npm run build`. These are the CI gates on `main`.
