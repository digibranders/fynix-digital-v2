# Connector architecture

How Fynix obtains a vendor's invoice and, where possible, an independent
attestation of what that invoice should say. Companion to
[architecture.md](architecture.md).

---

## 1. The capability hierarchy

Preference order, most reliable first:

| # | Channel | Reliability | Used for |
| --- | --- | --- | --- |
| 1 | Native API | highest: deterministic, replayable, no parsing | DigitalOcean, AWS, Azure, Atlassian |
| 2 | OAuth or delegated billing access | high, but token lifecycle to manage | Google Workspace, Microsoft 365 |
| 3 | Billing email | good coverage, needs parsing | the large majority |
| 4 | Webhook or event source | low latency, rarely offered for billing | none today |
| 5 | External collection service | outsourced risk, paid | portal-only vendors, if ever bought |
| 6 | Manual upload | always available, always tracked | Adobe, Meta Ads, Amazon Business |

A vendor sits at the highest tier it actually supports. **Every vendor also has
tier 6 available at all times**, which is what makes coverage independent of
automation.

## 2. Two axes, not one

The single most important correction to the original design
([architecture.md §4.2](architecture.md#42-anthropic-openai-github-and-cloudflare-were-misclassified-as-email-only)):
a vendor's ability to give us the **document** is independent of its ability to
attest the **amount**.

```
                    amount: none          amount: api
document: api       DigitalOcean          AWS, Azure
                    Atlassian
document: email     Figma, Notion,        Anthropic, OpenAI,
                    Slack, Zoom           GitHub, Cloudflare, Vercel
document: manual    Adobe, Meta Ads,      (none)
                    Amazon Business
```

The bottom-right quadrant is empty today, and the top-right and middle-right are
where the value is: the vendor's own API tells us what we spent, so amount
validation stops being a comparison against a number a human typed into the
registry months ago.

**What each axis buys.**

- `document: api` removes a human from collection entirely.
- `amount: api` turns validation into a real correctness gate. It is the same
  reconciliation the codebase already performs in
  `issueInvoiceForRegistration`, which refuses to issue when the computed total
  disagrees with what Razorpay charged.

A vendor with `amount: api` and `document: email` is well covered. A vendor with
`document: api` and `amount: none` is well covered. Only `document: manual` +
`amount: none` needs a human, and even then the ledger row is tracked.

---

## 3. The interface

Deliberately minimal. Only what at least two vendors need today, with optional
members for the two axes. Over-generalising before the third connector exists
produces abstractions shaped by guesses.

```ts
// lib/finance/connectors/types.ts

export type DocumentCapability = "none" | "list_and_fetch";
export type AmountCapability = "none" | "period_total";

export interface ConnectorCapabilities {
  /** Stable key stored on finance_vendors.connectorKey. */
  readonly key: string;
  readonly vendorSlug: string;
  readonly document: DocumentCapability;
  readonly amount: AmountCapability;
  /** Drives staleness detection in finance_connector_state. */
  readonly expectedIntervalMinutes: number;
  /** Which env vars must be present for this connector to be configured. */
  readonly requiredEnv: readonly string[];
}

export interface InvoiceRef {
  /** Vendor's own identifier. Becomes finance_documents.sourceRef. */
  readonly id: string;
  readonly invoiceNumber?: string;
  readonly issuedOn?: Date;
  readonly periodStart?: Date;
  readonly periodEnd?: Date;
  /** Present when listing already reveals the total; saves an extraction. */
  readonly totalMinor?: number;
  readonly currency?: string;
}

export interface InvoiceArtifact {
  readonly bytes: Uint8Array;
  readonly mime: string;
  readonly filenameHint: string;
  /** Structured fields the API supplied, which outrank anything extracted. */
  readonly structured?: Partial<ExtractedFields>;
}

export interface AttestedAmount {
  readonly periodStart: Date;
  readonly periodEnd: Date;
  readonly totalMinor: number;
  readonly currency: string;
  /** True when the vendor calls this figure provisional (usage still accruing). */
  readonly provisional: boolean;
}

/** Expected outcomes are values. Only bugs throw. */
export type ConnectorResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly kind: ConnectorFailure; readonly message: string };

export type ConnectorFailure =
  | "unconfigured"   // env vars absent. Not an error; nothing to alert on
  | "unauthorized"   // token expired or revoked. Needs a human
  | "rate_limited"   // back off, retry later
  | "unavailable"    // vendor 5xx or network. Retry
  | "not_found"      // the ref is gone
  | "malformed";     // vendor returned something we cannot read

export interface BillingConnector {
  capabilities(): ConnectorCapabilities;
  /** Cheap auth check. Never mutates. Used by health and by setup. */
  probe(): Promise<ConnectorResult<{ account: string }>>;
  listInvoices?(since: Date): Promise<ConnectorResult<InvoiceRef[]>>;
  fetchInvoice?(ref: InvoiceRef): Promise<ConnectorResult<InvoiceArtifact>>;
  periodTotal?(start: Date, end: Date): Promise<ConnectorResult<AttestedAmount>>;
}
```

### 3.1 What a connector must not do

A connector speaks one vendor's protocol and nothing else. It does **not**:

- touch the database,
- write to R2,
- raise exceptions,
- decide retries or backoff,
- log anything beyond returning a message.

All of that is policy, and policy lives in the runner. This is what keeps
vendor-specific behaviour from scattering through the application, and it is
what makes a connector testable against a recorded fixture with no database.

### 3.2 The runner owns policy

`lib/finance/connectors/runner.ts` is the only caller of a connector:

```
for each vendor with a connector, where next_attempt_at has passed:
    write last_attempt_at
    result = connector.listInvoices(since = last_success_at - overlap)
    on ok:
        for each ref not already a document (unique(source, source_ref)):
            artifact = connector.fetchInvoice(ref)
            hash → put to R2 → insert document → validate → match
        consecutive_failures = 0, state = healthy, last_success_at = now
    on unconfigured:
        state = disabled. No exception: not configuring a connector is a choice
    on unauthorized:
        auth_state = expired, state = failing, raise CONNECTOR_FAILURE (critical)
        do not retry. A retry loop against a revoked token is noise, and on
        some vendors it is how an account gets locked
    on rate_limited | unavailable:
        consecutive_failures += 1
        next_attempt_at = now + backoff(consecutive_failures)
        at MAX_CONSECUTIVE_FAILURES: open the circuit, raise CONNECTOR_FAILURE
```

`since = last_success_at - overlap` deliberately re-lists a window that was
already processed. Duplicates are absorbed by `unique(source, source_ref)`, so
overlap is free, whereas a gap loses an invoice permanently. Cheap-to-repeat
beats precise-and-fragile, the same reasoning that demotes the IMAP cursor to an
optimisation.

Backoff, circuit-breaker thresholds and the fallback ladder are specified in
[failure-recovery.md §3](failure-recovery.md).

---

## 4. Vendor capability research

Verified against official vendor documentation on **2026-08-24**. Vendor APIs
change; this table is re-checked before each connector is built, and the check
date is recorded in the connector module.

### 4.1 Document retrieval by API

| Vendor | Endpoint | Auth | Notes | Source |
| --- | --- | --- | --- | --- |
| **DigitalOcean** | `GET /v2/customers/my/invoices`, then `/{uuid}/pdf` and `/{uuid}/csv` | Bearer PAT | Cleanest of the set. The CSV gives exact line items, so extraction is `structured` and no model is involved. Also `doctl invoice pdf`. **Build first**: Fynix already runs on it | [docs](https://docs.digitalocean.com/reference/api/reference/billing/) |
| **AWS** | `GetInvoicePDF` returns a pre-signed S3 URL; `ListInvoiceSummaries` for metadata | SigV4 | GA November 2025. Both axes | [PDF API](https://aws.amazon.com/about-aws/whats-new/2025/11/get-invoice-pdf-api), [summary API](https://aws.amazon.com/about-aws/whats-new/2025/06/aws-invoice-summary-api-generally-available/) |
| **Microsoft Azure** | Billing `Invoices` REST API with download URLs | Entra OAuth | Relevant only if Azure is used | [docs](https://learn.microsoft.com/en-us/rest/api/billing/invoices?view=rest-billing-2024-04-01) |
| **Atlassian** | Commerce REST API, invoices resource | API token | Rate limit documented at 3000 req/min, far above anything needed here | [docs](https://developer.atlassian.com/platform/commerce/rest/api-group-invoices/) |

### 4.2 Amount attestation by API, document by email

| Vendor | Endpoint | Auth | Notes | Source |
| --- | --- | --- | --- | --- |
| **Anthropic** | `/v1/organizations/cost_report` | **Admin key** (`sk-ant-admin…`), distinct from a normal API key and provisionable only by an org admin | Service-level cost breakdown in USD. Explicitly documented for finance cost reconciliation. Not available for Claude on AWS Bedrock | [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api) |
| **OpenAI** | Usage and cost export from the platform dashboard; invoice PDFs from the billing page | API key / console | Cost export is CSV by organisation and project. `/v1/dashboard/billing/*` is an internal dashboard route, undocumented and unstable: **do not build against it**. Treat the CSV export as a semi-manual attestation until a supported endpoint exists | [invoice guide](https://tailride.so/blog/download-openai-api-invoices) |
| **GitHub** | Billing usage report REST API, CSV | PAT with billing scope | GA 4 June 2026, preview from 17 February 2026 | [docs](https://docs.github.com/en/billing/tutorials/automate-usage-reporting), [changelog](https://github.blog/changelog/2026-06-04-api-access-to-billing-usage-reports-now-generally-available/) |
| **Cloudflare** | Billable Usage API | API token with **Billing Read** only | Data refreshed daily, so a same-day figure is provisional. Set `provisional: true` until the period closes | [announcement](https://blog.cloudflare.com/billable-usage-api/) |
| **Vercel** | `/billing/charges`, FOCUS v1.3 format | Bearer token | Cost data only; the invoice PDF remains dashboard or email. FOCUS is an open standard, so the parser is reusable if another vendor adopts it | [changelog](https://vercel.com/changelog/access-billing-usage-cost-data-api) |

### 4.3 Email only

Figma, Notion, Slack, Cursor, Zoom, Google Ads, Google Workspace, and most
Stripe-billed SaaS. No billing or invoice endpoint found in current
documentation for Figma, Slack or Notion; invoices are available to admins
through the billing tab in each product's dashboard and are emailed.

Three message shapes the ingester must handle, not one:

1. **PDF attached.** The simple case.
2. **Link to a hosted invoice.** Stripe-hosted invoices and most "your receipt"
   mails. The ingester follows the link and fetches the PDF. Link-following
   rules are in security-model.md §7, because fetching a URL out of an email is
   a real attack surface.
3. **Inline HTML that is itself the receipt,** with no PDF anywhere. Stripe,
   Shopify and PayPal notification mails. The message is rendered to PDF and
   archived, since something has to exist in the vault.

### 4.4 Portal only

**Adobe, Meta Ads, Amazon Business.** Never emailed, no billing API. Permanently
`document: manual`. Their ledger rows still open on schedule, still go overdue,
still chase a named owner. They are tracked, not automated, and that distinction
is the whole point of §1 of the architecture.

### 4.5 Build order

By spend and by reliability gained, not by technical interest:

1. **DigitalOcean** (`document: api`): we run on it, and the CSV makes
   extraction deterministic.
2. **Anthropic** (`amount: api`): meaningful spend, and the first connector
   that proves the attestation axis.
3. **Vercel** (`amount: api`): same shape, and FOCUS is a standard worth
   having a parser for.
4. **Cloudflare**, **GitHub** (`amount: api`): cheap once the pattern exists.
5. **AWS**, **Azure**, **Atlassian**: only if actually used at material spend.

A connector is not built because the vendor has an API. It is built because the
spend justifies the maintenance.

---

## 5. Adding a vendor

**Not a code change.** Adding a vendor is a registry row:

1. Registry → New vendor: name, slug, category, `vendorKind`, owner team.
2. Set `documentChannel`. `email` is the default and needs only the sender
   domains. `portal_manual` needs `portalUrl`. `api` needs a connector to exist.
3. Add subscriptions: cycle, anchor, expected amount, variance policy, payment
   method, owner email.
4. Phase 0 account work (operations-runbook.md §2): billing contact, GSTIN,
   billing-role member.
5. Periods open automatically from the next cron tick.

**Adding a connector** is a code change, and a small one:

1. `lib/finance/connectors/<slug>.ts` implementing `BillingConnector`.
2. Register it in `lib/finance/connectors/index.ts`.
3. Declare `requiredEnv`; the runner disables the connector when they are absent
   rather than failing.
4. A fixture test against a recorded response. **No test may hit a live vendor
   API**: a test suite that depends on a third party is a test suite that fails
   for reasons unrelated to the change.
5. Set `connectorKey` on the vendor row, then `probe()` from the console.

Nothing else changes. No route, no migration, no UI work. That is the
extensibility requirement in §29 of the directive, and the reason the connector
knows nothing about the database.

---

## 6. Extraction cascade

Applies to every document regardless of channel, because the validation gate
must be identical for all of them. Correction §4.7 in the architecture.

```
1. structured      Fields the source already supplied.
                   Connector `structured`, or a DigitalOcean CSV.
                   Confidence 100. No model involved.
2. deterministic   A known layout with a written parser.
                   Stripe hosted invoices, FOCUS documents.
                   Confidence 90. Falls through on any mismatch.
3. model           General fallback. Strict output schema.
                   Confidence from the model, capped at 80.
```

Then, identically for all three:

```
schema        every required field present and well-typed
arithmetic    subtotal + tax == total, within one minor unit for rounding
sanity        currency is ISO 4217; invoice date is not in the future and not
              more than 400 days old; total > 0 unless documentKind is
              credit_note
attestation   where the vendor has amount: api, compare against the attested
              total. This gate outranks the expected amount, because it is the
              vendor's own figure rather than our expectation
expectation   compare against the period's snapshotted expectation under its
              variance policy:
                fixed       within varianceToleranceBp
                seat_based  seats × unit; a mismatch means the seat count
                            changed, which is itself worth reporting
                usage       no absolute assertion; flag on deviation from the
                            trailing three-period mean
```

**Any failed gate sets `reviewState = 'needs_review'` and puts the period in
`pending_review`.** Nothing marks a period collected except a document that
passed every gate. The model never decides that a period is closed; the
validators do. That is what keeps an adaptable extractor from making the system
non-deterministic.

The document and its bytes are preserved regardless. A document we cannot parse
is still a document we have, and it is visible in the attention queue rather
than absent from the vault.
