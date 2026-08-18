# Pavel workshop: platform split and GST invoicing

**Date:** 2026-08-18
**Status:** Approved for implementation
**Scope:** Final DigitalOcean vs Vercel responsibility split, plus a GST-compliant
invoicing system for the Semantic SEO workshop (INR with GST, USD as zero-rated export).

---

## 1. Context

The Pavel workshop pipeline runs split across two hosts as of 2026-08-18:
the marketing site on Vercel, the API and Postgres on a DigitalOcean droplet at
`api.fynix.digital`. Registrations, payments (Razorpay), confirmation email and
the admin dashboard are live and verified end to end.

There is no invoicing today. Buyers are charged and emailed a confirmation, but
receive no tax invoice. This document settles where each responsibility lives and
specifies the invoicing system.

### Facts established from the codebase

- **Pricing is GST-exclusive.** `PRICING.IN` is a base of ₹7,499 with
  `unitAmount: 884882` (₹8,848.82), which is base plus 18%. USD is $99 flat with
  no tax added. Any invoice logic that assumes tax-inclusive pricing computes the
  wrong taxable value.
- **The charged amount is not stored numerically.** `checkout` persists only
  `amountDisplay` (a formatted string) and `discountPercent`. An invoice must
  never parse a display string, so this is a schema gap to close.
- **Certificates use browser print-to-PDF** (`window.print()` plus print CSS).
  That works for a user-initiated certificate but cannot produce a buffer to
  attach to an email, which an invoice needs.
- **Referral discounts exist** and are applied to the gross amount today. Tax must
  be computed on the discounted taxable value, so the order of operations matters.

---

## 2. Platform responsibility split (decided)

**Rule: if it touches the database, a secret, or a schedule, it runs on the
droplet. If it is public, cacheable and marketing-facing, it stays on Vercel.**

| Concern | Home | Rationale |
| --- | --- | --- |
| Marketing site, `/pavel` landing, SEO/OG assets | Vercel | CDN and ISR; the edge geo header drives ₹/$ pricing |
| All `/api/pavel/*` | Droplet | needs the database and payment secrets |
| Admin console (`/admin`, `/admin/pavel`) | Vercel | reads the droplet's `/api/admin/data/*` |
| Postgres (single database) | Droplet | one source of truth, bound to localhost |
| Reminder cron | Droplet (systemd timer) | already implemented |
| Transactional email (Brevo) | Droplet | triggered by database state changes |
| Razorpay webhook | Droplet | needs the shared secret and the database |
| **Invoice generation** | Droplet | needs the database, gapless numbering, must be authoritative |
| **Certificate issuance** | Droplet (to be moved) | must be verified against a `paid` registration |

Only one change from the current state: the certificate page should move behind
the droplet so a certificate can only be issued against a verified paid
registration, rather than being a public page that renders any supplied name.
That is a separate follow-up, not part of this spec's implementation phases.

---

## 3. Tax rules

Seller: **Digibranders Private Limited**, GSTIN `27AAICD9268J1Z0`, Maharashtra
(state code 27), CIN `U72900MH2021PTC372344`, trading as **Fynix Digital**.

| Buyer location | Supply type | Tax lines | Total rate |
| --- | --- | --- | --- |
| Maharashtra | Intra-state | CGST 9% + SGST 9% | 18% |
| Any other Indian state | Inter-state | IGST 18% | 18% |
| Outside India | Export of service | None (zero-rated under LUT) | 0% |

Export invoices carry the declaration:
`SUPPLY MEANT FOR EXPORT UNDER LUT WITHOUT PAYMENT OF IGST`.

LUT status is a **configuration flag**, not a hardcoded assumption, so it can be
switched if the LUT lapses or the treatment changes.

### Order of operations (canonical)

Rounding must be defined once and applied everywhere, or the invoice total will
drift from the amount actually charged:

1. `taxable = round(base * (1 - discountPercent/100))`
2. `totalTax = round(taxable * 0.18)` for taxable Indian supplies, else `0`
3. Split for intra-state: `cgst = floor(totalTax / 2)`, `sgst = totalTax - cgst`
   (guarantees the two lines sum exactly to `totalTax`)
4. `total = taxable + totalTax`

All amounts are integers in the currency's minor unit (paise, cents). No floats
are stored or compared.

**Required refactor:** `PRICING` must expose the taxable `base` and the charge
must be derived as base → discount → tax → total. Today the discount is applied to
the gross amount instead.

Verified 2026-08-18 by exhaustive check at the current price:

- `749900 + round(749900 * 0.18) = 884882`, exactly today's `PRICING.IN.unitAmount`.
- Across all discount values 0 to 100, the derived total equals the amount the
  current code charges. **Zero divergence**, so this refactor changes no price.
- The `floor`/remainder split keeps `cgst + sgst == totalTax` at every value,
  including odd-paise cases (at 15% the split is 573.67 and 573.68).

The refactor is therefore non-breaking today. It is still required, because the
agreement is currently a coincidence of this particular base; deriving both the
charge and the invoice from one base makes them identical by construction at any
future price or discount.

---

## 4. Invoice numbering

GST requires a serial number that is consecutive, unique within a financial year,
and at most 16 characters. The Indian financial year runs 1 April to 31 March, so
the September 2026 workshop falls in FY 2026-27.

- **Format:** `FYX/26-27/0001` (14 characters)
- **Series:** dedicated `FYX` prefix, deliberately separate from the OyeChats `DB`
  series. The two products are separate codebases and databases, so a shared
  counter would race and risk duplicate numbers.
- **Allocation:** inside the same database transaction that marks the
  registration paid, using a counter row locked for update. Never `count(*)`,
  which races under concurrent payments and produces duplicates.
- **Immutability:** once issued, an invoice is never edited. Corrections are
  issued as a credit note against the original number.

---

## 5. Data model

### New table: `invoices`

| Column | Notes |
| --- | --- |
| `id` | uuid primary key |
| `registration_id` | unique FK, so one invoice per registration (idempotency) |
| `invoice_no` | unique, e.g. `FYX/26-27/0001` |
| `fy` | e.g. `2026-27` |
| `issued_at` | timestamptz, defaults to the payment time |
| `supply_type` | `intra` \| `inter` \| `export` |
| `place_of_supply` | state name plus GST state code, or country for exports |
| `currency` | `INR` \| `USD` |
| `taxable_value`, `cgst`, `sgst`, `igst`, `total` | integers, minor units |
| `buyer_*` snapshot | name, email, gstin, company, address |
| `seller_*` snapshot | legal name, trade name, gstin, address, CIN, SAC |

Snapshotting both parties is deliberate: if the registered address, rate or trade
name changes in a later year, a previously issued invoice must still reproduce
exactly as issued.

### New table: `invoice_counters`

`(fy, prefix)` unique, with `last_seq`. Locked for update during allocation.

### Change to `registrations`

Add `amount_charged` (integer, minor units) and `currency`. This closes the gap
where only a formatted display string is stored, and `checkout` must populate it
at order creation.

---

## 6. Rendering and delivery

**Engine: `@react-pdf/renderer`, server-side on the droplet.**

Chosen over headless Chrome, which needs roughly 300MB or more per render and
would compete with the live API on a 1GB droplet. Chosen over the certificate's
print-to-PDF approach because that cannot produce a buffer to attach to email,
and B2B buyers expect the tax invoice in their inbox.

The stored invoice row is the source of truth; the PDF is a deterministic render
of it and can be regenerated at any time.

### Invoice contents

Seller legal name and trade name, GSTIN, CIN, registered address, support email,
phone and website; invoice number and date; buyer name, email, and (when
supplied) company name, GSTIN and billing address; place of supply; SAC code;
description of service; taxable value; the applicable tax lines; total; total in
words (Indian numbering for INR); "tax payable on reverse charge: No"; and the
export declaration on USD invoices.

### Delivery

1. PDF attached to the existing confirmation email.
2. Permalink at `/pavel/invoice/[ref]`, access-gated the same way as thank-you
   verification, for re-download.
3. Admin dashboard column with a download link.

---

## 7. Implementation phases

**Phase 1: foundations**
1. Migration: `amount_charged` and `currency` on registrations; `invoices`;
   `invoice_counters`.
2. Refactor `PRICING` to carry the taxable base; derive the charge as
   base → discount → tax → total; persist the numeric charged amount in `checkout`.
3. `lib/pavel/tax.ts`: a pure function
   `(country, state, base, discountPercent) → {supplyType, taxable, cgst, sgst, igst, total}`,
   unit-tested against Maharashtra, other-state and export cases including
   rounding edges. This is the piece that must be provably correct.
4. `lib/pavel/invoiceNumber.ts`: transactional, FY-scoped allocator.

**Phase 2: issuance**
5. Issue the invoice inside `lib/pavel/confirm.ts` on the paid transition,
   idempotent in the same manner as `email_log`, so a webhook retry cannot
   double-issue.
6. Seller profile as configuration (env-backed), not literals scattered in the
   template.
7. `@react-pdf/renderer` invoice template.

**Phase 3: delivery**
8. Attach the PDF to the confirmation email via Brevo.
9. `/pavel/invoice/[ref]` permalink.
10. Admin dashboard integration.

**Phase 4: verification**
11. Prove all three tax paths: a Maharashtra buyer (CGST+SGST), a non-Maharashtra
    Indian buyer (IGST), and a USD buyer (zero-rated with the LUT declaration).
12. Confirm the invoice total always equals the amount Razorpay actually charged.
13. Decide whether to backfill or delete the existing paid test registration
    (`PVL-F77FCF60`) before launch.

---

## 8. Open items requiring confirmation from the business or its CA

These do not block Phase 1, but must be settled before real invoices are issued:

- **SAC code.** The screenshot shows `997331` (licensing of software/databases),
  which fits OyeChats. A live training workshop is more plausibly `999293`
  (commercial training and coaching services). Copying `997331` unexamined would
  misclassify the supply.
- **LUT validity** for FY 2026-27, since export invoices depend on it.
- **E-invoicing (IRN).** If Digibranders' aggregate turnover crosses the
  threshold, B2B invoices must be registered on the government portal to obtain an
  IRN and QR code. Out of scope here; flagged because retrofitting it is
  disruptive.

## 9. Non-goals

Credit notes (the data model accommodates them; no UI is built), e-invoicing/IRN
integration, TDS/TCS handling, and multi-entity invoicing.
