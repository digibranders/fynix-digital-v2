# Referral Code Admin System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `/admin/pavel` a full referral-code console — create, edit, retire, cap and expire codes, attribute them to partners, and see per-code redemptions, net revenue and commission owed — while making an invalid code impossible to redeem or mis-attribute.

**Architecture:** Extends the existing `referral_codes` table with limits (`max_uses`, `expires_at`) and partner fields (`owner_name`, `owner_email`, `commission_percent`). The discount decision moves from a boolean lookup to a pure `decideReferral()` function that returns a typed rejection reason, so the buyer is told *why* a code failed and checkout can refuse rather than silently charging full price. Admin reads/writes follow the established split: direct Postgres where reachable (droplet, local dev), the droplet's internal `/api/admin/data/*` API from Vercel. Redemption counts come from `registrations` (operational truth); money comes from `invoices.taxable_value` (ex-GST, the correct commission base).

**Tech Stack:** Next.js 16 App Router, React 19, Drizzle ORM + Postgres, Vitest, Tailwind.

---

## Design decisions (locked)

| Decision | Choice | Consequence |
|---|---|---|
| Discount type | Percent only | `computeTax()` is untouched. No migration risk to issued invoices. |
| Limits | `max_uses` + `expires_at` | Both nullable; null means unlimited / never expires. |
| Invalid code | Block, store nothing | `registrations.referral_code` only ever holds a code that validated. Attribution becomes exact. |
| Payouts | Owner + commission % | Panel reports commission owed per partner. |

**Redemption counting.** A redemption is a row in `registrations` with `status = 'paid'` **and** `discount_percent > 0`. Pending seats do not consume a slot — a cap limits how many discounted seats are *sold*, not how many are *attempted*. Enforced at checkout (the money moment).

**Accepted race.** Two buyers checking out simultaneously on the last remaining slot can both pass the cap check, because the count is read without reserving. At workshop scale a one-seat overshoot is acceptable and visible in the panel (`redeemed` exceeds `maxUses`, rendered as an over-cap warning). Reserving would mean holding a row lock across a Razorpay round trip, which is worse. Do not "fix" this silently — it is a deliberate trade.

**Revenue source.** `invoices.taxable_value` is the ex-GST value. Commission is paid on that, never on `registrations.amount_charged`, which includes 18% GST for Indian buyers and would overpay every partner.

---

## File structure

| File | Responsibility |
|---|---|
| `lib/db/schema.ts` | Add 5 columns to `referralCodes`. |
| `drizzle/0018_*.sql` | Generated migration. |
| `lib/pavel/referral.ts` | **Rewrite.** Pure `decideReferral()` + DB-backed `evaluateReferral()`. |
| `lib/pavel/referral.test.ts` | Create. Unit tests for the pure decision logic. |
| `app/api/pavel/referral/route.ts` | Return the typed rejection reason. |
| `app/api/pavel/register/route.ts` | Validate + store normalized, reject invalid. |
| `app/api/pavel/checkout/route.ts` | Refuse a sale carrying a now-invalid code. |
| `components/pavel/CheckoutModal.tsx` | Send only the applied code; surface a blocked checkout. |
| `lib/admin/referrals.ts` | Create. Row/stat types, pure stat helpers, gateway-aware load + mutate. |
| `lib/admin/referrals.test.ts` | Create. Unit tests for `referralStatus()` and commission maths. |
| `app/api/admin/data/referrals/route.ts` | Create. Droplet-side GET (list + stats) and POST (create/update/toggle/delete). |
| `components/admin/ReferralPanel.tsx` | Create. Client component: filters, search, CRUD forms, per-code analytics. |
| `app/admin/pavel/page.tsx` | Wire the panel in with authorised server actions. |
| `scripts/seed-referrals.ts` | Keep working against the widened table. |

---

### Task 1: Widen the referral_codes schema

**Files:**
- Modify: `lib/db/schema.ts:117-126`
- Create: `drizzle/0018_<generated>.sql`

- [ ] **Step 1: Add the columns**

Replace the `referralCodes` table definition in `lib/db/schema.ts` with:

```ts
/**
 * Referral / promo codes. A code entered at checkout applies a percentage
 * discount to the order amount. Looked up server-side only (checkout + the
 * /api/pavel/referral validation route) so the discount can never be forged by
 * the client. `code` is stored normalised (uppercase, no spaces).
 *
 * A code is redeemable only while `active`, before `expiresAt`, and while
 * redemptions remain under `maxUses`. Both limits are nullable: null means
 * "no limit", which is what every pre-existing code gets on migration.
 */
export const referralCodes = pgTable("referral_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // normalised, e.g. 'STEVE10'
  discountPercent: integer("discount_percent").notNull(), // 1–100
  active: boolean("active").notNull().default(true),
  label: text("label"), // human note, e.g. 'Steve — partner code'

  /**
   * Redemption cap. Counted against PAID registrations that actually received
   * the discount, so an abandoned checkout never burns a slot. Null = unlimited.
   */
  maxUses: integer("max_uses"),
  /** Hard expiry. Null = never expires. */
  expiresAt: timestamp("expires_at", { withTimezone: true }),

  // Partner attribution. Kept here rather than in a separate table: a code has
  // exactly one owner, and a join would buy nothing.
  ownerName: text("owner_name"),
  ownerEmail: text("owner_email"),
  /** Commission owed to the owner, as a whole percent of ex-GST revenue. */
  commissionPercent: integer("commission_percent"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

- [ ] **Step 2: Generate the migration**

```bash
npm run db:generate
```

Expected: a new `drizzle/0018_*.sql` containing five `ALTER TABLE "referral_codes" ADD COLUMN` statements. All columns are nullable or defaulted, so existing rows migrate cleanly and every existing code keeps working with no limits.

- [ ] **Step 3: Verify the generated SQL adds nothing NOT NULL without a default**

Read the generated file. If any column is `NOT NULL` without `DEFAULT`, the migration will fail on a non-empty table — fix the schema and regenerate.

- [ ] **Step 4: Apply locally**

```bash
npm run db:push
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(referrals): add limits and partner attribution to referral codes"
```

---

### Task 2: Pure referral decision logic

Splitting the decision from the database is what makes it testable. `decideReferral()` takes plain data and returns a verdict; nothing in it touches Drizzle.

**Files:**
- Modify: `lib/pavel/referral.ts` (full rewrite)
- Create: `lib/pavel/referral.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/pavel/referral.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { decideReferral, referralRejectionMessage } from "@/lib/pavel/referral";

const NOW = new Date("2026-08-19T10:00:00Z");

/** A healthy, unlimited code. Each test overrides only what it is about. */
function rules(overrides: Partial<Parameters<typeof decideReferral>[0] & object> = {}) {
  return {
    code: "STEVE10",
    discountPercent: 10,
    active: true,
    expiresAt: null,
    maxUses: null,
    ...overrides,
  };
}

describe("decideReferral", () => {
  it("accepts an active, unlimited code", () => {
    expect(decideReferral(rules(), 0, NOW)).toEqual({
      ok: true,
      code: "STEVE10",
      discountPercent: 10,
    });
  });

  it("rejects a code that does not exist", () => {
    expect(decideReferral(null, 0, NOW)).toEqual({ ok: false, reason: "unknown" });
  });

  it("rejects a switched-off code", () => {
    expect(decideReferral(rules({ active: false }), 0, NOW)).toEqual({
      ok: false,
      reason: "inactive",
    });
  });

  it("rejects a code past its expiry", () => {
    const expired = rules({ expiresAt: new Date("2026-08-18T23:59:59Z") });
    expect(decideReferral(expired, 0, NOW)).toEqual({ ok: false, reason: "expired" });
  });

  it("accepts a code whose expiry is still in the future", () => {
    const live = rules({ expiresAt: new Date("2026-08-20T00:00:00Z") });
    expect(decideReferral(live, 0, NOW).ok).toBe(true);
  });

  it("rejects a code that has hit its cap", () => {
    expect(decideReferral(rules({ maxUses: 5 }), 5, NOW)).toEqual({
      ok: false,
      reason: "exhausted",
    });
  });

  it("rejects a code that has overshot its cap", () => {
    expect(decideReferral(rules({ maxUses: 5 }), 6, NOW)).toEqual({
      ok: false,
      reason: "exhausted",
    });
  });

  it("accepts a code with one slot left", () => {
    expect(decideReferral(rules({ maxUses: 5 }), 4, NOW).ok).toBe(true);
  });

  it("rejects a nonsensical discount rather than charging a wrong price", () => {
    expect(decideReferral(rules({ discountPercent: 0 }), 0, NOW)).toEqual({
      ok: false,
      reason: "unknown",
    });
    expect(decideReferral(rules({ discountPercent: 101 }), 0, NOW)).toEqual({
      ok: false,
      reason: "unknown",
    });
  });

  it("gives every rejection a buyer-readable message", () => {
    for (const reason of ["unknown", "inactive", "expired", "exhausted", "unavailable"] as const) {
      expect(referralRejectionMessage(reason).length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/pavel/referral.test.ts
```

Expected: FAIL — `decideReferral` is not exported.

- [ ] **Step 3: Rewrite `lib/pavel/referral.ts`**

```ts
import { and, count, eq, gt } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { referralCodes, registrations } from "@/lib/db/schema";
import { normalizeReferralCode } from "@/components/pavel/pricing";

/** Why a code cannot be redeemed. Drives the message the buyer sees. */
export type ReferralRejection =
  | "unknown" // no such code, or its discount is out of range
  | "inactive" // switched off by an operator
  | "expired" // past its expiry
  | "exhausted" // redemption cap reached
  | "unavailable"; // could not be verified right now (database trouble)

/** A validated, redeemable code and the discount it grants. */
export type ReferralDiscount = {
  code: string;
  discountPercent: number;
};

export type ReferralEvaluation =
  | ({ ok: true } & ReferralDiscount)
  | { ok: false; reason: ReferralRejection };

/** The stored fields a redemption decision depends on. */
export type ReferralRules = {
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt: Date | null;
  maxUses: number | null;
};

/**
 * Decide whether a code may be redeemed, given its rules, how many times it has
 * already been redeemed, and the current time.
 *
 * Pure by design: no database, no clock of its own. That is what lets the rules
 * be unit tested exhaustively, and it keeps the ordering of the checks explicit
 * — a code that is both expired and exhausted reports "expired", because that is
 * the fact an operator most needs to see first.
 */
export function decideReferral(
  rules: ReferralRules | null,
  redemptions: number,
  now: Date
): ReferralEvaluation {
  if (!rules) return { ok: false, reason: "unknown" };

  // An out-of-range discount is a corrupt row, not a business state. Reporting
  // it as "unknown" keeps a broken code from ever pricing an order.
  if (
    !Number.isFinite(rules.discountPercent) ||
    rules.discountPercent <= 0 ||
    rules.discountPercent > 100
  ) {
    return { ok: false, reason: "unknown" };
  }

  if (!rules.active) return { ok: false, reason: "inactive" };
  if (rules.expiresAt && rules.expiresAt.getTime() <= now.getTime()) {
    return { ok: false, reason: "expired" };
  }
  if (rules.maxUses !== null && redemptions >= rules.maxUses) {
    return { ok: false, reason: "exhausted" };
  }

  return { ok: true, code: rules.code, discountPercent: rules.discountPercent };
}

/** Buyer-facing explanation for a rejection. Never leaks operator detail. */
export function referralRejectionMessage(reason: ReferralRejection): string {
  switch (reason) {
    case "inactive":
      return "That code is no longer active.";
    case "expired":
      return "That code has expired.";
    case "exhausted":
      return "That code has been fully claimed.";
    case "unavailable":
      return "We couldn’t check that code just now. Please try again.";
    case "unknown":
    default:
      return "That code isn’t valid.";
  }
}

/**
 * Count redemptions of a code: PAID seats that actually received a discount.
 *
 * Pending seats are excluded deliberately — a cap limits how many discounted
 * seats are sold, not how many people started a checkout. Comparing against
 * `discountPercent > 0` rather than merely matching the code means a seat that
 * was recorded before the code was capped still counts, and a full-price seat
 * carrying the code as attribution does not.
 */
export async function countRedemptions(db: Db, code: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.referralCode, code),
        eq(registrations.status, "paid"),
        gt(registrations.discountPercent, 0)
      )
    );
  return row?.value ?? 0;
}

/**
 * Look up a code and decide whether it may be redeemed right now.
 *
 * Returns a typed rejection rather than a bare null so callers can tell the
 * buyer WHY, and so a transient database failure ("unavailable") is
 * distinguishable from a genuinely bad code. Callers must not treat
 * "unavailable" as "no discount" and charge full price: that silently bills
 * someone the wrong amount.
 */
export async function evaluateReferral(
  db: Db,
  rawCode: string | null | undefined,
  now: Date = new Date()
): Promise<ReferralEvaluation> {
  const code = rawCode ? normalizeReferralCode(rawCode) : "";
  if (!code) return { ok: false, reason: "unknown" };

  try {
    const [row] = await db
      .select({
        code: referralCodes.code,
        discountPercent: referralCodes.discountPercent,
        active: referralCodes.active,
        expiresAt: referralCodes.expiresAt,
        maxUses: referralCodes.maxUses,
      })
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (!row) return { ok: false, reason: "unknown" };

    // Only pay for the count when there is a cap to enforce.
    const redemptions = row.maxUses === null ? 0 : await countRedemptions(db, row.code);
    return decideReferral(row, redemptions, now);
  } catch (error) {
    console.error("[pavel/referral] lookup failed", error);
    return { ok: false, reason: "unavailable" };
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/pavel/referral.test.ts
```

Expected: PASS, 10 tests.

- [ ] **Step 5: Confirm nothing still imports the removed `lookupReferral`**

```bash
grep -rn "lookupReferral" app lib components scripts
```

Expected: two hits — `app/api/pavel/checkout/route.ts` and `app/api/pavel/referral/route.ts`. Both are rewritten in Tasks 3 and 5. The build is knowingly red until then; do not commit yet.

- [ ] **Step 6: Commit after Task 5 makes the build green.** (No commit at this step.)

---

### Task 3: Report the rejection reason from the validation route

**Files:**
- Modify: `app/api/pavel/referral/route.ts`

- [ ] **Step 1: Replace the body of the POST handler**

Replace lines 1-50 of `app/api/pavel/referral/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { evaluateReferral, referralRejectionMessage } from "@/lib/pavel/referral";
import { normalizeReferralCode } from "@/components/pavel/pricing";

export const runtime = "nodejs";

/**
 * Validate a referral code for the checkout modal so the buyer sees the
 * discount — or the reason it was refused — before paying. The authoritative
 * discount is re-derived server-side when the Razorpay order is created
 * (/api/pavel/checkout), so a tampered response here can never change what is
 * actually charged.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
  }

  const raw =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).code === "string"
      ? (body as Record<string, string>).code
      : "";
  const code = normalizeReferralCode(raw);
  if (!code) {
    return NextResponse.json({ valid: false, error: "Enter a referral code." }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { valid: false, error: referralRejectionMessage("unavailable") },
      { status: 503 }
    );
  }

  const result = await evaluateReferral(db, code);
  if (!result.ok) {
    // A transient failure is a 503, not a verdict on the code: answering 200
    // here would tell the buyer their good code is bad.
    const status = result.reason === "unavailable" ? 503 : 200;
    return NextResponse.json(
      { valid: false, reason: result.reason, error: referralRejectionMessage(result.reason) },
      { status }
    );
  }

  return NextResponse.json({
    valid: true,
    code: result.code,
    discountPercent: result.discountPercent,
  });
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: the only remaining errors are in `app/api/pavel/checkout/route.ts` (fixed in Task 5).

---

### Task 4: Reject invalid codes at registration

A code that cannot be redeemed must never reach the database. This is what makes `registrations.referral_code` exact enough to report on.

**Files:**
- Modify: `app/api/pavel/register/route.ts:112-116` and `:190-215`

- [ ] **Step 1: Add the import**

Add to the import block at the top of `app/api/pavel/register/route.ts`:

```ts
import { evaluateReferral, referralRejectionMessage } from "@/lib/pavel/referral";
```

- [ ] **Step 2: Replace the "trust whatever was typed" block**

Replace lines 112-116:

```ts
  // Optional referral code — trimmed and length-capped so a stray value can't
  // bloat the row; attribution only, no discount is applied here.
  const attendeeReferral =
    (referralCode && typeof referralCode === "string" && referralCode.trim().slice(0, 60)) ||
    null;
```

with:

```ts
  // Optional referral code. Nothing is stored unless it validates.
  //
  // Storing whatever was typed is how a typo ('STEVE 10', 'steve1O') became a
  // row that looks like partner attribution, grants no discount, and never
  // reconciles against a payout report. A code either earns its place on the
  // row or the registration is refused outright, so this column can be counted
  // on for money.
  const typedReferral =
    typeof referralCode === "string" && referralCode.trim() ? referralCode : null;
```

- [ ] **Step 3: Validate before the insert**

Insert immediately before `const ref = generateRef();` (currently line 190):

```ts
  // Validate the code here, not merely at checkout. Refusing at the point it was
  // typed tells the buyer while they can still fix it, and keeps an unredeemable
  // code out of the row entirely.
  let attendeeReferral: string | null = null;
  if (typedReferral) {
    const result = await evaluateReferral(db, typedReferral);
    if (!result.ok) {
      return NextResponse.json(
        { error: referralRejectionMessage(result.reason), referralRejected: true },
        { status: result.reason === "unavailable" ? 503 : 400 }
      );
    }
    attendeeReferral = result.code;
  }
```

`attendeeReferral` is still the name used by the existing `db.insert(...)` call at line 202, so that line needs no change.

- [ ] **Step 4: Typecheck and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: only the checkout route still errors.

---

### Task 5: Refuse a sale carrying a now-invalid code

**Files:**
- Modify: `app/api/pavel/checkout/route.ts:12` and `:165-183`

- [ ] **Step 1: Swap the import**

Replace line 12:

```ts
import { lookupReferral } from "@/lib/pavel/referral";
```

with:

```ts
import { evaluateReferral, referralRejectionMessage } from "@/lib/pavel/referral";
```

- [ ] **Step 2: Replace the discount derivation**

Replace lines 165-183:

```ts
  // Re-validate the stored referral code server-side and derive the discount
  // here — never trust a discount from the client. Falls back to full price for
  // an empty, unknown, or inactive code.
  const referral = await lookupReferral(db, registration.referralCode);
```

with:

```ts
  // Re-validate the stored code and derive the discount here — never trust a
  // discount from the client.
  //
  // A code can go stale between reserving a seat and paying for it: it may
  // expire, be switched off, or have its last slot taken by someone else. The
  // sale is refused rather than quietly repriced. Charging the list price to
  // someone who reached this point expecting a discount is the one outcome that
  // is worse than an error message.
  let referral: { code: string; discountPercent: number } | null = null;
  if (registration.referralCode) {
    const result = await evaluateReferral(db, registration.referralCode);
    if (!result.ok) {
      console.warn(
        "[pavel/checkout] refused: referral no longer redeemable",
        registration.referralCode,
        result.reason
      );
      return NextResponse.json(
        {
          error: `${referralRejectionMessage(result.reason)} Please remove it and try again.`,
          referralRejected: true,
        },
        { status: result.reason === "unavailable" ? 503 : 409 }
      );
    }
    referral = { code: result.code, discountPercent: result.discountPercent };
  }
```

The `tax` / `chargeAmount` / `chargeDisplay` block below it (lines 173-183) already reads `referral?.discountPercent ?? 0` and needs no change.

- [ ] **Step 3: Typecheck, lint and run the full suite**

```bash
npx tsc --noEmit && npm run lint && npm test
```

Expected: clean. `lib/pavel/checkoutQuote.test.ts` must still pass — if it referenced `lookupReferral`, update it to `evaluateReferral`.

- [ ] **Step 4: Commit the enforcement half**

```bash
git add lib/pavel/referral.ts lib/pavel/referral.test.ts app/api/pavel
git commit -m "feat(referrals): enforce expiry and redemption caps, refuse invalid codes"
```

---

### Task 6: Send only the applied code from the checkout modal

**Files:**
- Modify: `components/pavel/CheckoutModal.tsx:540`

- [ ] **Step 1: Send the validated code, not the typed one**

Replace line 540:

```ts
          ...(referralCode.trim() ? { referralCode: referralCode.trim() } : {}),
```

with:

```ts
          // Send the code that VALIDATED, never the raw input. The server
          // re-checks it regardless, but sending the typed string meant a code
          // the buyer had already been told was invalid still travelled with the
          // registration — and now that the server refuses those, it would fail
          // a checkout the buyer had no way to see was broken.
          ...(appliedReferral ? { referralCode: appliedReferral.code } : {}),
```

- [ ] **Step 2: Surface a server-side referral rejection**

Find the block that handles a failed `/api/pavel/register` or `/api/pavel/checkout` response and add, before the generic error is shown:

```ts
      // The code went stale between validation and payment (expired, switched
      // off, or its last slot taken). Drop the applied discount so the quoted
      // price stops claiming one, and reopen the field so it can be corrected.
      if (data.referralRejected) {
        setAppliedReferral(null);
        setReferralOpen(true);
        setReferralError(data.error ?? "That code is no longer valid.");
      }
```

Type the parsed response to include `referralRejected?: boolean` alongside `error?: string`.

- [ ] **Step 3: Verify in the browser**

Start the dev server and confirm: a good code still applies and pays; a made-up code is refused with "That code isn't valid."; a code you expire in the database mid-session is refused at checkout with the field reopened.

- [ ] **Step 4: Commit**

```bash
git add components/pavel/CheckoutModal.tsx
git commit -m "fix(checkout): send only a validated referral code and surface rejections"
```

---

### Task 7: Admin referral types, stats and gateway

Mirrors `lib/admin/sessions.ts` exactly — same load/mutate split, same gateway fallback, same error-as-value handling.

**Files:**
- Create: `lib/admin/referrals.ts`
- Create: `lib/admin/referrals.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/admin/referrals.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  commissionOwed,
  referralStatus,
  type AdminReferralRow,
} from "@/lib/admin/referrals";

const NOW = new Date("2026-08-19T10:00:00Z");

function row(overrides: Partial<AdminReferralRow> = {}): AdminReferralRow {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    code: "STEVE10",
    discountPercent: 10,
    active: true,
    label: null,
    ownerName: null,
    ownerEmail: null,
    commissionPercent: null,
    maxUses: null,
    expiresAt: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    redeemed: 0,
    attributed: 0,
    pending: 0,
    netRevenueInr: 0,
    netRevenueUsd: 0,
    ...overrides,
  };
}

describe("referralStatus", () => {
  it("reports a healthy code as active", () => {
    expect(referralStatus(row(), NOW)).toBe("active");
  });

  it("reports a switched-off code as inactive", () => {
    expect(referralStatus(row({ active: false }), NOW)).toBe("inactive");
  });

  it("reports a past expiry as expired", () => {
    expect(referralStatus(row({ expiresAt: "2026-08-18T00:00:00.000Z" }), NOW)).toBe("expired");
  });

  it("reports a reached cap as exhausted", () => {
    expect(referralStatus(row({ maxUses: 3, redeemed: 3 }), NOW)).toBe("exhausted");
  });

  it("reports an overshot cap as exhausted", () => {
    expect(referralStatus(row({ maxUses: 3, redeemed: 4 }), NOW)).toBe("exhausted");
  });

  it("prefers inactive over expired, because that is the operator's own doing", () => {
    expect(
      referralStatus(row({ active: false, expiresAt: "2026-08-18T00:00:00.000Z" }), NOW)
    ).toBe("inactive");
  });
});

describe("commissionOwed", () => {
  it("is zero when no commission is set", () => {
    expect(commissionOwed(row({ netRevenueInr: 100_000 }))).toEqual({ inr: 0, usd: 0 });
  });

  it("takes a whole percent of ex-GST revenue in each currency", () => {
    const owed = commissionOwed(
      row({ commissionPercent: 20, netRevenueInr: 100_000, netRevenueUsd: 9_900 })
    );
    expect(owed).toEqual({ inr: 20_000, usd: 1_980 });
  });

  it("rounds to a whole minor unit", () => {
    expect(commissionOwed(row({ commissionPercent: 33, netRevenueInr: 101 }))).toEqual({
      inr: 33,
      usd: 0,
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/admin/referrals.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/admin/referrals.ts`**

```ts
import { and, count, desc, eq, gt, sql, sum } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { invoices, referralCodes, registrations } from "@/lib/db/schema";
import {
  AdminGatewayError,
  adminGatewayFetch,
  hasLocalDb,
} from "@/lib/admin/gateway";
import { normalizeReferralCode } from "@/components/pavel/pricing";

/**
 * Referral codes, as the console sees them: the stored rules plus the usage
 * they have actually seen.
 *
 * Same split as registrations and sessions — direct Postgres where reachable,
 * the droplet's internal admin API from Vercel.
 *
 * Two different sources back the numbers, deliberately:
 *
 *   - Usage counts come from `registrations`, the operational record. A seat
 *     counts as redeemed the moment it is paid, whether or not its invoice was
 *     issued successfully.
 *   - Money comes from `invoices.taxable_value`, which is EX-GST. Commission is
 *     owed on what was earned, not on the tax collected on top of it; paying on
 *     the gross would overpay every Indian sale by 18%.
 *
 * When the two disagree, an invoice failed to issue. The panel shows both so
 * that is visible rather than silently absorbed.
 */

export type AdminReferralRow = {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  label: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  commissionPercent: number | null;
  maxUses: number | null;
  expiresAt: string | null; // ISO
  createdAt: string; // ISO

  /** Paid seats that actually received the discount. Counts against `maxUses`. */
  redeemed: number;
  /** Paid seats carrying this code at all, discounted or not. */
  attributed: number;
  /** Unpaid registrations carrying this code. Pipeline, not revenue. */
  pending: number;
  /** Ex-GST invoiced revenue, in minor units, per currency. */
  netRevenueInr: number;
  netRevenueUsd: number;
};

/** What an operator sees at a glance. Derived, never stored. */
export type ReferralStatus = "active" | "inactive" | "expired" | "exhausted";

export const REFERRALS_DATA_PATH = "/api/admin/data/referrals";

/**
 * The one-word state of a code.
 *
 * Order matters. A code switched off by hand reports "inactive" even if it is
 * also expired, because that is the operator's own decision and the one they
 * need to see to undo it.
 */
export function referralStatus(row: AdminReferralRow, now: Date = new Date()): ReferralStatus {
  if (!row.active) return "inactive";
  if (row.expiresAt && new Date(row.expiresAt).getTime() <= now.getTime()) return "expired";
  if (row.maxUses !== null && row.redeemed >= row.maxUses) return "exhausted";
  return "active";
}

/** Commission owed to the code's owner, in minor units per currency. */
export function commissionOwed(row: AdminReferralRow): { inr: number; usd: number } {
  const pct = row.commissionPercent;
  if (!pct || pct <= 0) return { inr: 0, usd: 0 };
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return {
    inr: Math.round((row.netRevenueInr * clamped) / 100),
    usd: Math.round((row.netRevenueUsd * clamped) / 100),
  };
}

export type LoadReferralsResult = {
  codes: AdminReferralRow[];
  error: string | null;
};

function isReferralRow(value: unknown): value is AdminReferralRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.code === "string" &&
    typeof row.discountPercent === "number" &&
    typeof row.active === "boolean" &&
    typeof row.redeemed === "number"
  );
}

/** Read every code with its usage, straight from Postgres. */
export async function queryReferrals(): Promise<AdminReferralRow[]> {
  const db = getDb();
  if (!db) throw new Error("queryReferrals called without a database connection.");

  const codes = await db
    .select()
    .from(referralCodes)
    .orderBy(desc(referralCodes.createdAt));

  // Usage per code, in one grouped pass rather than a query per row.
  const usage = await db
    .select({
      code: registrations.referralCode,
      redeemed: count(
        sql`case when ${registrations.status} = 'paid' and ${registrations.discountPercent} > 0 then 1 end`
      ),
      attributed: count(sql`case when ${registrations.status} = 'paid' then 1 end`),
      pending: count(sql`case when ${registrations.status} <> 'paid' then 1 end`),
    })
    .from(registrations)
    .where(sql`${registrations.referralCode} is not null`)
    .groupBy(registrations.referralCode);

  const revenue = await db
    .select({
      code: invoices.referralCode,
      currency: invoices.currency,
      net: sum(invoices.taxableValue),
    })
    .from(invoices)
    .where(sql`${invoices.referralCode} is not null`)
    .groupBy(invoices.referralCode, invoices.currency);

  const usageByCode = new Map(usage.map((u) => [u.code ?? "", u]));
  const revenueByCode = new Map<string, { inr: number; usd: number }>();
  for (const r of revenue) {
    const key = r.code ?? "";
    const bucket = revenueByCode.get(key) ?? { inr: 0, usd: 0 };
    // `sum()` comes back as a string from Postgres — a numeric aggregate is
    // arbitrary precision, so the driver will not narrow it for us.
    const net = Number(r.net ?? 0);
    if (r.currency === "INR") bucket.inr += net;
    else if (r.currency === "USD") bucket.usd += net;
    revenueByCode.set(key, bucket);
  }

  return codes.map((c) => {
    const u = usageByCode.get(c.code);
    const money = revenueByCode.get(c.code) ?? { inr: 0, usd: 0 };
    return {
      id: c.id,
      code: c.code,
      discountPercent: c.discountPercent,
      active: c.active,
      label: c.label,
      ownerName: c.ownerName,
      ownerEmail: c.ownerEmail,
      commissionPercent: c.commissionPercent,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
      redeemed: u?.redeemed ?? 0,
      attributed: u?.attributed ?? 0,
      pending: u?.pending ?? 0,
      netRevenueInr: money.inr,
      netRevenueUsd: money.usd,
    };
  });
}

export async function loadReferrals(): Promise<LoadReferralsResult> {
  if (hasLocalDb()) {
    try {
      return { codes: await queryReferrals(), error: null };
    } catch (error) {
      console.error("[admin] failed to query referral codes", error);
      return { codes: [], error: "Could not load referral codes." };
    }
  }

  try {
    const response = await adminGatewayFetch(REFERRALS_DATA_PATH);
    if (!response.ok) {
      return {
        codes: [],
        error: `Could not reach the referrals service (HTTP ${response.status}).`,
      };
    }
    const payload: unknown = await response.json();
    const codes =
      typeof payload === "object" && payload !== null
        ? (payload as { codes?: unknown }).codes
        : undefined;

    if (!Array.isArray(codes) || !codes.every(isReferralRow)) {
      return { codes: [], error: "The referrals service returned unexpected data." };
    }
    return { codes, error: null };
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      return { codes: [], error: "The admin console is not connected to its data service." };
    }
    console.error("[admin] referrals gateway request failed", error);
    return { codes: [], error: "Could not reach the referrals service." };
  }
}

export type ReferralMutationInput = {
  id?: string;
  code?: string;
  discountPercent?: string | number;
  label?: string;
  ownerName?: string;
  ownerEmail?: string;
  commissionPercent?: string | number;
  maxUses?: string | number;
  expiresAt?: string;
  active?: boolean;
};

/**
 * Parse and validate operator input into storable columns.
 *
 * Shared by the direct-database and gateway paths so a rule is enforced once.
 * Returns an error string, or the values to write.
 */
export function parseReferralInput(
  input: ReferralMutationInput
): { error: string } | { values: {
  code: string;
  discountPercent: number;
  label: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  commissionPercent: number | null;
  maxUses: number | null;
  expiresAt: Date | null;
} } {
  const code = normalizeReferralCode(String(input.code ?? ""));
  if (!code) return { error: "A code is required." };
  if (!/^[A-Z0-9._-]+$/.test(code)) {
    return { error: "A code may use only letters, digits, dots, dashes and underscores." };
  }

  const discountPercent = Number(input.discountPercent);
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    return { error: "Discount must be a whole number between 1 and 100." };
  }

  let maxUses: number | null = null;
  if (input.maxUses !== undefined && String(input.maxUses).trim() !== "") {
    const parsed = Number(input.maxUses);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return { error: "Max redemptions must be a whole number of 1 or more, or left blank." };
    }
    maxUses = parsed;
  }

  let commissionPercent: number | null = null;
  if (input.commissionPercent !== undefined && String(input.commissionPercent).trim() !== "") {
    const parsed = Number(input.commissionPercent);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      return { error: "Commission must be a whole number between 0 and 100, or left blank." };
    }
    commissionPercent = parsed;
  }

  let expiresAt: Date | null = null;
  if (input.expiresAt && String(input.expiresAt).trim()) {
    const parsed = new Date(String(input.expiresAt));
    if (Number.isNaN(parsed.getTime())) return { error: "That expiry date is not valid." };
    expiresAt = parsed;
  }

  const trim = (v: unknown): string | null => {
    const s = typeof v === "string" ? v.trim() : "";
    return s ? s.slice(0, 200) : null;
  };

  return {
    values: {
      code,
      discountPercent,
      label: trim(input.label),
      ownerName: trim(input.ownerName),
      ownerEmail: trim(input.ownerEmail),
      commissionPercent,
      maxUses,
      expiresAt,
    },
  };
}

export type ReferralAction = "create" | "update" | "toggle" | "delete";

/** Perform a referral action wherever the data lives. Returns an error or null. */
export async function mutateReferral(
  action: ReferralAction,
  input: ReferralMutationInput
): Promise<string | null> {
  if (hasLocalDb()) {
    const db = getDb();
    if (!db) return "Database is not configured.";
    try {
      if (action === "create" || action === "update") {
        const parsed = parseReferralInput(input);
        if ("error" in parsed) return parsed.error;

        if (action === "create") {
          await db.insert(referralCodes).values(parsed.values);
          return null;
        }
        if (!input.id) return "A code id is required.";
        await db
          .update(referralCodes)
          .set({ ...parsed.values, updatedAt: new Date() })
          .where(eq(referralCodes.id, input.id));
        return null;
      }

      if (!input.id) return "A code id is required.";

      if (action === "toggle") {
        await db
          .update(referralCodes)
          .set({ active: Boolean(input.active), updatedAt: new Date() })
          .where(eq(referralCodes.id, input.id));
        return null;
      }

      // Delete is refused once a code has been redeemed: the registrations and
      // invoices that reference it by string would be left pointing at a code
      // nobody can look up, and a partner's payout history would vanish.
      // Deactivating is the correct way to retire a code that has been used.
      const [used] = await db
        .select({ id: registrations.id })
        .from(registrations)
        .innerJoin(referralCodes, eq(referralCodes.code, registrations.referralCode))
        .where(and(eq(referralCodes.id, input.id), gt(registrations.discountPercent, 0)))
        .limit(1);
      if (used) {
        return "That code has been redeemed, so it cannot be deleted. Switch it off instead.";
      }
      await db.delete(referralCodes).where(eq(referralCodes.id, input.id));
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/duplicate key|unique constraint/i.test(message)) {
        return "That code already exists.";
      }
      console.error("[admin] referral action failed", error);
      return "Could not update referral codes.";
    }
  }

  try {
    const response = await adminGatewayFetch(REFERRALS_DATA_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...input }),
    });
    if (response.ok) return null;
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    return payload.error ?? `Could not update referral codes (HTTP ${response.status}).`;
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      return "The admin console is not connected to its data service.";
    }
    console.error("[admin] referral mutation failed", error);
    return "Could not reach the referrals service.";
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/admin/referrals.test.ts
```

Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/referrals.ts lib/admin/referrals.test.ts
git commit -m "feat(admin): referral code stats, validation and gateway"
```

---

### Task 8: Droplet-side referrals API

**Files:**
- Create: `app/api/admin/data/referrals/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { verifyProxySecret, hasLocalDb } from "@/lib/admin/gateway";
import {
  mutateReferral,
  queryReferrals,
  type ReferralAction,
} from "@/lib/admin/referrals";

export const runtime = "nodejs";
// Live operator data; never statically rendered or cached.
export const dynamic = "force-dynamic";

/**
 * Internal: manage referral codes.
 *
 * Called server-to-server by the console with the shared secret, never by a
 * browser. The operator's login is checked on the console side; the secret is
 * what authenticates the caller here. A wrong or missing secret gets a bare
 * 404, which tells a prober nothing.
 */

export async function GET(request: Request) {
  if (!verifyProxySecret(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!hasLocalDb() || !getDb()) {
    return NextResponse.json(
      { error: "Database is not configured on this host." },
      { status: 503 }
    );
  }

  try {
    return NextResponse.json({ codes: await queryReferrals() });
  } catch (error) {
    console.error("[admin/data/referrals] list failed", error);
    return NextResponse.json({ error: "Could not load referral codes." }, { status: 500 });
  }
}

const ACTIONS: ReadonlySet<string> = new Set(["create", "update", "toggle", "delete"]);

export async function POST(request: Request) {
  if (!verifyProxySecret(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!getDb()) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { action, ...input } = (body ?? {}) as Record<string, unknown> & { action?: string };
  if (!action || !ACTIONS.has(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  // `mutateReferral` runs against the local database on this host, and returns
  // an operator-readable message rather than throwing.
  const error = await mutateReferral(action as ReferralAction, input);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/data/referrals
git commit -m "feat(admin): internal referrals data API"
```

---

### Task 9: The referral panel UI

A client component so filtering and search need no round trip, taking server actions as props for every mutation.

**Files:**
- Create: `components/admin/ReferralPanel.tsx`

- [ ] **Step 1: Create the panel**

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  commissionOwed,
  referralStatus,
  type AdminReferralRow,
  type ReferralStatus,
} from "@/lib/admin/referrals";

/**
 * Referral codes panel.
 *
 * Codes are data, not a deploy: creating a partner code, capping it, expiring it
 * or retiring it happens here. Every row also carries what it has actually done
 * — redemptions against its cap, ex-GST revenue, and the commission that implies
 * — so a payout conversation needs no SQL.
 *
 * Filtering is client-side over the full set. There will never be enough codes
 * for that to be the wrong call, and it keeps the whole panel interactive
 * without a navigation.
 */

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** Minor units to a readable amount. Both currencies are 100-minor-unit based. */
function money(minor: number, currency: "INR" | "USD"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

const STATUS_STYLE: Record<ReferralStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-slate-500/15 text-slate-400",
  expired: "bg-amber-500/15 text-amber-400",
  exhausted: "bg-amber-500/15 text-amber-400",
};

type Filter = "all" | ReferralStatus;

/** `datetime-local` wants 'YYYY-MM-DDTHH:mm' with no zone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const FIELD =
  "mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none";

export function ReferralPanel({
  codes,
  error,
  createAction,
  updateAction,
  toggleAction,
  deleteAction,
}: {
  codes: AdminReferralRow[];
  error: string | null;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  toggleAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // One clock for the whole render, so two rows can never disagree about
  // whether the same expiry has passed.
  const now = useMemo(() => new Date(), [codes]);

  const decorated = useMemo(
    () => codes.map((c) => ({ row: c, status: referralStatus(c, now), owed: commissionOwed(c) })),
    [codes, now]
  );

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      decorated.filter(({ row, status }) => {
        if (filter !== "all" && status !== filter) return false;
        if (!q) return true;
        return (
          row.code.toLowerCase().includes(q) ||
          (row.label?.toLowerCase().includes(q) ?? false) ||
          (row.ownerName?.toLowerCase().includes(q) ?? false) ||
          (row.ownerEmail?.toLowerCase().includes(q) ?? false)
        );
      }),
    [decorated, filter, q]
  );

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: decorated.length,
      active: 0,
      inactive: 0,
      expired: 0,
      exhausted: 0,
    };
    for (const { status } of decorated) base[status] += 1;
    return base;
  }, [decorated]);

  // Totals across what is on screen, so a filtered view reports its own subtotal.
  const totals = useMemo(
    () =>
      visible.reduce(
        (acc, { row, owed }) => ({
          redeemed: acc.redeemed + row.redeemed,
          inr: acc.inr + row.netRevenueInr,
          usd: acc.usd + row.netRevenueUsd,
          owedInr: acc.owedInr + owed.inr,
          owedUsd: acc.owedUsd + owed.usd,
        }),
        { redeemed: 0, inr: 0, usd: 0, owedInr: 0, owedUsd: 0 }
      ),
    [visible]
  );

  const TABS: Filter[] = ["all", "active", "inactive", "expired", "exhausted"];

  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-slate-900/40 p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">Referral codes</h2>
        <p className="text-xs text-slate-400">
          {totals.redeemed} redemption{totals.redeemed === 1 ? "" : "s"} ·{" "}
          {money(totals.inr, "INR")} + {money(totals.usd, "USD")} net
          {totals.owedInr || totals.owedUsd ? (
            <span className="text-amber-400">
              {" "}
              · {money(totals.owedInr, "INR")} + {money(totals.owedUsd, "USD")} commission
            </span>
          ) : null}
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
              filter === tab
                ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code, owner or label"
          className="ml-auto min-w-[200px] flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          {adding ? "Cancel" : "New code"}
        </button>
      </div>

      {adding ? (
        <form
          action={createAction}
          className="mb-4 grid gap-3 rounded-lg border border-emerald-400/20 bg-slate-950 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="text-xs text-slate-400">
            Code
            <input name="code" required placeholder="PAVEL20" className={`${FIELD} font-mono uppercase`} />
          </label>
          <label className="text-xs text-slate-400">
            Discount %
            <input name="discountPercent" type="number" min={1} max={100} required defaultValue={10} className={FIELD} />
          </label>
          <label className="text-xs text-slate-400">
            Max redemptions
            <input name="maxUses" type="number" min={1} placeholder="unlimited" className={FIELD} />
          </label>
          <label className="text-xs text-slate-400">
            Expires
            <input name="expiresAt" type="datetime-local" className={FIELD} />
          </label>
          <label className="text-xs text-slate-400">
            Label
            <input name="label" placeholder="Launch campaign" className={FIELD} />
          </label>
          <label className="text-xs text-slate-400">
            Owner
            <input name="ownerName" placeholder="Steve" className={FIELD} />
          </label>
          <label className="text-xs text-slate-400">
            Owner email
            <input name="ownerEmail" type="email" placeholder="steve@example.com" className={FIELD} />
          </label>
          <label className="text-xs text-slate-400">
            Commission %
            <input name="commissionPercent" type="number" min={0} max={100} placeholder="none" className={FIELD} />
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
            >
              Create code
            </button>
          </div>
        </form>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-white/5 bg-slate-950 px-3 py-6 text-center text-xs text-slate-500">
          {codes.length === 0 ? "No referral codes yet." : "No codes match this view."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map(({ row, status, owed }) => {
            const overCap = row.maxUses !== null && row.redeemed > row.maxUses;
            return (
              <li key={row.id} className="rounded-lg border border-white/5 bg-slate-950 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-white">
                      <span className="font-mono">{row.code}</span>
                      <span className="text-emerald-400">−{row.discountPercent}%</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLE[status]}`}
                      >
                        {status}
                      </span>
                      {overCap ? (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-400">
                          over cap
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500">
                      {row.ownerName ? <span className="text-slate-400">{row.ownerName}</span> : null}
                      {row.ownerName && row.label ? " · " : null}
                      {row.label}
                      {row.expiresAt ? (
                        <span className="ml-2">expires {DATE.format(new Date(row.expiresAt))}</span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(editing === row.id ? null : row.id)}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                    >
                      {editing === row.id ? "Close" : "Edit"}
                    </button>
                    <form action={toggleAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="active" value={row.active ? "false" : "true"} />
                      <button
                        type="submit"
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          row.active
                            ? "border-amber-400/40 text-amber-300 hover:bg-amber-500/10"
                            : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
                        }`}
                      >
                        {row.active ? "Switch off" : "Switch on"}
                      </button>
                    </form>
                    {/* Deleting is offered only while a code has never been
                        redeemed. Anything else must be switched off, or a
                        partner's payout history disappears with the row. */}
                    {row.redeemed === 0 && row.attributed === 0 ? (
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-400 transition hover:border-red-400/40 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                {/* Usage. The numbers an operator actually opens this panel for. */}
                <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/5 pt-2 text-xs">
                  <div>
                    <dt className="inline text-slate-500">Redeemed </dt>
                    <dd className="inline font-medium text-white">
                      {row.redeemed}
                      {row.maxUses !== null ? (
                        <span className="text-slate-500"> / {row.maxUses}</span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Paid seats </dt>
                    <dd className="inline font-medium text-white">{row.attributed}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Pending </dt>
                    <dd className="inline font-medium text-slate-300">{row.pending}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Net revenue </dt>
                    <dd className="inline font-medium text-white">
                      {money(row.netRevenueInr, "INR")}
                      {row.netRevenueUsd ? ` + ${money(row.netRevenueUsd, "USD")}` : ""}
                    </dd>
                  </div>
                  {row.commissionPercent ? (
                    <div>
                      <dt className="inline text-slate-500">
                        Commission ({row.commissionPercent}%){" "}
                      </dt>
                      <dd className="inline font-medium text-amber-300">
                        {money(owed.inr, "INR")}
                        {owed.usd ? ` + ${money(owed.usd, "USD")}` : ""}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {editing === row.id ? (
                  <form
                    action={updateAction}
                    className="mt-2 grid gap-3 border-t border-white/5 pt-3 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <label className="text-xs text-slate-400">
                      Code
                      <input name="code" required defaultValue={row.code} className={`${FIELD} font-mono uppercase`} />
                    </label>
                    <label className="text-xs text-slate-400">
                      Discount %
                      <input name="discountPercent" type="number" min={1} max={100} required defaultValue={row.discountPercent} className={FIELD} />
                    </label>
                    <label className="text-xs text-slate-400">
                      Max redemptions
                      <input name="maxUses" type="number" min={1} placeholder="unlimited" defaultValue={row.maxUses ?? ""} className={FIELD} />
                    </label>
                    <label className="text-xs text-slate-400">
                      Expires
                      <input name="expiresAt" type="datetime-local" defaultValue={toLocalInput(row.expiresAt)} className={FIELD} />
                    </label>
                    <label className="text-xs text-slate-400">
                      Label
                      <input name="label" defaultValue={row.label ?? ""} className={FIELD} />
                    </label>
                    <label className="text-xs text-slate-400">
                      Owner
                      <input name="ownerName" defaultValue={row.ownerName ?? ""} className={FIELD} />
                    </label>
                    <label className="text-xs text-slate-400">
                      Owner email
                      <input name="ownerEmail" type="email" defaultValue={row.ownerEmail ?? ""} className={FIELD} />
                    </label>
                    <label className="text-xs text-slate-400">
                      Commission %
                      <input name="commissionPercent" type="number" min={0} max={100} placeholder="none" defaultValue={row.commissionPercent ?? ""} className={FIELD} />
                    </label>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <button
                        type="submit"
                        className="rounded-lg border border-emerald-400/40 px-4 py-2 text-xs text-emerald-300 transition hover:bg-emerald-500/10"
                      >
                        Save changes
                      </button>
                    </div>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-[11px] text-slate-500">
        A code works only while it is switched on, before its expiry, and under
        its cap. Redemptions count paid seats that received the discount, so an
        abandoned checkout never uses one up. Revenue is net of GST, taken from
        issued invoices, which is also what commission is calculated on.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/ReferralPanel.tsx
git commit -m "feat(admin): referral codes panel with filters and per-code analytics"
```

---

### Task 10: Wire the panel into the dashboard

**Files:**
- Modify: `app/admin/pavel/page.tsx`

- [ ] **Step 1: Add imports**

```ts
import { loadReferrals, mutateReferral } from "@/lib/admin/referrals";
import { ReferralPanel } from "@/components/admin/ReferralPanel";
```

- [ ] **Step 2: Load referrals alongside the rest**

Replace the `Promise.all` block:

```ts
  const [{ rows, error }, sessionsResult, referralsResult] = await Promise.all([
    loadRegistrations(),
    loadSessions(),
    loadReferrals(),
  ]);
```

- [ ] **Step 3: Add the server actions**

Add after `setClosedAction`. Each re-checks the operator's session for the same reason the session actions do: a form action is a POST endpoint in its own right.

```ts
  /**
   * Referral mutations. Authorised individually — the page render's check does
   * not protect an action id.
   *
   * Only `/admin/pavel` is revalidated: a code change alters no cached public
   * page, because the landing page never renders a code and checkout re-reads
   * the rules from the database on every attempt.
   */
  async function createReferralAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateReferral("create", {
      code: String(formData.get("code") ?? ""),
      discountPercent: String(formData.get("discountPercent") ?? ""),
      label: String(formData.get("label") ?? ""),
      ownerName: String(formData.get("ownerName") ?? ""),
      ownerEmail: String(formData.get("ownerEmail") ?? ""),
      commissionPercent: String(formData.get("commissionPercent") ?? ""),
      maxUses: String(formData.get("maxUses") ?? ""),
      expiresAt: String(formData.get("expiresAt") ?? ""),
    });
    revalidatePath("/admin/pavel");
  }

  async function updateReferralAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateReferral("update", {
      id: String(formData.get("id") ?? ""),
      code: String(formData.get("code") ?? ""),
      discountPercent: String(formData.get("discountPercent") ?? ""),
      label: String(formData.get("label") ?? ""),
      ownerName: String(formData.get("ownerName") ?? ""),
      ownerEmail: String(formData.get("ownerEmail") ?? ""),
      commissionPercent: String(formData.get("commissionPercent") ?? ""),
      maxUses: String(formData.get("maxUses") ?? ""),
      expiresAt: String(formData.get("expiresAt") ?? ""),
    });
    revalidatePath("/admin/pavel");
  }

  async function toggleReferralAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateReferral("toggle", {
      id: String(formData.get("id") ?? ""),
      active: formData.get("active") === "true",
    });
    revalidatePath("/admin/pavel");
  }

  async function deleteReferralAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateReferral("delete", { id: String(formData.get("id") ?? "") });
    revalidatePath("/admin/pavel");
  }
```

- [ ] **Step 4: Render the panel**

Replace the returned JSX:

```tsx
  return (
    <PavelDashboard rows={rows}>
      <SessionPanel
        sessions={sessionsResult.sessions}
        error={sessionsResult.error}
        createAction={createSessionAction}
        activateAction={activateSessionAction}
        setClosedAction={setClosedAction}
        updateAction={updateSessionAction}
      />
      <ReferralPanel
        codes={referralsResult.codes}
        error={referralsResult.error}
        createAction={createReferralAction}
        updateAction={updateReferralAction}
        toggleAction={toggleReferralAction}
        deleteAction={deleteReferralAction}
      />
    </PavelDashboard>
  );
```

- [ ] **Step 5: Confirm `PavelDashboard` renders multiple children**

Check that its `children` prop is typed `React.ReactNode` and rendered once. If it is typed as a single element, widen it.

- [ ] **Step 6: Run every check**

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

- [ ] **Step 7: Verify in the browser**

Sign in at `/admin`, open `/admin/pavel`. Create a code with a cap of 1 and an expiry tomorrow; confirm it appears as `active`, filters correctly, edits save, switching off moves it to `inactive`, and a code with usage offers no Delete button.

- [ ] **Step 8: Commit**

```bash
git add app/admin/pavel/page.tsx
git commit -m "feat(admin): wire the referral panel into the Pavel dashboard"
```

---

### Task 11: Keep the seed script honest

**Files:**
- Modify: `scripts/seed-referrals.ts`
- Modify: `drizzle/seed_referral_codes.sql`

- [ ] **Step 1: Note that seeding no longer sets limits**

Add to the doc comment at the top of `scripts/seed-referrals.ts`:

```ts
/**
 * ...
 * Codes are now managed from the console at /admin/pavel — this script exists
 * to bootstrap a fresh database, not as the day-to-day tool. It sets no cap and
 * no expiry, so a seeded code is unlimited until an operator says otherwise.
 */
```

- [ ] **Step 2: Confirm the upsert still compiles against the widened table**

```bash
npx tsc --noEmit
```

The existing `onConflictDoUpdate` sets only `discountPercent`, `active` and `label`, so limits set in the console survive a re-seed. Leave it that way and say so in a comment:

```ts
      .onConflictDoUpdate({
        target: referralCodes.code,
        // Deliberately narrow: a re-seed must not wipe a cap, expiry or owner
        // that an operator set in the console.
        set: {
          discountPercent: entry.discountPercent,
          active: true,
          label: entry.label,
        },
      });
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-referrals.ts drizzle/seed_referral_codes.sql
git commit -m "docs(referrals): note that codes are managed from the console"
```

---

### Task 12: Deploy

- [ ] **Step 1: Apply the migration on the droplet**

```bash
ssh root@168.144.47.32 'cd /srv/fynix && git pull && npm ci && npm run db:migrate && pm2 restart fynix'
```

- [ ] **Step 2: Confirm the columns exist**

```bash
psql "$DATABASE_URL" -c '\d referral_codes'
```

Expected: `max_uses`, `expires_at`, `owner_name`, `owner_email`, `commission_percent`, `updated_at`.

- [ ] **Step 3: Push the site**

Merge to `development`, then confirm `/admin/pavel` on fynix.digital lists codes through the gateway rather than showing "Could not reach the referrals service".

---

## Self-review

**Spec coverage.** Gap 1 (no cap/expiry) → Tasks 1, 2, 5. Gap 2 (no management UI) → Tasks 7-10. Gap 3 (no analytics) → Tasks 7, 9. Gap 4 (typed attribution) → Tasks 4, 6. All four covered.

**Type consistency.** `AdminReferralRow` field names used in `ReferralPanel` (`redeemed`, `attributed`, `pending`, `netRevenueInr`, `netRevenueUsd`, `commissionPercent`, `maxUses`, `expiresAt`) match Task 7's definition. `ReferralEvaluation` is consumed as `result.ok` / `result.reason` / `result.code` / `result.discountPercent` in Tasks 3, 4 and 5, matching Task 2. `mutateReferral` actions (`create`/`update`/`toggle`/`delete`) match `ACTIONS` in Task 8 and the four server actions in Task 10.

**Known trade to preserve.** The cap race in Task 2 is deliberate and documented in the panel's over-cap badge. Do not add a lock across the Razorpay call to "fix" it.
