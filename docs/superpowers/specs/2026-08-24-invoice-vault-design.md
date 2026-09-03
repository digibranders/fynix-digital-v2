# Invoice Vault: automated collection and custody of every vendor invoice

**Date:** 2026-08-24
**Status:** SUPERSEDED by [`docs/finance/`](../../finance/architecture.md).
Kept as the origin document. It remains readable as the shortest statement of
the problem and the research behind it, but the design that will be built is the
one in `docs/finance/`, which corrects ten decisions recorded in
[architecture.md §4](../../finance/architecture.md#4-critique-of-the-prior-spec).
**Scope:** A system that knows every subscription Fynix pays for, collects each
invoice and receipt automatically, stores the PDFs in Cloudflare R2, and is
operated from `fynix.digital/admin`. Covers the collection channels, the GST
implications for an Indian buyer of foreign SaaS, the data model, and a phased
build.

---

## 1. The actual problem

The stated pain is "the CFO has to collect invoices from every team at billing
time". Collection is the symptom. The cause is that **nobody holds the list of
what should have arrived.**

At month end the CFO asks DevOps for DigitalOcean and Vercel, asks Dev for
Claude and ChatGPT, asks Design for Adobe and Figma. That works only for the
subscriptions each team remembers. A tool bought in March on someone's card,
a seat added mid-cycle, a trial that converted quietly: none of those are on
anyone's list, so nothing flags their absence. That is exactly the shape of
"sometimes things got missed from the eyes".

So the design does not start with downloading. It starts with a register of what
we pay for. Everything else is a way of closing a row in that register.

**The spine of the system**

```
Subscription registry          →   Expected-invoice ledger      →   Collection
(what we pay, to whom,             (one row per vendor per          (API pull,
 which cycle, which card,           billing period, opens            email capture,
 which team owns it)                automatically each cycle)        manual upload)
```

The CFO's screen becomes "41 of 47 collected, 6 outstanding, 2 overdue" with
named rows, instead of a round of chase messages. The register is what makes
absence visible, and absence is the thing currently invisible.

---

## 2. What is actually retrievable, per platform

Researched 2026-08-24. This is the constraint that shapes everything else:
**almost no SaaS vendor offers an invoice-PDF API.** The universal channel is
email. Findings:

### Tier 1: real invoice API, PDF retrievable

| Vendor | Mechanism |
| --- | --- |
| **DigitalOcean** | `GET /v2/customers/my/invoices` to list, `/{uuid}/pdf` for the PDF, `/{uuid}/csv` for line items. Also `doctl invoice pdf`. Clean, token-authenticated, fully automatable. |
| **AWS** | `GetInvoicePDF` (GA Nov 2025) returns a pre-signed S3 URL; `ListInvoiceSummaries` for metadata. |
| **Microsoft Azure** | Billing `Invoices` REST API with download URLs. |
| **Atlassian** | Commerce REST API, invoices resource. |

### Tier 2: cost data by API, but the PDF is dashboard-only

| Vendor | Mechanism |
| --- | --- |
| **Vercel** | `/billing/charges` returns cost data in the FOCUS v1.3 standard. Good enough to reconcile the amount and to detect that a bill exists, but the invoice document itself still comes from the dashboard or the billing email. |

### Tier 3: emailed invoice or receipt (the large majority)

Anthropic, OpenAI, Cursor, Notion, Slack, Figma, ClickUp, Cloudflare, Google
Ads, Google Workspace, and most Stripe-billed SaaS. Two sub-cases that matter
for the parser:

- **PDF attached to the email.** Easiest case.
- **Link only.** Stripe-hosted invoices, and many vendors' "your receipt"
  mails, carry a `https://.../invoice/...` or `/receipt/...` URL rather than an
  attachment. The ingester has to follow the link and fetch the PDF, not just
  save attachments.
- **Inline HTML receipt with no PDF anywhere.** Stripe, Shopify and PayPal
  notification mails sometimes are the receipt. These need the message itself
  archived as a PDF.

### Tier 4: portal only, no email, no API

**Adobe**, **Meta Ads**, **Amazon Business**. Nothing can fetch an invoice that
was never sent. These are the permanent manual-upload cases, and the ledger's
job is to make sure someone is actually told to go and get them.

### What we deliberately will not build

**Browser automation against vendor portals.** It requires storing vendor
credentials, it breaks the moment a vendor adds MFA or changes markup, and it
sits against most vendors' terms of service. For a studio whose product is
cybersecurity credibility, a box holding the passwords to every company account
is the wrong thing to own.

If portal coverage becomes worth paying for, buy it rather than build it.
GetMyInvoices does this against 10,000+ portals from roughly EUR 216/year;
Invoice Relay covers around 100 SaaS providers and has a free tier. Either can
sit in front of our own ledger as one more collection channel. That is a later
decision, not a blocker.

---

## 3. The GST layer, and why this pays for itself

Fynix is an Indian registered business buying foreign SaaS. That makes this more
than filing hygiene.

**Foreign SaaS is OIDAR.** Claude, ChatGPT, Cursor, Vercel, Notion, Figma and
similar are Online Information and Database Access or Retrieval services,
attracting 18% IGST. For a GST-registered Indian buyer the tax runs on reverse
charge: self-assess the 18%, pay it in cash through GSTR-3B table 3.1(d), and
claim the same amount as input tax credit in table 4(A)(3) in the same month.
Cash-flow neutral, and the credit offsets our output GST.

**Two consequences the system must encode.**

1. **A missing GSTIN in a vendor's billing settings is a straight cash loss.**
   With no GSTIN on file the vendor treats us as B2C and charges 18% itself
   under its non-resident OIDAR registration. That 18% is **not** claimable as
   ITC, because it never flows through our GSTR-2B. With the GSTIN on file the
   vendor stops charging Indian tax, we self-assess on reverse charge, and the
   credit is ours. Same 18% either way; one version we get back and one we do
   not.

   So the vendor registry carries a `gstin_on_file` flag, and the dashboard
   surfaces "vendors billing us without our GSTIN" as a standing list. On a
   meaningful foreign SaaS spend that list is the highest-value screen in the
   whole system.

2. **For imported services, the invoice PDF is the primary evidence.** ITC on
   ordinary domestic purchases is gated on the invoice appearing in GSTR-2B
   (section 16(2)(aa)), and in 2026 GSTR-2B is treated as the source of truth.
   Import of services is excluded from that matching restriction, which means
   there is no GSTR-2B row to fall back on: the vendor's invoice and our
   reverse-charge working are the whole audit trail. A complete, indexed,
   immutable archive is the defence. That is what the vault is for.

Domestic vendors (Razorpay fees, Indian tooling) are the opposite case: they
must carry our GSTIN on the invoice and must reconcile against GSTR-2B. So the
data model needs `vendor_kind` of `domestic` or `import`, and the month-end
export must split them.

---

## 4. Where it runs

Same rule the platform split already established: if it touches the database, a
secret, or a schedule, it runs on the droplet.

| Concern | Home | Why |
| --- | --- | --- |
| Subscription registry, ledger, extraction | Droplet | needs Postgres and the vendor API tokens |
| Email ingestion worker | Droplet | long-lived, holds mailbox credentials |
| Cycle-open + chase cron | Droplet (systemd timer) | the reminders timer pattern already exists |
| R2 writes | Droplet | holds the R2 access key |
| Admin UI at `/admin/billing` | Vercel | reads `/api/admin/data/billing/*` through `adminGatewayFetch` |
| PDF download for the operator | Vercel route streaming from the droplet | mirrors `app/api/admin/invoice/[ref]/route.ts` |

Nothing new architecturally. It is a third section of the existing console
alongside the event dashboards, using the shared-secret gateway that is already
in `lib/admin/gateway.ts`, and the existing HMAC-cookie admin session.

---

## 5. Storage

**Cloudflare R2 is the system of record.** S3-compatible, so `@aws-sdk/client-s3`
works unchanged; zero egress fees, which matters because the CFO will bulk-download
a month at a time; cheap at this volume.

Deterministic, human-readable key layout so the bucket is browsable even without
the app:

```
invoices/FY2026-27/2026-08/digitalocean/digitalocean-2026-08-INV-12345.pdf
invoices/FY2026-27/2026-08/anthropic/anthropic-2026-08-receipt-9f2a.pdf
statements/FY2026-27/2026-08/hdfc-corporate-card.pdf
```

Indian financial year in the prefix, because that is the unit the CA works in.

**Objects are immutable.** A re-collected invoice writes a new key with a
version suffix rather than overwriting; the ledger points at the current one.
An archive that can be silently altered is not evidence.

**OneDrive or Google Drive as a one-way mirror, not the store.** The CFO wants a
folder, and a folder is a reasonable thing to want. So mirror R2 into one on a
schedule, and treat it as a convenience copy: no content addressing, no
immutability guarantee, and Microsoft Graph auth is materially more fragile than
an R2 access key. If the mirror breaks, nothing is lost.

---

## 6. Data model

Five tables, following the existing Drizzle conventions in `lib/db/schema.ts`.

**`vendors`**: one row per company we pay.
`id`, `slug`, `name`, `category` (cloud / ai / design / devtools / ads / other),
`owner_team`, `vendor_kind` (`domestic` | `import`), `country`,
`gstin_on_file` (boolean, the money-leak flag), `vendor_gstin` (for domestic),
`billing_email_domains` (text[], used to match inbound mail),
`collection_method` (`api` | `email` | `portal_manual`), `portal_url`,
`notes`, `active`.

**`subscriptions`**: one row per thing we actually pay for. A vendor can have
several (Google Workspace seats and Google Ads are separate).
`id`, `vendor_id`, `name`, `billing_cycle` (`monthly` | `annual` | `usage`),
`cycle_anchor_day`, `expected_amount_minor`, `currency`,
`payment_method_id`, `owner_team`, `owner_email`, `started_on`,
`cancelled_on`, `active`.

**`payment_methods`**: the card or account it lands on. This is what makes
statement reconciliation possible later.
`id`, `label` ("HDFC corporate card 4471"), `kind` (`card` | `bank` | `upi` |
`paypal`), `last4`, `holder`, `active`.

**`invoice_periods`**: the expected-invoice ledger. **This is the important
table.** One row per subscription per billing period, opened by cron before the
period's expected invoice date.
`id`, `subscription_id`, `period_start`, `period_end`, `expected_on`,
`status` (`expected` | `collected` | `reviewed` | `waived` | `overdue`),
`expected_amount_minor`, `currency`, `chased_at`, `chase_count`,
`waived_reason`, `assigned_to`.
Unique on `(subscription_id, period_start)` so a re-run of the cron cannot
double-open a period.

**`invoice_documents`**: the artefact and what we read out of it.
`id`, `period_id` (nullable: a document can arrive before we know its period),
`vendor_id`, `source` (`api` | `email` | `manual`), `source_ref` (message id,
vendor invoice id, or uploader), `r2_key`, `sha256` (deduplication and
tamper-evidence), `mime`, `bytes`,
`invoice_number`, `invoice_date`, `currency`, `subtotal_minor`, `tax_minor`,
`total_minor`, `tax_kind` (`igst_rcm` | `gst_charged` | `none`),
`buyer_gstin_present` (boolean), `extraction_confidence`,
`needs_review` (boolean), `created_at`.

Amounts in minor units throughout, matching the `amountCharged` convention
already set in `registrations`. `sha256` means the same invoice arriving by both
email and API collapses to one document rather than two.

---

## 7. How a document gets in

### 7.1 Email capture (the workhorse)

**Phase 0, before any code: one billing mailbox.** Create
`billing@fynix.digital` and set it as the billing contact on every vendor
account. Every team keeps its own login; only the invoice destination changes.
This single step removes most of the pain even with nothing built, because the
invoices stop being scattered across five people's inboxes.

Then ingest that mailbox:

- Gmail `users.watch` plus a Pub/Sub push topic is the low-latency option, but
  the watch has to be renewed at least every 7 days (daily in practice) or
  notifications silently stop. That renewal is itself a thing that can fail
  quietly, which is the failure mode we are trying to eliminate.
- **Recommended: IMAP polling every 15 minutes from the droplet.** Invoices are
  not latency-sensitive. Polling has no renewal cliff, no Pub/Sub topic, no
  extra Google project, and it works identically against Google Workspace,
  Microsoft 365 or anything else if the mailbox ever moves. Track the last seen
  UID; that is the whole state.

Per message: match sender domain against `vendors.billing_email_domains`, take
the PDF attachment if there is one, otherwise follow a receipt or invoice link
and fetch the PDF, otherwise render the message body to PDF. Hash, store to R2,
create an `invoice_documents` row.

### 7.2 Extraction

Send the PDF to an LLM with a strict output schema rather than writing a regex
per vendor. Per-vendor parsers are a maintenance treadmill: every vendor
redesigns its invoice eventually, and a silently broken parser reintroduces the
exact problem this system exists to solve.

Extract: invoice number, invoice date, billing period, currency, subtotal, tax
amount, tax label, total, and whether our GSTIN appears on the document.

**Never auto-trust the total.** The ledger already holds an expected amount, so
the check is free: within tolerance, mark `collected`; outside it, set
`needs_review` and show it. That catches both bad extraction and genuine
surprises like a seat count that jumped.

### 7.3 API pull

A small connector interface, `listInvoices(since)` and `fetchPdf(id)`, one
implementation per Tier 1 vendor. Start with DigitalOcean, which Fynix already
runs on and which has the cleanest API of the set. Add others only when the
spend justifies the connector.

### 7.4 Manual upload

Drag-and-drop in the admin console, **always against a specific
`invoice_periods` row**. Uploading into a general pile recreates the current
mess in a nicer font. Attaching it to the row it satisfies is what closes the
loop and keeps the outstanding count honest.

### 7.5 Chasing

The cron that opens periods also closes the loop: anything still `expected` past
`expected_on` flips to `overdue` and emails the owning team's `owner_email`
through Brevo, naming the exact subscription and giving a one-click upload link.
The chase becomes automatic and specific, aimed at one person about one invoice,
rather than the CFO broadcasting to everyone about everything.

---

## 8. The access model

Full administrative access to the vendor accounts is available. That is worth a
lot, but not for the reason it first appears. It does not unlock a new
collection channel so much as it unlocks the ability to **fix the accounts so
they cooperate**, which is more valuable and permanent.

### What admin access should be used for

**1. Fixing every vendor's billing settings (highest value by far).**
On each account: set `billing@fynix.digital` as the billing contact, enter the
GSTIN, and turn on "email me invoices" wherever it is optional. This is Phase 0.
It converts most Tier 3 vendors from "someone has to remember" into "arrives on
its own", and it stops the non-recoverable 18% described in §3.

**2. Creating scoped API tokens.**
Admin is required to mint tokens at all. Create them read-only where the vendor
offers scoping, one per vendor, named so they are identifiable and revocable.
DigitalOcean, AWS, Azure and Atlassian all support this.

**3. Adding `billing@fynix.digital` as a billing-role team member.**
This is the pattern to prefer over anything involving passwords. Most vendors
have role-based members: Billing Admin, Viewer, Finance. Add the billing
identity as a member with the narrowest role that can see invoices. The same
identity then both receives the mail and can view the portal, and it carries no
ability to change infrastructure, delete resources, or spend money.

**4. Google Workspace domain-wide delegation, scoped to history backfill.**
Workspace admin can authorise a service account to read mailboxes across the
domain. That solves the backfill problem in §12: the last nine months of
invoices are already sitting in team members' inboxes. Worth doing, with two
constraints: `gmail.readonly` scope only, and the search restricted to the known
vendor sender domains in `vendors.billing_email_domains`. A general-purpose
licence to read staff email is not what this needs and should not be what it
gets.

### What admin access should not be used for

**Storing vendor account passwords so the system can log in as a human.**
This is the one place I would push back. It is technically the way to reach the
Tier 4 portal-only vendors, and it is exactly what GetMyInvoices does. Three
problems:

- MFA breaks it. Any vendor that enforces MFA, or turns it on later, silently
  stops working. Silent breakage is the failure mode this whole project exists
  to eliminate.
- It sits against most vendors' terms of service.
- A single box holding the admin passwords to every company account, cloud
  included, is a far larger liability than the problem it solves. Fynix sells
  cybersecurity credibility. This would be the worst asset on the network.

If the Tier 4 vendors (Adobe, Meta Ads, Amazon Business) are worth automating,
buy that capability from a vendor whose business is carrying that risk, and let
it deposit into our ledger as one more channel. Do not build it here.

**Note on who does the credential work.** The steps above involve typing
passwords and API keys into vendor consoles. I will not do that, and no
automation should hold those credentials on our behalf during setup. Give me the
list of vendors and I will produce an exact per-vendor checklist of what to
change and where; the credential entry itself is yours. Once a token exists,
paste it into the droplet's environment and the system takes over from there.

### Practical security posture

- Tokens live in the droplet environment only, never in Vercel, never in the
  repo. Same rule as `RAZORPAY_KEY_SECRET` and `ADMIN_PROXY_SECRET` today.
- One token per vendor, so revoking one does not break the rest.
- Read-only scope wherever the vendor offers it.
- The R2 access key is write-and-read on one bucket prefix, not account-wide.
- The admin console already sits behind the HMAC session in `lib/admin/auth.ts`;
  the billing views inherit it and need nothing new.

---

## 9. What the CFO sees

`/admin/billing`, four views:

1. **This cycle.** Counts by status, then the outstanding rows: vendor, amount,
   owner, days overdue, upload button. The default screen and the answer to
   "where are we".
2. **Vault.** Every document, filterable by vendor, month, financial year,
   category, team. Download one, or download a month as a ZIP with a CSV
   manifest. That ZIP is what goes to the CA.
3. **Attention.** Three lists that are each worth real money:
   `needs_review` extractions; vendors with `gstin_on_file = false`;
   subscriptions with a charge and no invoice, or an invoice and no charge.
4. **Registry.** Add, edit and retire vendors, subscriptions and payment
   methods. Retiring a subscription stops future periods opening, so a cancelled
   tool stops being chased.

The existing `components/admin/ui` primitives, `Card` and `EmptyState`, and the
console focus and colour tokens already in use cover this; no new design system
work.

---

## 10. Decisions needed before building

1. **Mailbox.** Is `billing@fynix.digital` on Google Workspace or Microsoft 365?
   It decides the IMAP host and whether the OneDrive mirror is even the natural
   choice.
2. **Mirror target.** R2 only to start, or R2 plus a OneDrive or Drive folder
   from day one?
3. **Scope of the first cut.** The full four-view console, or Phase 1 only
   (registry, ledger, manual upload, vault) so the CFO has the outstanding list
   next week and automation lands behind it?
4. **Vendor list.** A list of the subscriptions actually being paid for today,
   with owning team and card, is the one input the system cannot derive. Best
   source is 3 to 6 months of card and bank statements rather than asking the
   teams, since asking the teams is the process that already loses things.

---

## 11. Phases

**Phase 0, no code, roughly a day of admin work.** Create the billing mailbox.
Then on each vendor account, using the admin access described in §8: set
`billing@fynix.digital` as the billing contact, enter the GSTIN, add the billing
identity as a billing-role member, and mint a read-only API token where the
vendor has one. Ships most of the relief immediately and is a prerequisite for
everything else. I will produce the per-vendor checklist; the credential entry
is yours.

**Phase 1, the CFO's dashboard.** Schema and migration, registry CRUD, the
period-opening cron, manual upload, R2 storage, the This-cycle and Vault views.
At the end of this phase nothing is automated but nothing is invisible, which is
the larger half of the problem.

**Phase 2, email ingestion.** IMAP worker, link-following fetcher, LLM
extraction, auto-match to periods, `needs_review` queue, automated chase mail.
Then the historical sweep: a one-off run over the existing mailboxes through the
scoped Workspace delegation in §8, restricted to known vendor sender domains,
to recover the invoices already sitting in team inboxes. This is where the
manual work mostly stops.

**Phase 3, API connectors.** DigitalOcean first, then AWS, Azure and Atlassian
as applicable. Vercel amount reconciliation via `/billing/charges`.

**Phase 4, reconciliation and export.** Card and bank statement import, matching
against the ledger to catch both missing invoices and zombie subscriptions, the
month-end ZIP plus CSV export pack, and the OneDrive mirror.

Each phase is independently useful and independently shippable. Phase 1 alone
ends the month-end chase round.

---

## 12. Risks

| Risk | Mitigation |
| --- | --- |
| A vendor changes its invoice email format | LLM extraction rather than per-vendor regex; `needs_review` on any amount mismatch, so a break surfaces instead of silently passing |
| The billing mailbox is a single point of failure | It is a collection channel, not the record. R2 plus Postgres hold the archive. Mailbox loss delays collection, it does not lose history |
| Portal-only vendors stay manual forever | Accepted. The ledger makes the manual step assigned and tracked rather than forgotten. Buy portal coverage later if the volume justifies it |
| Nine months of existing invoices predate the system | Recovered in Phase 2 by the scoped historical mailbox sweep (§8). Anything that sweep misses is hand-uploaded, oldest financial year first. One-time cost either way |
| Vendor API tokens sitting on the droplet | Read-only scopes where the vendor offers them, and the tokens never leave the droplet. This is the argument against portal scraping: that would need full account passwords, not read-only tokens |
| LLM sees invoice contents | Invoices carry company billing details, not customer PII. Acceptable, but worth an explicit note in the privacy posture given the Sentry body-exclusion precedent already set in this repo |
