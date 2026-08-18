import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * Drizzle schema for the Pavel workshop pipeline (Neon Postgres).
 *
 * Written to ONLY from server-side API routes (register, checkout, webhook,
 * cron). There is no browser-side access and no anon key, so no row-level
 * security is needed — the connection string is simply never exposed.
 */

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ref: text("ref").notNull().unique(), // public reference id, e.g. PVL-8F3K2A
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"), // '+91 98765 43210' — dial code + number from checkout
    companyName: text("company_name"), // GST invoice: registered business name (India only, optional)
    gstin: text("gstin"), // 15-char GSTIN for the tax invoice (India only, optional)
    companyAddress: text("company_address"), // GST invoice billing address (India only, optional)
    state: text("state"), // Indian state / UT (place of supply), captured for India only
    referralCode: text("referral_code"), // optional attribution code entered at checkout
    discountPercent: integer("discount_percent"), // referral discount applied at checkout (null = none)
    country: text("country").notNull().default("REST"), // pricing region: 'IN' | 'REST'
    // The buyer's ACTUAL country, kept alongside the pricing region. An export
    // invoice must name the country of destination, which 'REST' cannot express.
    countryName: text("country_name"), // e.g. 'United States'
    countryCode: text("country_code"), // ISO 3166-1 alpha-2, e.g. 'US'
    amountDisplay: text("amount_display"), // '₹7,499' / '$99'
    // Amount actually charged, in the currency's minor unit (paise / cents), and
    // its currency. Stored numerically so invoicing and reconciliation never
    // have to parse the formatted `amountDisplay` string.
    amountCharged: integer("amount_charged"),
    currency: text("currency"), // 'INR' | 'USD'
    razorpayOrderId: text("razorpay_order_id").unique(), // 'order_...' created at checkout
    razorpayPaymentId: text("razorpay_payment_id"), // 'pay_...' captured on success
    status: text("status").notNull().default("pending"), // 'pending' | 'paid'
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    index("registrations_status_idx").on(table.status),
    index("registrations_email_idx").on(table.email),
  ]
);

/**
 * Email idempotency log. The unique (registration_id, type) constraint makes a
 * double-send physically impossible: a retried webhook or an overlapping cron
 * run hits the constraint and no-ops.
 */
export const emailLog = pgTable(
  "email_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // confirmation|admin|reminder_7d|reminder_3d|reminder_1d|reminder_1h|post_event
    sentAt: timestamp("sent_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("email_log_registration_type_unique").on(table.registrationId, table.type)]
);

/**
 * Referral / promo codes. A code entered at checkout applies a percentage
 * discount to the order amount. Looked up server-side only (checkout + the
 * /api/pavel/referral validation route) so the discount can never be forged by
 * the client. `code` is stored normalised (uppercase, no spaces).
 */
export const referralCodes = pgTable("referral_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // normalised, e.g. 'STEVE10'
  discountPercent: integer("discount_percent").notNull(), // 1–100
  active: boolean("active").notNull().default(true),
  label: text("label"), // human note, e.g. 'Steve — partner code'
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Issued tax invoices. One row per paid registration (enforced by the unique FK),
 * which also makes issuance idempotent: a retried webhook hits the constraint
 * and no-ops rather than burning a second invoice number.
 *
 * Buyer and seller details are SNAPSHOT here rather than joined at render time.
 * An invoice is a legal record of a moment: if the registered address, the trade
 * name or the tax rate changes later, an already-issued invoice must still
 * reproduce exactly as issued. All money columns are integers in the currency's
 * minor unit (paise / cents).
 */
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    registrationId: uuid("registration_id")
      .notNull()
      .unique()
      .references(() => registrations.id, { onDelete: "restrict" }),
    invoiceNo: text("invoice_no").notNull().unique(), // 'FYX/26-27/0001'
    fy: text("fy").notNull(), // '2026-27'
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    supplyType: text("supply_type").notNull(), // 'intra' | 'inter' | 'export'
    placeOfSupply: text("place_of_supply").notNull(), // 'Karnataka' | 'Outside India'
    placeOfSupplyCode: text("place_of_supply_code").notNull(), // GST state code, '96' for exports
    currency: text("currency").notNull(), // 'INR' | 'USD'

    // List price before any referral discount, the discount taken off it, and
    // the code used. Snapshotted so the invoice can show how the taxable value
    // was arrived at, and so referral payouts reconcile against issued invoices.
    listValue: integer("list_value").notNull(),
    discountPercent: integer("discount_percent").notNull().default(0),
    discountAmount: integer("discount_amount").notNull().default(0),
    referralCode: text("referral_code"),

    taxableValue: integer("taxable_value").notNull(),
    cgst: integer("cgst").notNull().default(0),
    sgst: integer("sgst").notNull().default(0),
    igst: integer("igst").notNull().default(0),
    totalTax: integer("total_tax").notNull().default(0),
    total: integer("total").notNull(),
    ratePercent: integer("rate_percent").notNull(), // 18, or 0 for zero-rated exports
    zeroRatedUnderLut: boolean("zero_rated_under_lut").notNull().default(false),

    // Buyer snapshot.
    buyerName: text("buyer_name").notNull(),
    buyerEmail: text("buyer_email").notNull(),
    buyerGstin: text("buyer_gstin"),
    buyerCompany: text("buyer_company"),
    buyerAddress: text("buyer_address"),
    /** Buyer's country. On an export invoice this is the country of destination. */
    buyerCountry: text("buyer_country"),

    // Seller snapshot.
    sellerLegalName: text("seller_legal_name").notNull(),
    sellerTradeName: text("seller_trade_name"),
    sellerGstin: text("seller_gstin").notNull(),
    sellerAddress: text("seller_address").notNull(),
    sellerCin: text("seller_cin"),
    sellerPan: text("seller_pan"),
    sacCode: text("sac_code").notNull(),

    // Payment evidence printed on the invoice, so the document doubles as a
    // receipt. Snapshotted like everything else rather than joined at render.
    paymentReference: text("payment_reference"), // Razorpay 'pay_...' id
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [index("invoices_issued_at_idx").on(table.issuedAt)]
);

/**
 * Per-financial-year counter backing the gapless invoice series.
 *
 * GST requires a consecutive serial unique within a financial year, so the next
 * number is allocated by locking this row FOR UPDATE inside the same transaction
 * that issues the invoice. Deriving it from count(*) would race under concurrent
 * payments and produce duplicate numbers.
 */
export const invoiceCounters = pgTable(
  "invoice_counters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    prefix: text("prefix").notNull(), // 'FYX'
    fy: text("fy").notNull(), // '2026-27'
    lastSeq: integer("last_seq").notNull().default(0),
  },
  (table) => [unique("invoice_counters_prefix_fy_unique").on(table.prefix, table.fy)]
);

export type Registration = typeof registrations.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type NewRegistration = typeof registrations.$inferInsert;
export type ReferralCode = typeof referralCodes.$inferSelect;
