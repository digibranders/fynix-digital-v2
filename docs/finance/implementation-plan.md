# Implementation plan

Concrete build plan: every file, route, worker, migration, environment variable,
test and rollout step. Companion to [architecture.md](architecture.md).

**No production code has been written.** This document is the thing to approve
before any is.

---

## 1. Dependencies

| Package | Phase | Why | Alternative rejected |
| --- | --- | --- | --- |
| `@aws-sdk/client-s3` | 1 | R2 speaks the S3 API. The only way to store a document | A hand-rolled SigV4 signer. Not worth owning |
| `imapflow` | 2 | Modern promise-based IMAP, handles CONDSTORE/QRESYNC/IDLE, exposes `uidValidity` which the cursor design depends on | `node-imap` is callback-era and unmaintained. Gmail API needs a `watch` renewed every 7 days, which is a silent-failure mode we are specifically avoiding |
| `mailparser` | 2 | MIME parsing, attachment extraction | Writing a MIME parser is not a reasonable use of time |
| `jszip` | 1 | Month-end export ZIP | Shelling out to `zip` on a 961 MB droplet |

`@react-pdf/renderer` is already present and is reused to render HTML-only
receipts to PDF. No new framework, no new UI library, no new ORM.

---

## 2. File plan

### 2.1 Phase 1: visibility foundation

**Domain (`lib/finance/`), pure where possible so it is testable without a database**

| File | Holds |
| --- | --- |
| `types.ts` | Shared domain types and the status unions |
| `money.ts` | Minor-unit arithmetic, `evaluateVariance(policy, expected, actual, toleranceBp)` |
| `fy.ts` | Indian financial year: `fyLabel(date) → "2026-27"`, `fyKey(date) → "FY2026-27"` |
| `periods.ts` | `derivePeriods(subscription, upTo)` → the period rows that should exist. **Pure.** The idempotent insert lives in `ledger.ts` |
| `ledger.ts` | `ensurePeriods(db)`, `attachDocument`, `detachDocument`, `waivePeriod`, `cancelPeriod`, `isOverdue(period, today)` |
| `storage.ts` | R2 client, `deriveKey(vendor, period, invoiceNo, sha256)`, `putDocument`, `getDocument`, `verifyHash` |
| `exceptions.ts` | `raise(kind, dedupeKey, …)` upserting on the partial unique index, `resolve`, `suppress` |
| `audit.ts` | `recordAuditEvent(...)`. Insert only. No update or delete is exported |
| `health.ts` | `financeHealth(db)` → the block `/api/health` renders |
| `uploadTicket.ts` | `issueUploadTicket`, `verifyUploadTicket`. Modelled on `lib/security/honeypot.ts` |

**Console data layer (`lib/admin/finance/`), mirroring `lib/admin/registrations.ts` exactly**

Each module exports `loadX()` and, where it mutates, `mutateX()`, branching on
`hasLocalDb()` and otherwise calling `adminGatewayFetch`.

`registry.ts`, `cycle.ts`, `vault.ts`, `attention.ts`, `export.ts`

**Routes**

| Route | Host | Method | Guard |
| --- | --- | --- | --- |
| `app/admin/finance/page.tsx` | Vercel | page | `isAdminAuthenticated()`, re-checked in every server action |
| `app/admin/finance/loading.tsx`, `error.tsx` | Vercel | | mirrors `app/admin/pavel/` |
| `app/api/admin/finance/document/[id]/route.ts` | Vercel | GET | session; streams from the droplet. Mirrors `app/api/admin/invoice/[ref]/route.ts` |
| `app/api/admin/data/finance/registry/route.ts` | Droplet | GET, POST | `verifyProxySecret` |
| `app/api/admin/data/finance/cycle/route.ts` | Droplet | GET | `verifyProxySecret` |
| `app/api/admin/data/finance/vault/route.ts` | Droplet | GET | `verifyProxySecret` |
| `app/api/admin/data/finance/attention/route.ts` | Droplet | GET, POST | `verifyProxySecret` |
| `app/api/admin/data/finance/document/[id]/route.ts` | Droplet | GET | `verifyProxySecret`; streams from R2 |
| `app/api/admin/data/finance/export/route.ts` | Droplet | GET | `verifyProxySecret`; ZIP |
| `app/api/finance/upload/route.ts` | Droplet | POST, OPTIONS | upload ticket. **Browser posts here directly** (architecture.md §4.8) |
| `app/api/finance/cron/route.ts` | Droplet | GET | `CRON_SECRET`, constant-time |

Every droplet data route follows the established shape: `verifyProxySecret` →
bare 404; `hasLocalDb()` → 503; try/catch → 500 with a logged cause.

**Components (`components/admin/finance/`)**

`FinanceDashboard.tsx` (shell + `SegmentedTabs`), `CycleView.tsx`,
`AttentionView.tsx`, `VaultView.tsx`, `RegistryView.tsx`, `HealthStrip.tsx`,
`PeriodRow.tsx`, `DocumentDrawer.tsx`, `UploadButton.tsx`,
`VendorForm.tsx`, `SubscriptionForm.tsx`.

All compose the existing `components/admin/ui` primitives (`Card`, `Badge`,
`StatTile`, `Drawer`, `SegmentedTabs`, `Alert`, `EmptyState`, `Button`) and the
DESIGN.md §13 console tokens. **No new design system work.** Status colours map
straight onto the existing semantics: `collected` → `--success`, `expected` →
`--info`, `pending_review` → `--warning`, `overdue` → `--danger`.

**Modified files**

| File | Change |
| --- | --- |
| `lib/db/schema.ts` | The Phase 1 tables |
| `lib/admin/sections.ts` **(new)** | Console sections that are not events. `ADMIN_EVENTS` keeps its meaning |
| `components/admin/AdminHub.tsx` | Render the sections list below the events list |
| `middleware.ts` | Add `/api/finance/upload` to the matcher; POST and OPTIONS only; still no `Allow-Credentials` |
| `app/api/health/route.ts` | Add the `finance` block |
| `.env.example` | §5 |
| `.github/workflows/deploy.yml` | New vars into the generated `api.env` |
| `README.md` | Finance section, and the new `docs/finance/` set |
| `package.json` | `@aws-sdk/client-s3`, `jszip` |

### 2.2 Phase 2: ingestion and extraction

`lib/finance/ingest/mail.ts` (IMAP worker, `(uidValidity, lastUid)` cursor, full
resync on change), `ingest/fetchLink.ts` (allowlist, no cross-host redirects,
resolved-address private-range check per security-model.md §7.2),
`ingest/normalise.ts` (HTML receipt → PDF via `@react-pdf/renderer`),
`extract/index.ts` (the cascade), `extract/structured.ts`,
`extract/deterministic/stripe.ts`, `extract/model.ts`, `extract/validate.ts`
(the gates), `match.ts` (document → period), `chase.ts`,
`lib/email/financeTemplates.ts`.

Modified: `app/api/finance/cron/route.ts` gains the ingestion steps;
`.github/workflows/uptime.yml` asserts on the finance health block.

### 2.3 Phase 3: connectors

`lib/finance/connectors/types.ts`, `index.ts` (registry), `runner.ts` (all
policy: backoff, circuit breaker, health writes), then one module per vendor in
the build order from connector-architecture.md §4.5, each with a recorded
fixture test.

### 2.4 Phase 4: reconciliation and export

`lib/finance/payments/import.ts` (statement CSV → normalised rows,
`sourceRowHash` dedupe), `payments/reconcile.ts` (matching and the four payment
exception kinds), `mirror.ts` (one-way OneDrive or Drive), plus the export
extensions.

---

## 3. Worker and schedule plan

One cron route, following the reminders route's shape: self-heal first, every
step `.catch()`-wrapped to a safe default, a structured JSON summary returned.

`GET /api/finance/cron`, hourly, offset from the reminders timer so the two do
not contend for the droplet's 961 MB.

| # | Step | Phase | Failure behaviour |
| --- | --- | --- | --- |
| 1 | `ensurePeriods` for every active subscription | 1 | logged, continue |
| 2 | Re-hash a rolling slice of documents (full sweep weekly) | 1 | `DOCUMENT_HASH_MISMATCH` |
| 3 | `ingestMailbox` | 2 | `MAILBOX_FAILURE`, backoff |
| 4 | `extractPending` for `unvalidated` documents | 2 | per-document, never aborts the batch |
| 5 | `matchUnattached` | 2 | logged |
| 6 | `runDueConnectors` | 3 | per-connector, backoff and circuit breaker |
| 7 | `importPendingStatements` | 4 | logged |
| 8 | `reconcilePayments` | 4 | logged |
| 9 | `evaluateExceptions` (missing, overdue, GSTIN, renewal, stale connectors) | 1 | logged |
| 10 | `sendChases` through `dispatchPavelEmail`'s claim-before-send pattern | 2 | per-recipient |
| 11 | `mirrorToDrive` | 4 | `MIRROR_FAILURE` at low severity |
| 12 | Write the heartbeat to `finance_scheduler_runs` | 1 | last step, always attempted |

Steps 1 and 2 run before everything else for the same reason
`backfillMissingInvoices` runs before the reminder sweep: self-healing must not
be blocked by whatever else fails that hour.

**No long-lived worker process.** The IMAP worker is a function invoked by the
cron, not a daemon. The droplet already runs exactly one process under
`fynix-api`; adding a second service to supervise, deploy and monitor is
complexity the hourly cadence does not need.

---

## 4. API plan

| Route | Method | Body / query | Returns |
| --- | --- | --- | --- |
| `/api/admin/data/finance/registry` | GET | | vendors, subscriptions, payment methods |
| | POST | `{action, ...}` where action ∈ vendor.create/update/deactivate, subscription.create/update/cancel, method.create/update | `{message}`, 200 or 409 |
| `/api/admin/data/finance/cycle` | GET | `?month=YYYY-MM` | counts + period rows with vendor, owner, variance, document |
| `/api/admin/data/finance/vault` | GET | `?vendor&fy&month&kind&q&cursor` | paginated documents |
| `/api/admin/data/finance/attention` | GET | `?severity&kind` | exceptions + review queue |
| | POST | `{action: acknowledge\|resolve\|suppress\|attach\|detach\|correct, ...}` | `{message}` |
| `/api/admin/data/finance/document/[id]` | GET | | the PDF, streamed from R2 |
| `/api/admin/data/finance/export` | GET | `?month=YYYY-MM` | ZIP |
| `/api/finance/upload` | POST | multipart: `ticket`, `file` | `{documentId, status}` |
| `/api/finance/cron` | GET | | run summary |
| `/api/health` | GET | | existing payload plus `finance` |

Mutations mirror the existing `/api/admin/data/operations` shape: one POST, an
`action` discriminator, a `{message}` response, 409 on a refused action so the
console can show the reason.

---

## 5. Environment variables

Added to `.env.example` with the same explanatory-comment style as the existing
entries, and to the generated `api.env` in `deploy.yml`.

| Variable | Host | Required from | Notes |
| --- | --- | --- | --- |
| `R2_ACCOUNT_ID` | droplet | 1 | |
| `R2_BUCKET` | droplet | 1 | dedicated bucket, never shared with public assets |
| `R2_ACCESS_KEY_ID` | droplet | 1 | object read and write on one bucket only |
| `R2_SECRET_ACCESS_KEY` | droplet | 1 | |
| `FINANCE_UPLOAD_SECRET` | **both** | 1 | must match. `openssl rand -hex 32` |
| `FINANCE_MAILBOX_HOST` | droplet | 2 | |
| `FINANCE_MAILBOX_PORT` | droplet | 2 | default 993 |
| `FINANCE_MAILBOX_USER` | droplet | 2 | `billing@fynix.digital` |
| `FINANCE_MAILBOX_PASSWORD` | droplet | 2 | app password, IMAP read only |
| `FINANCE_EXTRACTION_API_KEY` | droplet | 2 | model provider, training opt-out configured |
| `FINANCE_MIRROR_*` | droplet | 4 | only if the mirror is built |
| `VENDOR_TOKEN_<SLUG>` | droplet | 3 | one per connector, read-only scope |

**Unset means disabled, never broken.** With no `R2_*`, upload and the vault
report "storage is not configured" and the rest of the console works. With no
mailbox vars, the IMAP step is skipped and its connector state reads
`disabled` rather than `failing`. This follows `getDb()` returning null and
`dispatchPavelEmail` mocking when Brevo is absent: a partially configured
environment degrades legibly instead of crashing.

---

## 6. Migrations

Generated with `npm run db:generate`, applied by `npm run db:migrate` in the
deploy pipeline, which runs **before** the build.

| Phase | Migration | Contents |
| --- | --- | --- |
| 1 | `00XX_finance_core` | vendors, payment_methods, subscriptions, invoice_periods, documents, exceptions, audit_events, scheduler_runs |
| 2 | `00XX_finance_ingestion` | mailbox_state, connector_state |
| 3 | `00XX_finance_connector_config` | connector columns on vendors |
| 4 | `00XX_finance_payments` | payments, document_payments |

**Every migration is additive.** New tables and nullable columns only. No
rename, no drop, no type change to anything running code reads. This is not
stylistic: `deploy.yml` migrates before building, so the schema is briefly ahead
of the running process, and its own comment already requires destructive changes
to be split across two deploys.

Check constraints from data-model.md are hand-added to the generated SQL where
Drizzle does not emit them, and the migration file is reviewed before commit.

---

## 7. Test strategy

Extends the existing vitest setup: node environment, `lib/**/*.test.ts`, exact
values asserted on anything involving money. The 50 existing test files set the
bar and the CI job already gates on `npm test`.

### 7.1 Unit, no database

The bulk of the logic is pure and belongs here.

| Suite | Asserts |
| --- | --- |
| `money.test.ts` | Minor-unit arithmetic; `evaluateVariance` across all three policies; boundary at exactly `toleranceBp`; seat-based recomputation |
| `fy.test.ts` | Indian FY boundary. **31 March and 1 April are different years.** A date in January belongs to the FY that started the previous April |
| `periods.test.ts` | Monthly, quarterly and annual derivation; anchor days 1 and 28; a subscription starting mid-period; nothing after `cancelledOn`; leap year |
| `storage.test.ts` | Key derivation is deterministic and collision-free; identical bytes produce an identical key; a slug with punctuation cannot escape its prefix |
| `uploadTicket.test.ts` | Round trip; expired rejected; wrong period rejected; tampered signature rejected; replayed nonce rejected |
| `validate.test.ts` | Each gate independently: arithmetic off by one minor unit passes, off by two fails; future invoice date fails; bad currency fails; negative total fails unless `credit_note` |
| `exceptions.test.ts` | Dedupe key stability; resolving frees the key; `occurrences` increments |
| `ledger.test.ts` | Status transitions as pure functions; `isOverdue` at the grace boundary; illegal transitions refused |
| `extract/*.test.ts` | Each strategy against recorded fixtures; the cascade falls through correctly |
| `financeCsv.test.ts` | Formula-injection neutralisation, reusing `csvCell` |

### 7.2 Integration, database required

New capability for this repo, so it is opt-in rather than a CI dependency:
gated on `FINANCE_TEST_DATABASE_URL`, skipped when unset. CI can adopt it once a
throwaway Postgres service is added to the workflow.

| Suite | Asserts |
| --- | --- |
| `ensurePeriods` | Running twice creates one row (the unique constraint). Concurrent runs likewise |
| Document ingest | Same `(source, sourceRef)` twice is one row; same hash from two channels is one row |
| Attach and detach | Period status follows; a detached period returns to `expected` |
| Exception upsert | Concurrent raises produce one row with `occurrences = 2` |
| Audit | Every mutating operation writes exactly one event |

### 7.3 Connector tests

Fixture-based, always. **No test may contact a live vendor API**: a suite that
depends on a third party fails for reasons unrelated to the change, and a red CI
that is usually not your fault is a CI nobody reads.

Each connector asserts: happy path against a recorded response; `unauthorized`
mapped correctly from a 401; `rate_limited` from a 429; `unavailable` from a
5xx; `malformed` from a truncated body; and that no code path throws.

### 7.4 Failure-recovery tests

The most important suite, because it tests the property the whole system exists
for.

Simulated R2 outage leaves no document row. Simulated crash between put and
insert leaves a reusable orphan object. Cursor reset on `uidValidity` change
re-scans without duplicating. Connector backoff sequence and circuit opening.
`SCHEDULER_STALLED` fires at 2× the interval. A hash mismatch flags the document
and reverts the period.

### 7.5 Security tests

Ticket forgery and replay. Path traversal through a hostile filename. Oversized
upload rejected. MIME outside the allowlist rejected. Link-following refuses an
unlisted host, a cross-host redirect, and a hostname resolving to a private
address. Extraction output containing prompt-injection text cannot set any
field that closes a period.

### 7.6 Gates before any phase is called done

Per the repository's own pre-completion rule:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Plus: migration applies cleanly to a copy of production; `/api/health` returns
200 with the finance block; the critical path is exercised by hand once.

---

## 8. Rollout

Each phase is independently useful and independently shippable. Work happens on
`development` and reaches production by merging to `main`, as
[README.md](../../README.md) already specifies.

### Phase 0: administrative preparation

No code. Billing mailbox, then the per-vendor checklist in
[operations-runbook.md §2](operations-runbook.md). Vendor list built from 3 to 6
months of statements, not by asking the teams.

**Done when:** every vendor has the billing contact set, the GSTIN entered, a
billing-role member added, and a read-only token where one exists.

### Phase 1: visibility foundation

Schema, registry, ledger, manual upload, R2, cycle and vault views, exceptions,
audit, health, cron steps 1, 2, 9 and 12.

**Done when:** every known subscription is registered, periods open on schedule,
the CFO can see outstanding versus collected, and a portal-only invoice can be
uploaded against its period.

**At the end of this phase nothing is automated but nothing is invisible**,
which is the larger half of the problem. Phase 1 alone ends the month-end chase
round.

### Phase 2: automation

IMAP ingestion, link following, the extraction cascade, validation gates,
matching, review queue, automated chasing, and the one-off historical mailbox
sweep.

**Done when:** an emailed invoice reaches its period with no human involved, a
failed extraction lands in review rather than closing a period, and an overdue
period chases its owner automatically.

### Phase 3: vendor APIs

DigitalOcean, then Anthropic, Vercel, Cloudflare, GitHub. Others only at
material spend.

**Done when:** DigitalOcean invoices arrive without email, and at least one
vendor's amount is attested by its own API.

### Phase 4: financial reconciliation

Statement import, payment matching, the four payment exception kinds, month-end
export pack, optional mirror.

**Done when:** every rupee on the card statement resolves to a subscription, an
invoice, or a classified exception. This is the phase that catches spend nobody
registered, so it is not optional.

---

## 9. Rollback

| Phase | Rollback | Data |
| --- | --- | --- |
| 1 | Remove the console section; revert the deploy. Tables stay, unused. They are additive and nothing else references them | Kept. The registry is worth keeping even if the UI is withdrawn |
| 2 | Unset `FINANCE_MAILBOX_*`. Ingestion self-disables and the connector state reads `disabled`. No revert needed | Documents already collected are kept |
| 3 | Unset `VENDOR_TOKEN_<SLUG>`. That connector disables; the email channel continues | Kept |
| 4 | Unset the mirror vars. Payment tables stay, unused | Kept |

**Nothing rolls back destructively**, because every feature degrades to disabled
when its configuration is absent. That is the same property that makes a
partially configured environment work, and it is the reason `unset means
disabled, never broken` is a rule rather than a convenience.

R2 objects are never deleted by a rollback. Document rows are never deleted by a
rollback. The archive outlives any particular version of the software that
manages it, which is the point of a human-readable key layout.

---

## 10. Effort

Rough, for sequencing rather than for a contract.

| Phase | Engineering | Elapsed |
| --- | --- | --- |
| 0 | none | 1 day of account admin |
| 1 | 5 to 7 days | 1.5 weeks |
| 2 | 6 to 8 days | 2 weeks |
| 3 | 1 to 2 days per connector | as needed |
| 4 | 5 to 7 days | 1.5 weeks |

Phase 1 is the one with a deadline, because it is the one that ends the pain.

---

## 11. Open decisions

Blocking Phase 1:

1. **Mailbox host.** Google Workspace or Microsoft 365? Decides the IMAP host
   and whether OneDrive is the natural mirror.
2. **The vendor list.** The one input the system cannot derive.

Blocking Phase 2:

3. **Extraction model provider**, and confirmation that training opt-out is
   configured.

Blocking Phase 4:

4. **Statement format.** Which bank and card exports, and in what format.
5. **Mirror target**, or none.

Not blocking, but decide before Phase 4:

6. **Named operators.** Whether to keep the shared admin credential or add a
   user table before payment data raises the stakes (security-model.md §6.3).
