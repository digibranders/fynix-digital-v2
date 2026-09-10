# Fynix Spend & Invoice Control: architecture

**Date:** 2026-08-24
**Status:** Design, not yet implemented. No production code written.
**Supersedes:** `docs/superpowers/specs/2026-08-24-invoice-vault-design.md`, which
remains readable as the origin document. Section 4 of this file records every
place this design departs from it and why.

---

## 1. What the system is

Not an invoice archive. The archive is one artifact of a control loop:

```
Subscription  →  Expected invoice  →  Actual invoice  →  Payment
                        ↓                    ↓             ↓
                        └──────────  Reconciliation  ──────┘
                                            ↓
                                       Exception
                                            ↓
                                       Resolution
                                            ↓
                                      Audit trail
```

**The single invariant the whole design serves:**

> No financial obligation and no payment may become invisible to Finance.

Everything below is subordinate to that. Where resilience and elegance
conflict, resilience wins. Where automation and visibility conflict, visibility
wins. An unautomated vendor that is tracked is a success; an automated vendor
whose automation stopped three weeks ago without anyone noticing is a failure,
even though it looks tidier.

### 1.1 Coverage, not automation percentage

The success metric is **financial coverage**, not the fraction of vendors with
custom connectors.

| Measure | Target |
| --- | --- |
| Vendors in the registry | 100% of vendors we pay |
| Active subscriptions with a billing schedule | 100% |
| Expected invoices with an explicit lifecycle state | 100% |
| Payments resolved to vendor + subscription + invoice, or to a classified exception | 100% |
| Vendors with API automation | as many as justify a connector, and no more |

A portal-only vendor is not a gap. It is `EXPECTED → MANUAL COLLECTION →
VERIFIED`, assigned to a named person, with an overdue clock. The gap is a
vendor that is `UNKNOWN`.

---

## 2. Architecture review: what exists today

Read before designing. The existing codebase is the source of truth for
conventions, and most of what this system needs already has a Fynix pattern.

### 2.1 Deployment topology

Two hosts, one repository, one database.

| | Vercel (`fynix.digital`) | Droplet (`api.fynix.digital`) |
| --- | --- | --- |
| Serves | marketing site, `/admin` console | `/api/pavel/*`, `/api/admin/data/*` |
| Database | none (`getDb()` returns null) | Postgres on localhost |
| Secrets | admin credential, session secret, proxy secret | everything else |
| Deploy | Vercel on push to `main` | GitHub Actions SSH + `systemctl restart fynix-api` |
| `ADMIN_UI_DISABLED` | unset | `true`, so `/admin` 404s there |

The rule established in the 2026-08-18 spec and still correct: **if it touches
the database, a secret, or a schedule, it runs on the droplet.**

### 2.2 Patterns this system will reuse rather than reinvent

| Need | Existing pattern | Where |
| --- | --- | --- |
| Console reads droplet data | `hasLocalDb()` branch, else `adminGatewayFetch()` with `x-admin-proxy-secret` | [gateway.ts](../../lib/admin/gateway.ts) |
| Console mutates droplet data | `mutateX()` in `lib/admin/`, POST to `/api/admin/data/X` | [sessions.ts:163](../../lib/admin/sessions.ts) |
| Droplet route guard | `verifyProxySecret()` → bare 404; `hasLocalDb()` → 503 | [registrations route](../../app/api/admin/data/registrations/route.ts) |
| Operator session | HMAC-signed cookie, 12h TTL, re-checked inside every server action | [auth.ts](../../lib/admin/auth.ts) |
| Idempotent side effect | claim a unique row BEFORE acting, release on failure | [dispatch.ts](../../lib/email/dispatch.ts) |
| Gapless serial allocation | counter row locked `FOR UPDATE` inside the issuing transaction | [invoiceNumber.ts](../../lib/pavel/invoiceNumber.ts) |
| Non-fatal side effect with self-heal | `issueInvoiceForRegistration` never throws; `backfillMissingInvoices` runs on the timer | [invoice.ts](../../lib/pavel/invoice.ts) |
| Bounded retry with backoff | `withRetry`, 3 attempts, `RETRY_DELAY_MS * attempt`, unique-violation short-circuits | [invoice.ts:36](../../lib/pavel/invoice.ts) |
| Deadline evaluated at read time, not flipped by a job | `registrationsCloseAt` compared in `deriveRegistrationWindow` | [schema.ts:321](../../lib/db/schema.ts) |
| Legal record | snapshot buyer and seller onto the row; never join at render | `invoices` table |
| Money | `integer` minor units, never a formatted string | `amountCharged`, `invoices.*` |
| Cron authorisation | constant-time `Bearer` compare, closed when unset | [reminders route](../../app/api/pavel/cron/reminders/route.ts) |
| Cron shape | one GET, self-heal steps first, each `.catch()`-wrapped to a safe default, structured JSON summary | same |
| Health probe | `/api/health` returns 503 unless Postgres answers; `integrations` as booleans, never secrets | [health route](../../app/api/health/route.ts) |
| CSV export | `csvCell` with formula-injection neutralisation | [csv.ts](../../lib/admin/csv.ts) |
| PDF render | `@react-pdf/renderer` to a buffer | [invoicePdf.ts](../../lib/pavel/invoicePdf.ts) |
| Console visual language | `--console-surface`, status tokens, `Card`/`Badge`/`StatTile`/`Drawer` | [DESIGN.md §13](../../DESIGN.md) |
| Tests | vitest, node env, `lib/**/*.test.ts`, exact-value assertions on money | [vitest.config.mts](../../vitest.config.mts) |

That table is the answer to "what can be reused": nearly everything. This
system introduces no new framework, no new auth model, no new deployment
target, and no new UI kit.

### 2.3 Gaps: what the codebase does not have

| Gap | Impact | Resolution |
| --- | --- | --- |
| **No object storage.** No `@aws-sdk/client-s3`, no R2 binding, no upload path anywhere. | Cannot store a document at all. | New `lib/finance/storage.ts` + `@aws-sdk/client-s3`. First real dependency this project adds. |
| **No inbound file upload.** Every existing route accepts JSON. | Manual upload has no precedent to copy. | New droplet route with a signed upload ticket (§5.4). |
| **No outbound mailbox reading.** Brevo is send-only. | Email ingestion is entirely new. | New worker, `imapflow`. |
| **Cron trigger is undocumented.** No `crons` in `vercel.json`, no systemd unit in the repo. The reminders route is invoked by something configured outside version control. | A schedule nobody can see is a schedule nobody can verify. The directive forbids it. | Document the existing trigger in the runbook, add finance timers to the same mechanism, and add a **scheduler heartbeat** so a cron that stops is itself an exception (§6.3). |
| **No audit log.** Operator actions leave no trace beyond `console.error`. | "Who replaced this invoice?" is unanswerable. | New append-only `finance_audit_events`. |
| **Single shared admin credential.** One `ADMIN_EMAIL` / `ADMIN_PASSWORD`, no user table. | Every audit row would read "the admin". | Accepted for Phase 1, with the limitation recorded and the `actor` column present from day one. See security-model.md §6. |
| **No structured logging.** `console.log`/`console.error` with ad-hoc prefixes. | Connector health cannot be derived from logs. | Health is derived from **database state**, not from logs (§6.1). Logs stay as they are. |
| **In-memory rate limiter only.** | Fine: the droplet is one process, which the existing code already documents. | Reuse as-is. |

---

## 3. Target architecture

### 3.1 Component map

```
                     VERCEL (fynix.digital)
  ┌──────────────────────────────────────────────────────┐
  │  /admin/finance                                      │
  │    Cycle · Attention · Vault · Registry              │
  │    server actions → lib/admin/finance/*              │
  └────────────────────────┬─────────────────────────────┘
                           │ adminGatewayFetch
                           │ x-admin-proxy-secret
                           ▼
                     DROPLET (api.fynix.digital)
  ┌──────────────────────────────────────────────────────┐
  │  /api/admin/data/finance/*     read + mutate         │
  │  /api/finance/upload           signed-ticket upload  │
  │  /api/finance/cron             scheduled work        │
  ├──────────────────────────────────────────────────────┤
  │  lib/finance/                                        │
  │    ledger.ts       open periods, attach, close       │
  │    ingest/mail.ts  IMAP worker                       │
  │    ingest/http.ts  follow invoice links              │
  │    extract/        classify → extract → validate     │
  │    connectors/     one module per vendor             │
  │    exceptions.ts   raise / dedupe / resolve          │
  │    health.ts       connector + platform health       │
  │    storage.ts      R2 put/get, key derivation        │
  │    audit.ts        append-only event writer          │
  ├──────────────────────────────────────────────────────┤
  │  Postgres (localhost)          Cloudflare R2         │
  └──────────────────────────────────────────────────────┘
```

Nothing about the topology is new. `/admin/finance` is a third console section
beside the event dashboards; `/api/admin/data/finance/*` is a third family of
internal routes beside `registrations` and `operations`.

### 3.2 The two primary data flows

**Flow A: an invoice arrives.**

```
source (IMAP | connector | manual upload)
  → normalise to a candidate artifact (bytes + provenance)
  → sha256
  → dedupe on (vendor, sha256) and on (source, source_ref)
        already known → link to the existing document, stop
  → put to R2 at a key derived from vendor + received date + hash
  → INSERT finance_documents (review_state = 'unvalidated')
  → classify: is this an invoice/receipt at all?
  → extract fields
  → validate: schema → arithmetic → currency/date → expected amount
  → match to an open invoice_periods row
      matched + valid    → period = 'collected',    document = 'verified'
      matched + invalid  → period = 'pending_review', document = 'needs_review', raise EXTRACTION_ANOMALY
      unmatched          → document stays unattached, raise UNATTACHED_DOCUMENT
  → audit event
```

Every arrow after `put to R2` can fail without losing the document. The bytes
are stored and the row exists before anything tries to understand them. That
ordering is deliberate: an invoice we cannot parse is still an invoice we have.

**Flow B: a period comes due.**

```
cron (hourly)
  → for each active subscription: ensure the current period row exists   (idempotent)
  → for each period past expected_on and still 'expected':
        raise MISSING_INVOICE (deduped)
        after grace: escalate to owner_email via Brevo
  → for each connector due a poll: attempt, record health, back off on failure
  → heartbeat: record that the scheduler ran
```

`overdue` is **never written**. It is `status = 'expected' AND expected_on <
now()`, evaluated by whoever asks. This is the `registrationsCloseAt` pattern
from `webinar_sessions`, and the reason is identical: a cron that did not run
must not be able to make an overdue invoice look on time.

---

## 4. Critique of the prior spec

The directive asks for each departure as: current decision, risk, better
alternative, why, impact. Ten findings, ordered by severity.

### 4.1 "Objects are immutable" overstates what R2 provides

- **Current decision.** R2 is the system of record and "objects are immutable".
- **Risk.** R2 Bucket Locks prevent deletion and overwrite for a retention
  period, but they are **not** S3 compliance-mode WORM: there is no legal hold,
  no SEC 17a-4 certification, and an account administrator can remove a lock
  rule. Claiming immutability we do not have is worse than not claiming it,
  because it would be relied on in an audit.
- **Better alternative.** State the guarantee accurately and build it in layers:
  (1) keys are content-addressed, so a changed document is a different key and
  can never overwrite the original; (2) `invoice_documents.sha256` in Postgres
  is the tamper-evidence, and a verification job re-hashes objects and raises
  `DOCUMENT_HASH_MISMATCH`; (3) an append-only `finance_audit_events` table
  records every attach, replace and delete; (4) an R2 bucket lock with a
  seven-year retention prefix as defence in depth, documented as
  operational protection rather than regulatory immutability.
- **Why.** The audit story then rests on a hash chain in a database we control
  plus an append-only log, not on a vendor feature that does not do what the
  sentence implied.
- **Impact.** No schema change beyond what was already planned. One new
  verification job, one new exception kind, and honest wording in the runbook.

### 4.2 Anthropic, OpenAI, GitHub and Cloudflare were misclassified as email-only

- **Current decision.** Tier 3, "emailed receipt", no API.
- **Risk.** Wrong, and the error costs the system its best validation signal.
  These vendors expose cost and usage APIs (see connector-architecture.md §4 for
  endpoints and sources). Classifying them as email-only means the expected
  amount stays a number a human typed into the registry months ago, so amount
  validation degrades to comparing an invoice against a stale guess.
- **Better alternative.** Split the capability model along two axes rather than
  one: **document retrieval** and **amount attestation**. A vendor can support
  neither, either, or both. Anthropic, OpenAI, GitHub, Cloudflare and Vercel are
  `document: email` + `amount: api`.
- **Why.** It turns "does this invoice look about right" into "does this invoice
  agree with what the vendor's own API says we spent". That is a real
  correctness gate rather than a heuristic, and it is exactly the reconciliation
  pattern already used in `issueInvoiceForRegistration`, which refuses to issue
  when the computed total disagrees with what Razorpay charged.
- **Impact.** `ConnectorCapabilities` gains an axis. Roughly a day per
  attestation connector, and they are independently useful before any document
  connector exists.

### 4.3 The IMAP cursor design would silently lose mail

- **Current decision.** "Track the last seen UID; that is the whole state."
- **Risk.** Two defects. First, IMAP UIDs are only meaningful within a
  `UIDVALIDITY` generation. If the server reissues it (mailbox recreated,
  migrated, some providers on restore), a stored UID points at unrelated
  messages and the worker skips everything before it, permanently. Second, if
  the cursor advances before the document is durably in R2 and committed, a
  crash in between loses that message with no trace.
- **Better alternative.** Store `(uid_validity, last_uid)` as a pair and force a
  full resync when `uid_validity` changes. Advance the cursor only after commit.
  Most importantly, **demote the cursor to an optimisation**: the real
  idempotency key is `(message_id, sha256)` on `invoice_documents`, so
  reprocessing a message is a no-op and the recovery for any doubt is to widen
  the window and re-scan. A cursor that is merely a performance hint cannot
  cause data loss.
- **Why.** Cheap-to-repeat plus impossible-to-duplicate beats a cursor that must
  be perfect.
- **Impact.** One extra unique constraint and a `mailbox_state` table with two
  more columns. No added complexity in the happy path.

### 4.4 The ledger status enum conflates state with time and with document quality

- **Current decision.** `expected | collected | reviewed | overdue | waived |
  unmatched | cancelled` on `invoice_periods`.
- **Risk.** `overdue` is a function of time, so storing it requires a job to
  keep it true, and a job that fails makes overdue invoices look current. That
  is precisely the silent failure this system exists to prevent. `reviewed`
  and `unmatched` are properties of a *document*, not of a period.
- **Better alternative.** Stored period status is `expected | pending_review |
  collected | waived | cancelled`. `overdue` is derived. Document quality lives
  on `invoice_documents.review_state`.
- **Why.** It follows the existing `registrationsCloseAt` reasoning, and it
  keeps the CFO's outstanding count honest: a document that arrived but failed
  validation is `pending_review`, which is not collected.
- **Impact.** Simpler cron, one fewer way to be wrong.

### 4.5 Nothing handled an invoice arriving before its period exists

- **Current decision.** `period_id` nullable, with no stated behaviour.
- **Risk.** The first invoice from a tool nobody registered has nowhere to go.
  That is the exact failure mode the product exists to eliminate, sitting
  unhandled in the design.
- **Better alternative.** An unattached document is a first-class state, and it
  raises an exception: `UNKNOWN_VENDOR` when the sender matches no vendor,
  `UNATTACHED_DOCUMENT` when the vendor is known but no period fits. A matching
  pass runs on every cron tick and attaches retroactively when a period appears.
  An operator can attach one by hand, and attaching creates the subscription if
  it is genuinely new.
- **Why.** The unregistered purchase is the most valuable thing this system can
  catch, so it must be a designed path rather than a null column.
- **Impact.** One exception kind, one matching pass, one console affordance.

### 4.6 A single amount tolerance is meaningless for usage-billed vendors

- **Current decision.** Compare the extracted total against
  `expected_amount_minor` "within tolerance".
- **Risk.** AWS, Vercel, Cloudflare and the AI APIs are usage-billed. A fixed
  tolerance produces either constant false positives, which trains everyone to
  ignore the review queue, or a tolerance so wide it detects nothing.
- **Better alternative.** `variance_policy` per subscription:
  `fixed` (tight absolute or percentage band), `seat_based` (expected = seats ×
  unit price, so a mismatch means the seat count changed, which is worth
  knowing), `usage` (no absolute assertion; flag on deviation from a trailing
  three-period mean, and reconcile against the vendor's cost API where §4.2
  gives us one).
- **Why.** Different obligations have different notions of "wrong". One
  threshold cannot express three.
- **Impact.** One enum column, three small validator branches.

### 4.7 "LLM extraction rather than per-vendor regex" was framed as either/or

- **Current decision.** Send every PDF to a model.
- **Risk.** Non-determinism where determinism is available and free. A
  DigitalOcean invoice CSV has exact line items. A connector-fetched invoice
  arrives with structured metadata alongside the PDF. Sending those to a model
  adds cost, latency and a failure mode in exchange for nothing.
- **Better alternative.** A cascade: structured source data when the channel
  provides it, then a deterministic parser where one exists and is cheap, then
  the model as the general fallback. **The validation gate is identical for all
  three,** and no path may mark a period collected without passing it.
- **Why.** The directive's own framing: AI should make the system more
  adaptable, not less deterministic. Determinism where it is free, adaptability
  where it is needed.
- **Impact.** The extractor becomes a small strategy list instead of one call.

### 4.8 Manual upload through Vercel will fail on larger files

- **Current decision.** Drag and drop in the console, unspecified transport.
- **Risk.** The console is on Vercel. A Vercel serverless function has a request
  body limit around 4.5 MB. A scanned or multi-page invoice exceeds it, and the
  failure arrives as an opaque platform error at the moment an operator is
  trying to close the month.
- **Better alternative.** The browser uploads **directly to the droplet**, not
  through Vercel. The console mints a short-lived HMAC upload ticket bound to
  the period id, size limit, expiry and operator session; the droplet route
  verifies the ticket and streams to R2. Requires extending the CORS allowlist
  in [middleware.ts](../../middleware.ts) from `/api/pavel/*` to include
  `/api/finance/upload`.
- **Why.** The file never transits a host with a body limit, and the ticket
  keeps the droplet route unauthenticated-by-cookie while still being
  authorised, which is the same shape as the existing form-token scheme.
- **Impact.** One new route, one middleware matcher change, one ticket helper
  modelled on `lib/security/honeypot.ts`.

### 4.9 Health was described but not made observable

- **Current decision.** "Connector degraded", "heartbeat detects it".
- **Risk.** No mechanism. Health derived from logs is not health, because
  nothing reads logs on a schedule.
- **Better alternative.** Health is **database state**: a `connector_state` row
  per (vendor, channel) carrying `last_success_at`, `last_attempt_at`,
  `consecutive_failures`, `state`, `next_attempt_at`, `last_error`. Rows are
  written by the workers themselves and read by `/api/health` and by the console.
  A connector whose `last_success_at` is older than its expected interval is
  degraded regardless of what any log says.
- **Why.** It makes "everything looked fine because nobody noticed automation
  had stopped" structurally impossible: the absence of a recent success is
  itself a positive signal, visible on the same screen as everything else.
- **Impact.** One table, one health function, extends the existing
  `/api/health` payload which the uptime workflow already probes.

### 4.10 Exceptions would be re-raised on every tick

- **Current decision.** Exceptions as first-class objects, no dedupe rule.
- **Risk.** An hourly cron raising `MISSING_INVOICE` for the same period
  produces hundreds of rows a week. A noisy queue is an ignored queue.
- **Better alternative.** A `dedupe_key` per exception plus a **partial unique
  index** on `(kind, dedupe_key)` where `status` is open or acknowledged. Raising
  an existing exception bumps `last_seen_at` and `occurrences` instead of
  inserting. Resolving frees the key so a genuine recurrence next month opens a
  new one.
- **Why.** Same mechanism as `email_log`'s unique constraint: let the database
  enforce once-ness rather than trusting application logic to check first.
- **Impact.** One index, one upsert helper.

### 4.11 What survives unchanged

Registry as the spine; expected-invoice ledger; multi-channel collection with
manual as a first-class path; R2 as system of record with FY-prefixed
human-readable keys; SHA-256 dedupe; GST and `gstin_on_file` as a money-leak
signal; payment-method tracking; automated per-owner chasing; the refusal to
store vendor passwords or default to browser automation; the phase order.

---

## 5. Key design decisions

### 5.1 Where each component runs

| Component | Host | Reason |
| --- | --- | --- |
| Registry, ledger, extraction, matching, exceptions | Droplet | database, secrets, schedule |
| IMAP worker | Droplet | long-lived, holds mailbox credentials |
| Connectors | Droplet | hold vendor tokens |
| R2 writes | Droplet | holds the R2 key |
| Cron | Droplet | same trigger as the reminders timer |
| Console `/admin/finance` | Vercel | it is the console; reads through the gateway |
| Document download for an operator | Vercel route streaming from droplet | mirrors `app/api/admin/invoice/[ref]/route.ts` |
| Document upload from an operator | Browser → droplet directly | §4.8 |

### 5.2 Storage

R2 as system of record, S3 API via `@aws-sdk/client-s3`.

```
invoices/FY2026-27/2026-08/digitalocean/2026-08-31--a1b2c3d4e5f6.pdf
statements/FY2026-27/2026-08/hdfc-corporate-4471--e5f6a7b89c01.csv
```

The trailing twelve hex characters are the first six bytes of the SHA-256. Two
different documents cannot collide, and the key is derivable from what is known
at write time and nothing else.

**The key deliberately does not contain the vendor's invoice number, and its
date is the date the document was received rather than the period it bills
for.** Both are only known after extraction, which by design runs *after*
storage: a document we cannot parse must still be a document we hold. A key
that depended on extraction would either force a copy-and-delete rename, which
destroys content-addressing and immutability at once, or force extraction ahead
of storage, which loses unparseable documents entirely. Neither is acceptable,
so the key is built from the vendor slug, the received date and the hash.

The consequence is that the **bucket** is organised by arrival and the
**export** is organised by period. That is the right way round: the CA consumes
the generated month-end ZIP, which the manifest orders by period, while the
bucket only has to be navigable by a person with an S3 client and no code.

**Idempotency comes from the database, not from key collision.** The write path
is: hash the bytes, look up `(vendor, sha256)`, and stop if it exists. Only a
genuinely new document is put. A crash between the put and the insert leaves an
orphan object, which the next run re-derives to the identical key and reuses.

Mirroring to OneDrive or Drive is Phase 4, one-way, and explicitly not
authoritative. If the mirror fails, the system is unaffected and one exception
is raised.

### 5.3 The GST layer

Carried forward from the prior spec, unchanged in substance, because it is the
part that pays for the build:

- Foreign SaaS is OIDAR at 18% IGST on reverse charge: self-assess, pay through
  GSTR-3B 3.1(d), reclaim in 4(A)(3).
- **`vendors.gstin_on_file = false` is a standing cash leak.** Without our GSTIN
  the vendor charges 18% under its own non-resident registration and that tax is
  not reclaimable. It gets a permanent exception kind, `GSTIN_MISSING`.
- Import of services is excluded from GSTR-2B matching, so for foreign vendors
  the invoice document itself is the primary ITC evidence. That is the
  compliance argument for the archive and for §4.1's honesty about it.
- `vendor_kind` of `domestic` or `import` splits the month-end export, because
  domestic invoices must reconcile against GSTR-2B and imports must not.

### 5.4 Authorisation model

Three distinct authorities, none reused for another purpose, following the
existing rule that the form-token secret is deliberately not the session secret:

| Authority | Secret | Guards |
| --- | --- | --- |
| Operator session | `ADMIN_SESSION_SECRET` | `/admin/finance` and every server action |
| Console → droplet | `ADMIN_PROXY_SECRET` | `/api/admin/data/finance/*` |
| Upload ticket | `FINANCE_UPLOAD_SECRET` | `/api/finance/upload` |
| Scheduler | `CRON_SECRET` | `/api/finance/cron` |

Full detail in security-model.md.

---

## 6. Observability

### 6.1 Health is state, not logs

Three levels, all read from the database:

1. **Connector health** per (vendor, channel), from `connector_state`.
2. **Platform health**: database, R2 reachable, mailbox cursor advancing,
   scheduler heartbeat fresh, extraction queue not backing up.
3. **Financial completeness**: expected vs collected for the open cycle, open
   exceptions by severity. This is the CFO's number and the one that matters.

`/api/health` gains a `finance` block, so the existing uptime workflow that
already greps for `"db":"up"` can be extended without new infrastructure.

### 6.2 Every automated action leaves a row

`finance_audit_events` is append-only, written by both workers and operators.
No update, no delete. See data-model.md §9.

### 6.3 The scheduler watches itself

A cron that stops running produces no error, which makes it the single most
dangerous component. So the cron writes a heartbeat on every run, and *the
health endpoint* raises `SCHEDULER_STALLED` when the newest heartbeat is older
than twice the expected interval. The check lives outside the thing being
checked, which is the same reasoning that puts the uptime workflow on GitHub's
infrastructure rather than on the droplet.

---

## 7. What this deliberately does not do

- **No browser automation, and no stored vendor passwords.** See
  security-model.md §5 for the full argument and the exception process. Adobe,
  Meta Ads and Amazon Business stay on the tracked manual path.
- **No accounting system.** This is a control and custody layer. Tally or Zoho
  Books remain the books; the month-end export is the interface to them.
- **No approval workflow.** These are already-committed recurring subscriptions,
  not purchase requisitions. Adding approvals would be a different product.
- **No new auth model in Phase 1.** The shared admin credential is a known
  limitation, recorded rather than silently accepted.
- **No vendor connector without a business case.** Connectors are built in
  descending order of spend, not of technical interest.

---

## 8. Documents in this set

| File | Holds |
| --- | --- |
| architecture.md | this file: review, gaps, target architecture, critique, decisions |
| [data-model.md](data-model.md) | every table, column, index, constraint, state machine |
| [connector-architecture.md](connector-architecture.md) | capability model, interface, per-vendor research with sources, adding a vendor |
| [failure-recovery.md](failure-recovery.md) | failure matrix, retry and backoff policy, the 22-question self-critique |
| [security-model.md](security-model.md) | secrets, least privilege, audit, threat model, admin-access policy |
| [operations-runbook.md](operations-runbook.md) | Phase 0 vendor checklist, month-end close, what to do when each thing breaks |
| [implementation-plan.md](implementation-plan.md) | files, routes, workers, env vars, migrations, tests, rollout, rollback |
