# Failure and recovery

The governing rule, from which everything in this file derives:

> **Automation failure must never equal silent failure.**
> Detected → recorded → retried → escalated → visible to Finance.

Companion to [architecture.md](architecture.md) and
[data-model.md](data-model.md).

---

## 1. The three ways a system like this fails silently

Naming them makes the countermeasures legible.

| Failure shape | Why it is silent | Countermeasure |
| --- | --- | --- |
| **A thing that should have run, did not.** A cron stops, a worker dies, a connector is skipped. | Nothing produces an error, because nothing ran. Absence has no log line. | **Freshness checks outside the component.** `last_success_at` older than 2× the expected interval is itself the alarm, evaluated by `/api/health`, which the GitHub uptime workflow already probes from outside the droplet. |
| **A thing ran and produced a wrong answer confidently.** Extraction reads the wrong total; a document attaches to the wrong period. | It looks like success. | **Independent cross-checks.** Arithmetic, vendor attestation, and the snapshotted expectation. Disagreement blocks collection rather than being averaged away. |
| **A thing was never expected in the first place.** A tool bought on someone's card that no one registered. | There is no row to be missing. | **Reconciliation from the money side.** Payments are imported and matched; an unmatched payment is `UNKNOWN_VENDOR`. This is the only countermeasure that finds unknown unknowns, which is why Phase 4 is not optional. |

---

## 2. Failure matrix

Every important failure mode, its detection, its automatic recovery, and what a
human has to do.

### 2.1 Infrastructure

| Failure | Detected by | Automatic recovery | Human action | Ledger effect |
| --- | --- | --- | --- | --- |
| **Postgres down** | `/api/health` 503; uptime workflow fails within 10 min | Nothing runs. Every route returns 503 rather than degrading. `getDb()` already returns null and callers fail closed | Restore the database | None. Periods are not opened, invoices are not lost: mail stays in the mailbox and connectors re-list from `last_success_at` |
| **R2 unreachable** | Put or get fails after retries; `STORAGE_FAILURE` (critical); `connector_state` for storage goes `failing` | **Ingestion halts before writing any row.** A document row without its object is a lie about what we hold | Fix credentials or wait out the outage; re-run ingestion | None. Nothing is half-recorded |
| **R2 object missing or altered** | Weekly re-hash job; `DOCUMENT_HASH_MISMATCH` (critical) | None possible | Investigate; restore from the mirror if Phase 4 exists | Document flagged; period reverts to `pending_review` |
| **Droplet restarts mid-run** | Next `/api/health` probe; heartbeat gap | Work is re-driven on the next tick from durable state. No in-memory queue exists to lose | None if the next run is clean | None |
| **Deploy in progress** | n/a | Migrations are additive and run before the build, so the old process tolerates the new schema. Cron requests during the restart fail and the next tick catches up | None | None |
| **Vercel down** | External | The console is unavailable. Ingestion, extraction, matching and chasing all continue on the droplet | None | None. The console is a window, not the system |

### 2.2 Collection

| Failure | Detected by | Automatic recovery | Human action | Ledger effect |
| --- | --- | --- | --- | --- |
| **IMAP unreachable** | `consecutive_failures` on `mailbox_state`; `MAILBOX_FAILURE` (critical) at 3 | Exponential backoff, then retry every tick | Check credentials, app password, provider status | Periods stay `expected` and go overdue on schedule. **The mailbox failing does not make invoices look collected** |
| **Mailbox reachable but cursor not advancing** | `last_success_at` fresh while `messages_last_run` is 0 for 24h with mail present | None | Trigger a full resync from the console | None |
| **`UIDVALIDITY` changed** | Compared on every connect | Cursor discarded, folder re-scanned in full. Duplicates absorbed by `unique(source, source_ref)` | None | None |
| **Connector token expired or revoked** | `unauthorized` from `probe()` or a call; `auth_state = expired`; `CONNECTOR_FAILURE` (critical) | **No retry.** Retrying a dead token is noise, and on some vendors is how an account gets locked | Mint a new token, update the droplet env, `probe()` from the console | Falls back to the email channel where the vendor has one; otherwise the period goes overdue and is chased |
| **Vendor API 5xx or rate limit** | `unavailable` / `rate_limited` | Backoff with jitter (§3), circuit opens at 5 consecutive failures | None unless the circuit stays open | None. `last_success_at` staleness surfaces it |
| **Vendor changes its invoice email format** | Extraction gates fail; `EXTRACTION_ANOMALY` | None | Review in the attention queue; correct the fields by hand, or add a deterministic parser | Period is `pending_review`, **not** `collected`. Document preserved |
| **Vendor stops emailing entirely** | Period goes overdue | Chase mail to the owner | Collect from the portal and upload | Tracked overdue throughout |
| **Portal-only vendor** | By design | None | Upload against the specific period row | Tracked, assigned, chased |

### 2.3 Data correctness

| Failure | Detected by | Automatic recovery | Human action | Ledger effect |
| --- | --- | --- | --- | --- |
| **Model extracts a wrong amount** | Arithmetic gate, vendor attestation, or the expectation gate | Rejected before collection | Correct in the review drawer | `pending_review` |
| **Model extracts a wrong amount that passes every gate** | Not detectable at ingest. Caught in Phase 4 when the payment disagrees, or at month-end review | Payment reconciliation | Review | Residual risk, documented in §5 |
| **Duplicate document, identical bytes** | `unique(sha256, vendor_id)` | Insert is a no-op; the existing document is linked | None | None |
| **Duplicate document, same invoice number, different bytes** | Vendor invoice-number check | `DUPLICATE_DOCUMENT` (low); both retained | Decide which is authoritative; the other is superseded via `supersedesDocumentId` | Operator resolves |
| **Document attaches to the wrong period** | Extracted period vs ledger period disagree | Refuses to auto-attach when the extracted period sits outside the ledger period ± 7 days; raises `UNATTACHED_DOCUMENT` | Attach by hand | Both periods stay honest |
| **Two periods opened for one subscription month** | `unique(subscription_id, period_start)` | Prevented at the database | None | None |

### 2.4 Money

| Failure | Detected by | Human action | Phase |
| --- | --- | --- | --- |
| **Payment with no invoice** | Matching sweep; `PAYMENT_WITHOUT_INVOICE` after the grace window | Chase the vendor, or upload | 4 |
| **Invoice with no payment** | Matching sweep; `INVOICE_WITHOUT_PAYMENT` | Check whether it is genuinely unpaid, which is a different and more urgent problem | 4 |
| **Payment to an unknown vendor** | No vendor matches the narration; `UNKNOWN_VENDOR` (high) | Create the vendor and subscription from the payment, or classify as non-subscription | 4 |
| **Duplicate payment** | Same vendor, amount and window; `DUPLICATE_PAYMENT` (critical) | Seek a refund | 4 |
| **Amount changed at renewal** | Variance gate | Update the subscription; the change is in the audit log | 2 |
| **GSTIN missing at a vendor** | `gstinOnFile = false`, or `buyerGstinPresent = false` on an import document; `GSTIN_MISSING` (high) | Add the GSTIN in the vendor's billing settings | 1 |

---

## 3. Retry and backoff policy

Explicit, bounded, and never infinite.

```
attempt 1  immediate
attempt 2  +30s   ± jitter
attempt 3  +2m    ± jitter
attempt 4  +8m    ± jitter
attempt 5  +32m   ± jitter
           ↓
   circuit opens: state = failing, next_attempt_at = +6h
   raise CONNECTOR_FAILURE
           ↓
   fallback channel, if the vendor has one
           ↓
   period continues its normal overdue and chase path
           ↓
   human escalation
```

- **Base 30s, factor 4, cap 32m, max 5 attempts.** Jitter is ±25%, so several
  connectors failing on the same outage do not retry in lockstep.
- **The circuit half-opens** after 6 hours: one probe. Success closes it, failure
  re-opens it at the same interval. No exponential growth beyond 6 hours,
  because a connector that has been dead for a day needs a human, not a longer
  timer.
- **`unauthorized` and `unconfigured` never retry.** They are terminal until a
  human acts. Retrying them burns rate limit and produces alert fatigue.
- **In-process retry stays at 3 attempts with linear backoff**, matching
  `withRetry` in [invoice.ts](../../lib/pavel/invoice.ts), for transient
  database contention. Vendor calls use the schedule above instead, because a
  vendor outage lasts longer than a lock does.
- **A unique-constraint violation short-circuits every retry loop.** Retrying
  cannot help, and the existing `withRetry` already encodes this.

**No dead-letter queue.** Failed work is not moved somewhere else; it is left in
its natural state (period still `expected`, document still `needs_review`) and
re-driven from that state on the next tick. A separate queue would be a second
place to look, and the point of the ledger is that there is one place to look.

---

## 4. The 22-question self-critique

Answered before implementation, as the directive requires. Where an answer was
"we don't know", the design changed; those changes are recorded in
[architecture.md §4](architecture.md#4-critique-of-the-prior-spec).

**1. What can fail silently?**
Three shapes, all covered in §1: something that did not run, something confidently
wrong, and something never expected. Residual risk is enumerated in §5.

**2. What happens if the database is unavailable?**
Everything stops and says so. `getDb()` returns null, routes return 503,
`/api/health` fails, and the uptime workflow reports within 10 minutes. Nothing
half-completes because every write path begins with a database claim. Mail
remains unread in the mailbox; connectors re-list from `last_success_at`. No
data loss, only delay.

**3. What happens if R2 is unavailable?**
Ingestion halts **before** any row is written. The order is bytes to R2, then
the row: never the reverse, because a document row pointing at nothing claims we
hold a document we do not. `STORAGE_FAILURE` is raised at critical. The source
material still exists at its origin, so the work is re-driven when R2 returns.

**4. What happens if the mailbox is unavailable?**
`MAILBOX_FAILURE` at critical after 3 consecutive failures, with backoff and
continued retries. Crucially, periods keep going overdue on schedule. The
failure mode we refuse is a broken mailbox making invoices appear collected.

**5. What happens if an invoice arrives twice?**
Three independent defences. `unique(source, source_ref)` stops the same message
or API ref creating a second row. `unique(sha256, vendor_id)` stops identical
bytes from a different channel. A same-invoice-number, different-bytes arrival
raises `DUPLICATE_DOCUMENT` and keeps both, since one is usually a correction.

**6. What happens if an invoice arrives late?**
Nothing special. The period is overdue until it is collected, and collecting it
closes the row whenever that happens. `chaseCount` and `lastChasedAt` record how
much chasing it took, which is how a chronically late vendor becomes visible as
a pattern rather than as a monthly annoyance.

**7. What happens if an invoice arrives before its expected period exists?**
It is stored and left unattached, raising `UNATTACHED_DOCUMENT` or
`UNKNOWN_VENDOR`. A matching pass on every tick attaches it retroactively once
the period opens. This was the gap in the original spec (finding §4.5): the
first invoice from an unregistered tool is the most valuable thing the system
can catch, so it is a designed path, not a null column.

**8. What happens if a subscription is cancelled?**
`cancelledOn` is set. No period is opened on or after that date. Open periods
before it stay open and must still be collected, because a cancelled
subscription usually still has a final invoice. Periods that opened after the
real cancellation date are moved to `cancelled` by the operator, which requires
a reason and is audited.

**9. What happens if the amount changes?**
Caught by the variance gate under the subscription's policy: a tight band for
`fixed`, a seat-count recomputation for `seat_based`, trailing-mean drift for
`usage`. The document goes to `needs_review` and the period to `pending_review`.
The operator either corrects the extraction or updates the subscription, and the
new expectation applies from the next period only, because expectations are
snapshotted onto the period at open time.

**10. What happens if the vendor changes its email format?**
Extraction gates fail rather than producing a wrong number. `EXTRACTION_ANOMALY`
is raised, the document is preserved, and the period does not close. The
operator fixes it by hand once and, if it recurs, a deterministic parser is
added. The cascade in connector-architecture.md §6 makes the model the fallback
rather than the only path, so a format change degrades one tier rather than
breaking outright.

**11. What happens if the AI extracts the wrong amount?**
Four gates have to fail together: arithmetic, vendor attestation where
available, the expectation band, and eventually the payment. A wrong amount that
survives arithmetic and attestation and the expectation band and matches the
actual payment is, for practical purposes, the right amount. The residual case
is a vendor with `amount: none` on a `usage` policy in Phase 2 before payment
reconciliation exists; that is named as accepted risk in §5.

**12. What happens if a connector token expires?**
`auth_state = expired`, `CONNECTOR_FAILURE` at critical, and **no retry**. The
console shows the connector as failing with the specific remedy. Where the
vendor also emails, collection continues on the email channel and nothing is
lost. Otherwise the period follows the ordinary overdue path.

**13. What happens if a payment exists without an invoice?**
`PAYMENT_WITHOUT_INVOICE` after the grace window (Phase 4). If the payment
matches no subscription at all, `UNKNOWN_VENDOR` instead, which is the stronger
signal because it means something is being paid for that Finance did not know
about.

**14. What happens if an invoice exists without a payment?**
`INVOICE_WITHOUT_PAYMENT` (Phase 4). Lower severity than the reverse but more
urgent operationally, since it can mean a genuinely unpaid bill and a service
about to be cut off.

**15. What happens if a team buys something without registering it?**
Two independent nets. If the vendor emails `billing@`, the document arrives and
raises `UNKNOWN_VENDOR` at ingest. If it never emails, the card charge is caught
by payment reconciliation in Phase 4. Before Phase 4 exists, only the first net
is in place, and that limit is stated plainly in the rollout so nobody assumes
coverage the system does not yet have.

**16. What happens during deployment?**
Migrations run before the build and are strictly additive, so the running
process tolerates the new schema. Cron requests during the ~4-second restart
fail and the next tick catches up, because nothing is scheduled at a
once-only instant. In-flight ingestion is lost and re-driven from durable state.
A destructive migration, if ever needed, splits across two deploys as the deploy
script's own comment requires.

**17. What happens when the cron runs twice?**
Nothing. `unique(subscription_id, period_start)` makes period creation
idempotent; `unique(source, source_ref)` and `unique(sha256, vendor_id)` make
ingestion idempotent; the exception partial-unique index makes raising
idempotent; chase mail goes through the existing `email_log` claim-before-send.
Every write in the system is a claim against a constraint, following the pattern
`dispatchPavelEmail` established.

**18. What happens if the worker crashes halfway through a document?**
Depends where, and every case is safe:
before R2, nothing exists and the source is re-read;
after R2 but before the row, an orphan object exists which the next run
re-derives to the same content-addressed key and reuses;
after the row but before extraction, the document sits `unvalidated` and the
next tick extracts it;
after extraction but before matching, it sits unattached and the matching pass
picks it up.
No step depends on the previous step having completed in the same process.

**19. What happens if two workers process the same message?**
The second one loses a unique-constraint race and no-ops, which is a normal
outcome rather than an error. The droplet runs one process today, so this is
defence for a future where it does not.

**20. What happens if the admin manually corrects something?**
The correction is applied, an audit event records before and after, and the
document or period is marked as operator-corrected so a later automated pass
does not overwrite a human decision. Manual attachment sets `matchedBy` to the
operator rather than `auto`.

**21. Can every important action be audited?**
Yes for system and operator actions, through append-only
`finance_audit_events` (data-model.md §13). **With one honest limitation:** the
console has a single shared credential, so `actor` records a session reference
and an IP rather than a name. The column is correct from day one so that adding
named operators later fills it properly. Recorded in security-model.md §6 rather
than glossed over.

**22. Can Finance recover from every normal failure without engineering?**
Yes for: missing invoice, late invoice, wrong extraction, wrong attachment,
duplicate document, cancelled subscription, changed amount, unknown vendor,
unmatched payment, and any portal-only collection. All are console actions.
No for: expired connector token (needs an env var on the droplet), IMAP
credential change, R2 outage, database outage. These are named in the runbook
with the exact remedy so the handoff is a ticket with a known fix rather than an
investigation.

---

## 5. Accepted residual risk

Stated explicitly, because unstated residual risk is indistinguishable from an
oversight.

| Risk | Why accepted | Mitigation |
| --- | --- | --- |
| A wrong extracted amount that passes every gate, on a `usage` subscription with no vendor attestation, before Phase 4 | The remaining gates cannot distinguish it from a genuine usage spike | Phase 4 payment reconciliation closes it. Until then, usage vendors are reviewed at month-end |
| A vendor that neither emails nor exposes an API and is never registered | Nothing can observe it before the money moves | Phase 4 payment reconciliation. This is the whole argument for Phase 4 not being optional |
| R2 bucket locks are not compliance-mode WORM | Cloudflare does not offer it; an account admin can remove a lock rule | Hash chain in Postgres plus append-only audit log is the actual tamper-evidence. Stated honestly rather than claimed as immutability (architecture.md §4.1) |
| The shared admin credential weakens attribution | Changing the auth model would delay the CFO's dashboard for a benefit that matters only in a dispute | Session reference plus IP recorded now; named operators are a documented follow-up |
| Extraction sends invoice contents to a model | Invoices carry company billing details, not customer personal data | Vendor choice and data handling in security-model.md §8 |
| A document could be deleted directly from R2 by someone with the key | The key must exist for the system to work | Weekly hash verification detects it within 7 days; bucket lock makes it harder; the audit log shows what should be there |
