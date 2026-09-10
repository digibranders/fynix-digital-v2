# Fynix Spend & Invoice Control: data model

Companion to [architecture.md](architecture.md). Every table, column, index,
constraint, relationship and state machine.

---

## 1. Naming, and one dangerous collision

**Every table is prefixed `finance_`.**

The repository already has an `invoices` table. It means *tax invoices Fynix
issues to workshop buyers*: outbound, GST-compliant, gapless serial, snapshotted
seller and buyer. This system is about *invoices vendors issue to Fynix*:
inbound, arbitrary formats, no serial we control.

Two tables called some variant of "invoice", meaning opposite directions of
money, in one schema, queried by the same console, is how someone eventually
reconciles the wrong set. The prefix is not decoration. It also groups the whole
subsystem alphabetically in `psql \dt`, which matters once the schema has twenty
tables.

For the same reason the inbound artifact is called a **document**, never an
invoice, in code and in column names.

## 2. Conventions inherited from `lib/db/schema.ts`

- `uuid("id").primaryKey().defaultRandom()`.
- Money is `integer`, in the currency's **minor unit** (paise, cents). Never a
  formatted string, never a float. Matches `registrations.amountCharged`.
- Currency is `text`, ISO 4217 uppercase.
- Timestamps are `timestamp({ withTimezone: true })`.
- `createdAt` defaults `defaultNow()`.
- Enum-like columns are `text` with the permitted values in a trailing comment
  and a check constraint in the migration. The existing schema uses bare `text`
  (`status`, `supplyType`); check constraints are added here because these
  values drive money decisions and a typo must fail loudly.
- Comments explain **why**, not what.

## 3. Entity relationships

```
finance_payment_methods ──┐
                          │
finance_vendors ──────────┴──< finance_subscriptions ──< finance_invoice_periods
      │                                                          │
      │                                                          │ 0..1
      ├──< finance_documents >───────────────────────────────────┘
      │            │
      │            └──< finance_document_payments >──┐
      │                                              │
      └──< finance_payments ─────────────────────────┘
                   │
finance_exceptions ─┴─ (polymorphic subject: vendor / subscription / period / document / payment)

finance_connector_state    (vendor, channel)
finance_mailbox_state      (mailbox)
finance_audit_events       append-only
finance_scheduler_runs     heartbeat
```

---

## 4. `finance_vendors`

One row per company we pay. Not per product: Google Workspace and Google Ads
share a vendor and differ by subscription.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `slug` | text **unique** notNull | `digitalocean`, stable, used in R2 keys |
| `name` | text notNull | `DigitalOcean` |
| `legalName` | text | as it appears on the invoice, when it differs |
| `category` | text notNull | `cloud` `ai` `devtools` `design` `ads` `comms` `finance` `other` |
| `ownerTeam` | text | default owner, overridable per subscription |
| `vendorKind` | text notNull | `domestic` \| `import`. Drives GST treatment and the month-end split |
| `country` | text | ISO 3166-1 alpha-2 |
| `gstinOnFile` | boolean notNull default false | **our** GSTIN registered in the vendor's billing settings |
| `gstinOnFileCheckedAt` | timestamptz | when a human last verified it. A stale true is worth knowing about |
| `vendorGstin` | text | the vendor's own GSTIN, domestic vendors only |
| `billingEmailDomains` | text[] notNull default `{}` | sender domains that identify this vendor's mail |
| `billingEmailAddresses` | text[] notNull default `{}` | exact senders, when a domain is too broad (`billing@`, `invoice+noreply@`) |
| `documentChannel` | text notNull | `api` \| `email` \| `portal_manual`. How the PDF is obtained |
| `amountChannel` | text notNull default `'none'` | `api` \| `none`. Whether the vendor attests the amount independently. See architecture.md §4.2 |
| `connectorKey` | text | module key in `lib/finance/connectors/`, null when there is no connector |
| `portalUrl` | text | where a human goes for `portal_manual` |
| `notes` | text | |
| `active` | boolean notNull default true | |
| `createdAt` / `updatedAt` | timestamptz notNull | |

**Indexes**
- `unique(slug)`
- `index(active, category)` for the registry view
- `index USING gin (billing_email_domains)` for sender matching on every inbound
  message. A sequential scan per email is fine at fifty vendors and not fine at
  five hundred, and the directive asks for the latter.

**Why `documentChannel` and `amountChannel` are separate.** They answer
different questions and a single `collectionMethod` column cannot express
"Anthropic emails the receipt but its Admin API tells us the true spend". That
misclassification is finding §4.2.

---

## 5. `finance_payment_methods`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `label` | text notNull | `HDFC corporate card 4471` |
| `kind` | text notNull | `card` \| `bank` \| `upi` \| `paypal` \| `wallet` |
| `last4` | text | **only** the last four. Never a PAN, never an expiry, never a CVV. See security-model.md §4 |
| `holder` | text | |
| `currency` | text | the account's own currency, for FX-difference detection |
| `active` | boolean notNull default true | |
| `createdAt` | timestamptz notNull | |

No sensitive card data is stored, so this table needs no special handling beyond
the ordinary. That is a deliberate constraint, not an oversight: `last4` is
enough to reconcile a statement line, and storing more would put this system in
PCI scope for no gain.

---

## 6. `finance_subscriptions`

One row per distinct recurring obligation.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `vendorId` | uuid notNull → vendors, `onDelete: restrict` | a vendor with history cannot be deleted |
| `name` | text notNull | `Google Workspace (12 seats)` |
| `billingCycle` | text notNull | `monthly` \| `annual` \| `quarterly` \| `usage` |
| `cycleAnchorDay` | integer | 1 to 28. See §6.1 |
| `cycleAnchorMonth` | integer | 1 to 12, annual only |
| `expectedAmountMinor` | integer | null for `usage` |
| `currency` | text notNull | |
| `variancePolicy` | text notNull default `'fixed'` | `fixed` \| `seat_based` \| `usage`. Finding §4.6 |
| `varianceToleranceBp` | integer notNull default 100 | basis points, so 100 = 1%. Integer keeps money logic float-free |
| `seatCount` | integer | `seat_based` only |
| `unitAmountMinor` | integer | `seat_based` only; expected = seats × unit |
| `gracePeriodDays` | integer notNull default 5 | how long past `expectedOn` before `MISSING_INVOICE` is raised |
| `paymentMethodId` | uuid → payment_methods, `onDelete: set null` | |
| `ownerTeam` | text notNull | |
| `ownerEmail` | text notNull | who gets chased. notNull on purpose: an unowned subscription is `SUBSCRIPTION_WITHOUT_OWNER` |
| `startedOn` | date notNull | |
| `cancelledOn` | date | no periods are opened on or after this date |
| `autoRenews` | boolean notNull default true | |
| `renewalOn` | date | annual renewals, drives `RENEWAL_APPROACHING` |
| `sourceConfidence` | text notNull default `'declared'` | `declared` (a human entered it) \| `observed` (inferred from a payment or an invoice). An observed subscription needs confirming |
| `active` | boolean notNull default true | |
| `notes` | text | |
| `createdAt` / `updatedAt` | timestamptz notNull | |

**Indexes**
- `index(active, vendor_id)`
- `index(cancelled_on)` for the period-opening sweep

### 6.1 Why `cycleAnchorDay` is capped at 28

A subscription anchored to the 31st has no period in February. Rather than
special-case month-end arithmetic in the ledger, the registry constrains the
anchor and the UI explains it. A vendor that genuinely bills on the last day of
the month is modelled as anchor 28 with a five-day grace, which lands in the
right window without needing calendar arithmetic that is wrong twice a year.

---

## 7. `finance_invoice_periods`, the ledger

The most important table in the system. One row per subscription per billing
period, created before the invoice is expected.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `subscriptionId` | uuid notNull → subscriptions, `onDelete: restrict` | |
| `periodStart` | date notNull | |
| `periodEnd` | date notNull | |
| `expectedOn` | date notNull | when the invoice should exist by |
| `status` | text notNull default `'expected'` | `expected` \| `pending_review` \| `collected` \| `waived` \| `cancelled` |
| `expectedAmountMinor` | integer | snapshot of the subscription's expectation at open time |
| `currency` | text notNull | snapshot |
| `variancePolicy` | text notNull | snapshot |
| `varianceToleranceBp` | integer notNull | snapshot |
| `documentId` | uuid → documents, `onDelete: set null` | the document that satisfies this period |
| `collectedAt` | timestamptz | |
| `chaseCount` | integer notNull default 0 | |
| `lastChasedAt` | timestamptz | |
| `waivedReason` | text | required when `status = 'waived'` |
| `assignedTo` | text | overrides the subscription owner for this period |
| `createdAt` / `updatedAt` | timestamptz notNull | |

**Constraints**
- `unique(subscription_id, period_start)`: **the idempotency guarantee.** A
  cron that runs twice, or two workers racing, hit this and no-op. Same
  mechanism as `email_log`'s `unique(registration_id, type)`.
- `check (period_end >= period_start)`
- `check (status <> 'waived' or waived_reason is not null)`
- `check (status <> 'collected' or document_id is not null)`

**Indexes**
- `index(status, expected_on)`: the outstanding query, which is the console's
  default screen and the cron's main sweep
- `index(subscription_id, period_start desc)`
- `index(document_id)`

### 7.1 Why the expectation is snapshotted

`expectedAmountMinor`, `currency` and both variance columns are copied from the
subscription when the period opens. Editing the subscription later must not
retroactively change whether a closed period passed validation. This is the same
reasoning that snapshots seller and buyer onto `invoices`: a record of a moment
must reproduce as it was.

### 7.2 Status machine

```
                    ┌──────────────────────────────────────────┐
                    │                                          │
  (cron opens) → expected ──attach valid doc──→ collected ──────┤
                    │  │                            │          │
                    │  └──attach invalid doc──→ pending_review  │
                    │                               │          │
                    │        (fixed or overridden) ─┘          │
                    │                                          │
                    ├──operator waives──→ waived ──────────────┤
                    │                                          │
                    └──subscription cancelled──→ cancelled ────┘
                                                               │
                       (document detached / rejected) ─────────┘
                                    ↓
                                 expected
```

**`overdue` is not in this machine.** It is derived:

```sql
status = 'expected' AND expected_on + grace_period_days < current_date
```

Storing it would need a job to keep it true, and a job that fails would make an
overdue invoice look current. `webinar_sessions.registrationsCloseAt` already
established this pattern in the codebase for exactly this reason.

`pending_review` exists so the CFO's "collected" count cannot be inflated by a
document that arrived but failed validation.

---

## 8. `finance_documents`

The artifact and what was read out of it.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `vendorId` | uuid → vendors, `onDelete: restrict` | null while unidentified |
| `periodId` | uuid → invoice_periods, `onDelete: set null` | null while unattached |
| **Provenance** | | |
| `source` | text notNull | `email` \| `api` \| `manual` \| `mirror_import` |
| `sourceRef` | text | IMAP Message-ID, vendor invoice id, or the uploading operator |
| `sourceReceivedAt` | timestamptz | when the mail arrived or the API listed it, not when we processed it |
| **Storage** | | |
| `r2Key` | text notNull unique | content-addressed, see architecture.md §5.2 |
| `sha256` | text notNull | hex, lowercase |
| `mime` | text notNull | |
| `bytes` | integer notNull | |
| `pageCount` | integer | null for non-PDF |
| **Extraction** | | |
| `reviewState` | text notNull default `'unvalidated'` | `unvalidated` \| `verified` \| `needs_review` \| `rejected` |
| `extractionMethod` | text | `structured` \| `deterministic` \| `model` |
| `extractionConfidence` | integer | 0 to 100. Integer, not float |
| `extractionNotes` | text | which validator failed, in words |
| `documentKind` | text | `invoice` \| `receipt` \| `credit_note` \| `statement` \| `not_a_document` |
| `invoiceNumber` | text | the vendor's, not ours |
| `invoiceDate` | date | |
| `periodStartExtracted` | date | what the document itself claims, distinct from the ledger period |
| `periodEndExtracted` | date | |
| `currency` | text | |
| `subtotalMinor` | integer | |
| `taxMinor` | integer | |
| `totalMinor` | integer | |
| **Tax** | | |
| `taxKind` | text | `igst_rcm` \| `gst_charged` \| `vat` \| `none` |
| `buyerGstinPresent` | boolean | drives the `GSTIN_MISSING` signal from evidence rather than from a stale flag |
| `vendorGstinExtracted` | text | |
| **Lifecycle** | | |
| `supersedesDocumentId` | uuid → documents | a corrected reissue points at what it replaces. Nothing is ever overwritten |
| `createdAt` | timestamptz notNull | |
| `validatedAt` | timestamptz | |

**Constraints**
- `unique(r2_key)`
- `unique(sha256, vendor_id)`: the real dedupe. Scoped by vendor rather than
  global, because two vendors on the same billing platform can legitimately
  produce byte-identical zero-value receipts, and a global unique would drop the
  second one.
- **Partial unique on `sha256` where `vendor_id IS NULL`.** Without it the
  constraint above does nothing for unidentified documents: Postgres treats
  NULLs as distinct, so every re-scan of an unknown-vendor message would insert
  another row and the `UNKNOWN_VENDOR` queue would fill with copies of one
  document. `NULLS NOT DISTINCT` (Postgres 15+) would also serve; two explicit
  indexes are chosen because the intent stays legible in `\d` output.
- `unique(source, source_ref)` where `source_ref is not null` (partial): a
  retried IMAP message or a re-listed API invoice cannot create a second row.
  **This, not the mailbox cursor, is what makes ingestion idempotent.** Finding
  §4.3.
- `check (review_state <> 'verified' or total_minor is not null)`

**What `sourceRef` holds, per source.** It must be unique per artifact, or the
constraint above is worse than useless:

| `source` | `sourceRef` |
| --- | --- |
| `email` | the RFC 5322 `Message-ID` |
| `api` | the vendor's own invoice id |
| `manual` | **the upload ticket nonce**, never the operator |

The manual case is the one that bites. If `sourceRef` held the uploading
operator's identity, one operator uploads many documents and the partial unique
would reject every upload after their first. The ticket nonce is unique per
upload by construction (security-model.md §6.2), and *who* uploaded is recorded
in `finance_audit_events`, which is where actor information belongs.

**Indexes**
- `index(vendor_id, invoice_date desc)` for the vault
- `index(review_state)` where `review_state = 'needs_review'` (partial) for the
  attention queue
- `index(period_id)`
- `index(sha256)`

### 8.1 Why extracted values are never written back to the period

The period holds the *expectation*; the document holds the *claim*. Comparing
them is the validation, and collapsing them into one place would destroy the
ability to compare. The variance is recomputed on read, so correcting an
extraction re-derives it rather than needing a repair job.

---

## 9. `finance_exceptions`

Anomalies as first-class objects, never buried in logs.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `kind` | text notNull | see §9.1 |
| `severity` | text notNull | `critical` \| `high` \| `medium` \| `low` |
| `dedupeKey` | text notNull | stable per underlying condition, e.g. `period:<uuid>` |
| `status` | text notNull default `'open'` | `open` \| `acknowledged` \| `resolved` \| `suppressed` |
| `summary` | text notNull | one line an operator can act on |
| `detail` | text | |
| `vendorId` / `subscriptionId` / `periodId` / `documentId` / `paymentId` | uuid, all nullable | whichever apply |
| `occurrences` | integer notNull default 1 | |
| `firstSeenAt` / `lastSeenAt` | timestamptz notNull | |
| `assignedTo` | text | |
| `resolvedAt` | timestamptz | |
| `resolutionNote` | text | |
| `resolvedBy` | text | |
| `suppressedUntil` | timestamptz | snooze without pretending it is fixed |

**Constraints**
- Partial unique index on `(kind, dedupe_key)` `WHERE status IN ('open',
  'acknowledged')`: raising an existing condition bumps `occurrences` and
  `lastSeenAt` instead of inserting. Finding §4.10.
- `check (status <> 'resolved' or resolution_note is not null)`: closing an
  exception requires saying why. An audit trail of silent closures is not one.

**Indexes**
- `index(status, severity, last_seen_at desc)`

### 9.1 Exception kinds

| Kind | Severity | Raised when |
| --- | --- | --- |
| `MISSING_INVOICE` | high | period past `expectedOn + grace`, still `expected` |
| `OVERDUE_INVOICE` | critical | still `expected` at 2× grace, after chasing |
| `AMOUNT_VARIANCE` | high | extracted total outside the period's variance policy |
| `EXTRACTION_FAILURE` | medium | no strategy produced a parseable result |
| `EXTRACTION_ANOMALY` | medium | parsed, but arithmetic or schema validation failed |
| `DUPLICATE_DOCUMENT` | low | same hash, or same vendor invoice number, different bytes |
| `UNATTACHED_DOCUMENT` | high | vendor known, no period matched. Finding §4.5 |
| `UNKNOWN_VENDOR` | high | document or payment matches no vendor |
| `CONNECTOR_FAILURE` | high | connector exceeded `MAX_CONSECUTIVE_FAILURES` |
| `CONNECTOR_STALE` | high | no success within 2× the expected interval |
| `MAILBOX_FAILURE` | critical | IMAP unreachable, or cursor not advancing |
| `SCHEDULER_STALLED` | critical | newest heartbeat older than 2× the interval |
| `STORAGE_FAILURE` | critical | R2 put or get failed after retries |
| `DOCUMENT_HASH_MISMATCH` | critical | stored object no longer hashes to `sha256` |
| `GSTIN_MISSING` | high | `gstinOnFile = false`, or a document shows `buyerGstinPresent = false` for an import vendor |
| `SUBSCRIPTION_WITHOUT_OWNER` | medium | `ownerEmail` unusable, or chase mail bounced |
| `RENEWAL_APPROACHING` | low | annual renewal within 30 days |
| `UNMATCHED_PAYMENT` | high | payment resolves to no subscription (Phase 4) |
| `PAYMENT_WITHOUT_INVOICE` | high | payment matched, no document within the window (Phase 4) |
| `INVOICE_WITHOUT_PAYMENT` | medium | document collected, no payment within the window (Phase 4) |
| `DUPLICATE_PAYMENT` | critical | two payments, same vendor, same amount, same window (Phase 4) |
| `RECURRING_PAYMENT_DRIFT` | medium | usage subscription deviating from its trailing mean (Phase 4) |
| `MIRROR_FAILURE` | low | OneDrive mirror failed. Deliberately low: the mirror is not authoritative (Phase 4) |

---

## 10. `finance_connector_state`

Health as database state, not as a log line. Finding §4.9.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `vendorId` | uuid notNull → vendors, `onDelete: cascade` | |
| `channel` | text notNull | `document_api` \| `amount_api` \| `email` |
| `state` | text notNull default `'unknown'` | `healthy` \| `degraded` \| `failing` \| `disabled` \| `unknown` |
| `expectedIntervalMinutes` | integer notNull | what "stale" means for this connector |
| `lastAttemptAt` / `lastSuccessAt` / `lastFailureAt` | timestamptz | |
| `consecutiveFailures` | integer notNull default 0 | |
| `nextAttemptAt` | timestamptz | backoff gate. A connector is skipped until this passes |
| `circuitOpenedAt` | timestamptz | set when the breaker trips |
| `lastError` | text | **message only, never a token, never a full response body** |
| `recordsLastRun` | integer | |
| `authState` | text notNull default `'unknown'` | `ok` \| `expired` \| `revoked` \| `unconfigured` \| `unknown` |
| `updatedAt` | timestamptz notNull | |

**Constraints:** `unique(vendor_id, channel)`.

**Derived staleness:** `last_success_at < now() - expected_interval * 2`. Read
at query time, for the same reason `overdue` is.

---

## 11. `finance_mailbox_state`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `mailbox` | text notNull unique | `billing@fynix.digital` |
| `folder` | text notNull default `'INBOX'` | |
| `uidValidity` | text | **stored as text.** It is a 32-bit unsigned value and Postgres `integer` is signed; a provider near the top of the range would overflow |
| `lastUid` | text | same reasoning |
| `lastPollAt` / `lastSuccessAt` | timestamptz | |
| `consecutiveFailures` | integer notNull default 0 | |
| `messagesLastRun` | integer | |
| `fullResyncRequestedAt` | timestamptz | set when `uidValidity` changes, or by an operator |
| `updatedAt` | timestamptz notNull | |

**On `uidValidity` change the cursor is discarded and the folder is re-scanned
in full.** Reprocessing is harmless because `unique(source, source_ref)` on
documents absorbs it. The cursor is an optimisation, not a correctness
mechanism. Finding §4.3.

---

## 12. `finance_payments` (Phase 4)

Modelled now so Phase 4 does not require a redesign, migrated when built.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `paymentMethodId` | uuid → payment_methods | |
| `vendorId` | uuid → vendors | null until matched |
| `subscriptionId` | uuid → subscriptions | null until matched |
| `source` | text notNull | `statement_csv` \| `bank_api` \| `manual` |
| `sourceRef` | text | bank transaction id |
| `sourceRowHash` | text notNull | sha256 of the normalised source row; re-importing the same statement is a no-op |
| `chargedAt` | timestamptz notNull | |
| `amountMinor` | integer notNull | |
| `currency` | text notNull | |
| `descriptionRaw` | text notNull | the statement narration, kept verbatim for re-matching |
| `matchState` | text notNull default `'unmatched'` | `unmatched` \| `matched` \| `partial` \| `ignored` |
| `ignoredReason` | text | |
| `createdAt` | timestamptz notNull | |

**Constraints:** `unique(payment_method_id, source_row_hash)`.

### 12.1 `finance_document_payments`

Many-to-many, because an annual invoice is one payment and one card charge can
cover several invoices.

| Column | Type |
| --- | --- |
| `documentId` | uuid notNull → documents, cascade |
| `paymentId` | uuid notNull → payments, cascade |
| `allocatedMinor` | integer notNull |
| `matchedBy` | text notNull (`auto` \| operator) |
| `matchedAt` | timestamptz notNull |

Primary key `(document_id, payment_id)`.

---

## 13. `finance_audit_events`

Append-only. No update path, no delete path, no ORM helper that offers one.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `at` | timestamptz notNull defaultNow | |
| `actor` | text notNull | `system:cron`, `system:mail`, `system:connector:digitalocean`, or `operator:<session-ref>` |
| `actorIp` | text | operator actions only |
| `action` | text notNull | `vendor.create`, `document.attach`, `period.waive`, `exception.resolve`, … |
| `entityType` / `entityId` | text / uuid | |
| `before` / `after` | jsonb | changed fields only, never the whole row, never a secret |
| `summary` | text notNull | human-readable, so the log is readable without joins |

**Indexes:** `index(entity_type, entity_id, at desc)`, `index(at desc)`.

**On `actor`.** The console has one shared credential, so `operator:` cannot
name a person today. It carries a session reference, which at least distinguishes
sessions and pairs with `actorIp`. The column is correct from day one so that
adding named operators later fills it properly rather than requiring a
migration. Limitation recorded in security-model.md §6.

**Audited actions:** vendor and subscription create/update/deactivate; payment
method changes; document upload, attach, detach, supersede; period waive,
reassign, manual close; exception acknowledge, resolve, suppress; connector
configure, enable, disable, token rotate; statement import; export generation.

---

## 14. `finance_scheduler_runs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `job` | text notNull | `finance_cron` |
| `startedAt` / `finishedAt` | timestamptz | |
| `outcome` | text | `ok` \| `partial` \| `error` |
| `summary` | jsonb | the same object the route returns |

**Index:** `index(job, started_at desc)`.

Retained 90 days, pruned by the cron itself. The freshness of the newest row is
what `SCHEDULER_STALLED` checks, and the check runs in `/api/health`, outside
the scheduler. A component cannot be trusted to report its own absence.

---

## 15. Migration strategy

Follows the constraint already documented in `.github/workflows/deploy.yml`:
migrations run **before** the build, and the schema is briefly ahead of the
running process, so **every migration must be additive**.

| Phase | Migration | Contents |
| --- | --- | --- |
| 1 | `00XX_finance_core` | vendors, payment_methods, subscriptions, invoice_periods, documents, exceptions, audit_events, scheduler_runs |
| 2 | `00XX_finance_ingestion` | mailbox_state, connector_state, plus document extraction columns if deferred |
| 3 | `00XX_finance_connectors` | connector config columns on vendors |
| 4 | `00XX_finance_payments` | payments, document_payments |

All new tables and nullable columns. No renames, no drops, no type changes to
anything the running code reads. A destructive change, should one ever be
needed, splits across two deploys as the deploy script's comment already
requires.

Generated with `npm run db:generate`, applied by `npm run db:migrate` in the
deploy pipeline. Check constraints are added by hand to the generated SQL where
Drizzle does not emit them, and the migration file is reviewed before commit.

---

## 16. Retention

| Data | Retention | Why |
| --- | --- | --- |
| Documents in R2 | 8 years | Companies Act 2013 requires books for 8 financial years; GST requires 6 from the annual return due date. The longer of the two governs |
| `finance_documents` rows | indefinite | small, and the index into the archive |
| `finance_audit_events` | 8 years | matches the documents it describes |
| `finance_scheduler_runs` | 90 days | operational only |
| Resolved exceptions | 2 years | pattern analysis, then prune |
| Raw email bodies | not stored | only the derived document is kept. Storing whole mailboxes would widen the blast radius for no reconciliation value |
