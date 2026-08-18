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
    country: text("country").notNull().default("REST"), // 'IN' | 'REST'
    amountDisplay: text("amount_display"), // '₹7,499' / '$99'
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

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
export type ReferralCode = typeof referralCodes.$inferSelect;
