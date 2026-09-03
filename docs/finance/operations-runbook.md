# Operations runbook

For whoever operates Fynix Spend & Invoice Control: the CFO for daily and
month-end work, engineering for the four failures Finance cannot fix alone.

Companion to [failure-recovery.md](failure-recovery.md), which explains why each
of these procedures exists.

---

## 1. Daily: two minutes

Open `/admin/finance`.

1. **This cycle.** Read the header: expected, collected, outstanding, overdue.
   If outstanding is falling and overdue is zero, there is nothing to do.
2. **Attention.** Anything at `critical` or `high` is worth looking at today.
   `medium` and `low` can wait for the weekly pass.
3. **Health strip.** Green means every connector and the mailbox have succeeded
   within their expected interval. A degraded connector is not urgent unless it
   is the only channel for a vendor whose period is due.

Nothing else is a daily task. If the system is asking for more than two minutes
a day, that is a defect in the system, not a workload to absorb.

---

## 2. Phase 0: the vendor account checklist

Do this once per vendor, before anything is automated. It is the highest-value
work in the whole project and needs no code.

**Prerequisite:** `billing@fynix.digital` exists as a real mailbox with IMAP
enabled and an app password generated.

For each vendor, signed in as an account administrator:

| # | Step | Why |
| --- | --- | --- |
| 1 | Set the **billing contact** to `billing@fynix.digital` | Invoices stop scattering across five inboxes |
| 2 | Enter the company **GSTIN** in the tax or billing settings | Without it a foreign vendor charges 18% under its own OIDAR registration and that tax is **not reclaimable**. Straight cash loss (architecture.md §5.3) |
| 3 | Enter the full registered **billing address** | An invoice without it may not support an ITC claim |
| 4 | Add `billing@fynix.digital` as a **billing-role member** (Billing Admin / Finance / Viewer). Never as an infrastructure admin | The identity can then view the portal without holding any power to change or spend (security-model.md §3.3) |
| 5 | Turn on **email me invoices** wherever it is optional | Some vendors default to portal-only |
| 6 | Mint a **read-only API token** if the vendor has one, named `fynix-invoice-vault` | Identifiable and revocable later |
| 7 | Record it in the registry: vendor row, subscriptions, owner team, owner email, payment method, `gstinOnFile = true` once step 2 is confirmed | The registry is the spine; a vendor not in it is invisible |

**Credential entry is a human task.** Engineering produces the per-vendor list
and the registry rows; a person with the account passwords does steps 1 to 6.
Once a token exists, hand it over for the droplet environment.

### 2.1 Building the vendor list

Do **not** ask the teams. Asking the teams is the process that already loses
things.

Take 3 to 6 months of card and bank statements, list every recurring charge, and
work backwards to the vendor. That finds the subscriptions nobody remembers,
which are exactly the ones the current process misses.

---

## 3. Month-end close

Target: under thirty minutes, most of it reading.

1. **Wait for the close window.** Every period for the month should be past its
   `expectedOn + grace`. Usage vendors bill a few days into the following month,
   so run this after the 7th.
2. **This cycle → filter to last month.** Everything should be `collected` or
   explicitly `waived`.
3. **Clear the outstanding rows.** For each: chase, or upload from the portal, or
   waive with a reason. A waive requires a reason and is audited, so "the vendor
   did not bill us this month" is a legitimate close and "I got bored" is
   visible.
4. **Clear `pending_review`.** Each has a named failed gate. Correct the
   extraction or accept the variance. Accepting is an audited decision.
5. **Check the GSTIN list.** Any vendor with `gstinOnFile = false` is losing 18%
   every cycle. Fix at the vendor, then update the registry.
6. **Export.** Vault → Export month. Produces:
   - `invoices/` PDFs, named `<vendor>-<period>-<invoiceno>.pdf`
   - `manifest.csv`: vendor, subscription, period, invoice number, date,
     currency, subtotal, tax, total, tax kind, GSTIN present, payment method,
     R2 key, SHA-256
   - `summary.csv`: totals by vendor, by category, by team
   - `exceptions.csv`: anything unresolved, so the CA sees the gaps rather than
     inferring completeness
   The export **splits `domestic` from `import`**, because domestic invoices
   reconcile against GSTR-2B and imports do not (architecture.md §5.3).
7. **Send to the CA.** Reverse-charge working for imports comes from the import
   sheet.

### 3.1 What "complete" means

A month is complete when every period is `collected`, `waived` or `cancelled`,
and no `critical` or `high` exception is open. Not when the folder looks full.
The count on the screen is the answer; the folder is the evidence.

---

## 4. Common operator tasks

| Task | Where | Notes |
| --- | --- | --- |
| Upload an invoice | This cycle → the period row → Upload | **Always against the specific period.** Uploading into a general pile recreates the old mess |
| Fix a wrong extraction | Attention → the document → Review drawer | Edit the fields; marked operator-corrected so no later pass overwrites it |
| Attach an unattached document | Attention → `UNATTACHED_DOCUMENT` → Attach | Choose the period, or create the subscription if it is genuinely new |
| Register a vendor found by an unknown payment | Attention → `UNKNOWN_VENDOR` → Create vendor | Creates vendor and subscription from the payment, with `sourceConfidence = observed`. Confirm the cycle and amount |
| Waive a period | The period row → Waive | Reason required |
| Cancel a subscription | Registry → subscription → Set cancelled date | No future periods open. Open periods stay open: there is usually a final invoice |
| Change an expected amount | Registry → subscription → Edit | Applies from the **next** period. Past periods keep their snapshot |
| Snooze an exception | Attention → Suppress until | Honest deferral, not a fake resolution |
| Re-run collection now | Health strip → Run now | Same work the cron does. Safe to run repeatedly |
| Full mailbox resync | Health strip → Mailbox → Full resync | Safe. Duplicates are absorbed by the unique constraints |

---

## 5. When something breaks

### 5.1 Finance can fix these

| Symptom | Do this |
| --- | --- |
| A period is overdue | Chase the owner, or collect from the portal and upload. If the vendor genuinely did not bill, waive with a reason |
| Attention shows `EXTRACTION_ANOMALY` | Open the document, read which gate failed, correct the fields or accept the variance |
| Attention shows `UNKNOWN_VENDOR` | Create the vendor and subscription, or classify the payment as non-subscription |
| Attention shows `DUPLICATE_DOCUMENT` | Decide which is authoritative; mark the other as superseded |
| Attention shows `GSTIN_MISSING` | Add the GSTIN in the vendor's billing settings, then update the registry row |
| A connector shows `degraded` | Usually transient. If it clears within a few hours, nothing to do |

### 5.2 Engineering is required for these four

| Symptom | Cause | Fix |
| --- | --- | --- |
| **`CONNECTOR_FAILURE`, auth state `expired`** | Vendor token expired or revoked | Mint a new read-only token in the vendor console, set `VENDOR_TOKEN_<SLUG>` in GitHub Actions secrets, redeploy, then `probe()` from the console |
| **`MAILBOX_FAILURE`** | IMAP credentials or provider | Regenerate the app password, update `FINANCE_MAILBOX_PASSWORD`, redeploy, then Full resync |
| **`STORAGE_FAILURE`** | R2 credentials or outage | Check the Cloudflare status page and the key's permissions. Ingestion resumes on its own once R2 answers |
| **`SCHEDULER_STALLED`** | The cron trigger stopped firing | §6 |

Each of these is a ticket with a known fix, not an investigation. That is the
point of naming them.

---

## 6. The scheduler

### 6.1 How it is triggered

**This must be filled in before Phase 1 ships.** The reminders cron at
`/api/pavel/cron/reminders` is invoked by a trigger configured **outside this
repository**: `vercel.json` declares no `crons`, and no systemd unit or crontab
is in version control. Finance uses the same mechanism, and the mechanism is
recorded here, because a schedule nobody can see is a schedule nobody can
verify.

```
Trigger:          [ systemd timer on the droplet | external scheduler | other ]
Unit / config:    [ path or location ]
Schedule:         [ e.g. hourly at :05 ]
Finance addition: GET https://api.fynix.digital/api/finance/cron
                  Authorization: Bearer $CRON_SECRET
                  hourly, offset from the reminders timer so the two do not
                  contend for the droplet's limited memory
```

### 6.2 Verifying it runs

```bash
curl -s https://api.fynix.digital/api/health | jq '.finance.scheduler'
```

`lastRunAt` should be within the last hour and `outcome` should be `ok` or
`partial`. `SCHEDULER_STALLED` is raised automatically when the newest heartbeat
is older than twice the interval. The check lives in the health endpoint, not in
the scheduler, because a component cannot be trusted to report its own absence.

### 6.3 Running it by hand

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://api.fynix.digital/api/finance/cron
```

Safe to run at any time and any number of times. Every write is a claim against
a unique constraint (failure-recovery.md §4, question 17).

---

## 7. Health

```bash
curl -s https://api.fynix.digital/api/health | jq
```

The existing payload gains a `finance` block: storage reachable, mailbox state
and cursor freshness, per-connector state, scheduler heartbeat, and open
exception counts by severity. Reported as states and counts only, never as
secrets, matching the existing `integrations` booleans.

The GitHub uptime workflow already probes this endpoint every 10 minutes and
fails the job on a bad response, which emails the repository admins. Extending
that check to the finance block needs a one-line change to
`.github/workflows/uptime.yml` and no new infrastructure.

---

## 8. Restoring a document

Documents are content-addressed in R2, and the key is on the
`finance_documents` row.

```sql
SELECT r2_key, sha256, bytes, invoice_number
FROM finance_documents
WHERE id = '<uuid>';
```

Fetch with any S3 client against the R2 endpoint, then verify:

```bash
sha256sum <file>   # must equal the sha256 column
```

A mismatch is `DOCUMENT_HASH_MISMATCH` and means the stored object changed after
we recorded it. Escalate; do not quietly replace it.

---

## 9. Adding a vendor

Registry → New vendor, then the §2 checklist. **Not a code change**
(connector-architecture.md §5). Periods open from the next cron tick.

Adding a *connector* is a code change and is described in the same section.

---

## 10. Backups

| What | Where | Recovery |
| --- | --- | --- |
| Postgres | Existing droplet backup regime | Restores the ledger, registry, exceptions and audit log |
| R2 objects | R2 itself, plus a bucket lock retention rule | Objects survive database loss; the database can be partially rebuilt from R2 keys since keys encode vendor, period and hash |
| Audit log | In Postgres | Covered by the database backup. It is the one table whose loss cannot be reconstructed from anywhere else |

The R2 key layout is deliberately human-readable so the archive stays usable
without this application. That is a recovery property, not a cosmetic one:
`invoices/FY2026-27/2026-08/digitalocean/...` is navigable by a person with an
S3 client and no code.

---

## 11. Rotation calendar

From security-model.md §10. Someone owns this; unowned rotation does not happen.

| Credential | Cadence | Location |
| --- | --- | --- |
| Vendor API tokens | 12 months | Vendor console → GitHub Actions secret `VENDOR_TOKEN_<SLUG>` |
| Anthropic Admin key | 6 months | Anthropic Console → `VENDOR_TOKEN_ANTHROPIC` |
| R2 access key | 12 months | Cloudflare → `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` |
| Mailbox app password | 12 months | Mail provider → `FINANCE_MAILBOX_PASSWORD` |
| `FINANCE_UPLOAD_SECRET` | 12 months | `openssl rand -hex 32`, both hosts |
| `ADMIN_PASSWORD` | On any personnel change | Shared credential, so any departure is a rotation event |
