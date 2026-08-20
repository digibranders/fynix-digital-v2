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
    /**
     * The buyer's OWN IANA timezone, read from their browser at checkout,
     * e.g. 'America/Los_Angeles'.
     *
     * Stored rather than derived from `countryCode`, because the country-to-zone
     * table holds one representative zone per country: US maps to
     * America/New_York, so a buyer in California would be told a 3-hour-wrong
     * local time and would join a 3-hour workshop after it had finished. A
     * confidently wrong time is worse than the IST-and-UTC line it replaces,
     * because nothing prompts the reader to check it.
     *
     * Null for every registration taken before this column existed, and for
     * anyone whose browser reported a zone Intl does not recognise. Callers
     * fall back to the IST + UTC line, which is correct for everyone.
     */
    timeZone: text("time_zone"),
    amountDisplay: text("amount_display"), // '₹7,499' / '$99'
    // Amount actually charged, in the currency's minor unit (paise / cents), and
    // its currency. Stored numerically so invoicing and reconciliation never
    // have to parse the formatted `amountDisplay` string.
    amountCharged: integer("amount_charged"),
    currency: text("currency"), // 'INR' | 'USD'
    razorpayOrderId: text("razorpay_order_id").unique(), // 'order_...' created at checkout
    razorpayPaymentId: text("razorpay_payment_id"), // 'pay_...' captured on success
    // When the latest checkout attempt reserved this seat, stamped just before
    // the Razorpay order is created. A recent value marks an ACTIVE checkout:
    // referral caps count it as a reservation so a capped code cannot be
    // oversold by checkouts that are open but not yet paid (see
    // lib/pavel/referral.ts). Stale values simply age out of the window.
    checkoutStartedAt: timestamp("checkout_started_at", { withTimezone: true }),
    status: text("status").notNull().default("pending"), // 'pending' | 'paid'

    // Zoom webinar this seat was sold into, and the buyer's place in it. The
    // join URL is unique per registrant and is the only link they should ever
    // receive; sharing the generic webinar link would break attendance
    // correlation, which is keyed on the registrant id.
    sessionId: uuid("session_id").references(() => webinarSessions.id, {
      onDelete: "set null",
    }),
    zoomRegistrantId: text("zoom_registrant_id"),
    zoomJoinUrl: text("zoom_join_url"),
    zoomRegisteredAt: timestamp("zoom_registered_at", { withTimezone: true }),
    /**
     * How many times we have asked Zoom to register this seat, and when we last
     * tried.
     *
     * Zoom allows only THREE registration attempts per person per webinar per
     * day. The backfill retries every linkless paid seat on every cron run, so
     * without a record of what has already been spent it burns that budget in
     * minutes and locks the buyer out until 00:00 GMT — turning a transient
     * failure into a whole day without a join link.
     */
    zoomAccessAttempts: integer("zoom_access_attempts").notNull().default(0),
    zoomAccessLastAttemptAt: timestamp("zoom_access_last_attempt_at", {
      withTimezone: true,
    }),

    // Live attendance, filled from Zoom after the session. `attendedMinutes`
    // stays null until attendance has been synced, which is deliberately
    // distinct from a synced value of 0 (registered, never joined).
    attendedMinutes: integer("attended_minutes"),
    firstJoinedAt: timestamp("first_joined_at", { withTimezone: true }),
    attendanceSyncedAt: timestamp("attendance_synced_at", { withTimezone: true }),
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
 *
 * A code is redeemable only while `active`, before `expiresAt`, and while
 * redemptions remain under `maxUses`. Both limits are nullable, and null means
 * "no limit" — which is what every code that predates them keeps.
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

  // Partner attribution. Kept on the code rather than in a table of its own: a
  // code has exactly one owner, and a join would buy nothing.
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
    /**
     * The session date printed on the line item, snapshotted like everything
     * else here. Deriving it live would make a past invoice show a LATER
     * cohort's date, which is exactly what snapshotting exists to prevent.
     */
    serviceDateLabel: text("service_date_label"),

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

/**
 * Zoom webinar sessions.
 *
 * The webinar a buyer is registered into is data, not a constant: running a test
 * session or a second cohort must never require a code change or a deploy. An
 * operator adds a row from the admin console and marks it active, and new paid
 * registrations join that one.
 *
 * Registrations keep the session they were sold into, because attendance is
 * fetched per webinar. Without that link a later cohort's attendance would be
 * mixed with this one's.
 */
export const webinarSessions = pgTable("webinar_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Zoom's numeric webinar id, stored as text so leading zeros survive. */
  zoomWebinarId: text("zoom_webinar_id").notNull().unique(),
  /** Operator-facing name, e.g. "Test session" or "Cohort 1". */
  label: text("label").notNull(),
  /**
   * When this session runs. Everything the buyer sees (page copy, emails, the
   * calendar entry) and the reminder schedule derive from these, so a new cohort
   * is a data change rather than a code change. Null falls back to the constant
   * in workshopDetails.
   */
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  /**
   * Exactly one session should be active at a time; the app takes the most
   * recently activated one, so flipping a new session on supersedes the old.
   */
  active: boolean("active").notNull().default(false),
  /**
   * Stops this session taking new registrations while leaving it active.
   *
   * Separate from `active` because they answer different questions: `active`
   * decides which webinar a buyer is registered into, this decides whether
   * anyone may buy at all. Deactivating instead would leave buyers able to pay
   * with nowhere to be sent, which is the failure this exists to prevent.
   */
  registrationsClosed: boolean("registrations_closed").notNull().default(false),
  /**
   * When this session stops taking registrations on its own, if a cutoff was
   * set. Null means it only ever closes when an operator says so.
   *
   * Held as an instant and compared at read time rather than flipped by a job:
   * the deadline is then enforced by whoever asks, so a cron that did not run,
   * a droplet that was restarting or a page cached a moment before the cutoff
   * cannot leave a closed workshop selling seats. `deriveRegistrationWindow` is
   * the single place that comparison is made.
   */
  registrationsCloseAt: timestamp("registrations_close_at", {
    withTimezone: true,
  }),
  /**
   * Invite link for this cohort's private WhatsApp community.
   *
   * Per session because each cohort gets its own group: one shared link would
   * put a finished cohort's members in the next one's group, and the
   * confirmation email describes it as "for this cohort".
   *
   * Null falls back to the constant in workshopDetails, which is where this
   * lived before it was data. Handing out a stale invite is better than handing
   * out none, and the fallback is what keeps a session created before this
   * field existed from mailing buyers a community they cannot join.
   */
  whatsappGroupUrl: text("whatsapp_group_url"),
  /**
   * Zoom's share link for this session's cloud recording, pasted in after the
   * event.
   *
   * Held per session because each cohort has its own recording, and because the
   * post-event emails promise one: the "we missed you" mail is subject-lined
   * "here is the workshop recording" and used to contain no recording at all.
   * Null until published, and the emails omit the section entirely rather than
   * linking to nothing.
   *
   * The 7-day window is a setting on Zoom's own share link, not something this
   * enforces — see workshopDetails.recordingWindowDays for what buyers are told.
   */
  recordingUrl: text("recording_url"),
  /**
   * Passcode for the recording link, when Zoom's share settings require one.
   *
   * Zoom's "allow invitees to access without the passcode" exempts people
   * invited through Zoom itself, NOT people arriving on the shared link — which
   * is everyone we email. Verified in a private window: the link asks for the
   * passcode. Sending the link without it would put every buyer in front of a
   * prompt they cannot answer.
   *
   * Optional: the passcode can be switched off in Zoom, and then the emails say
   * nothing about one.
   */
  recordingPasscode: text("recording_passcode"),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Issued certificates.
 *
 * A certificate is a credential, so it must be impossible to mint one by typing
 * a name into a URL. Every certificate is a row here, addressed by an
 * unguessable `credential_id`, and the page renders only what this row says.
 *
 * The recipient's name and the completion date are SNAPSHOT, so a certificate
 * someone shared in 2026 keeps rendering identically even if the registration
 * or the workshop details change later.
 *
 * One row per registration (unique FK), which makes issuance idempotent in the
 * same way invoices are.
 */
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id")
    .notNull()
    .unique()
    .references(() => registrations.id, { onDelete: "restrict" }),
  /** Public, shareable, unguessable, e.g. 'FYX-SS26-7A3F9C21'. */
  credentialId: text("credential_id").notNull().unique(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),

  recipientName: text("recipient_name").notNull(),
  /** Human-readable completion date printed on the certificate. */
  issueDateLabel: text("issue_date_label").notNull(),
  /** Minutes attended at the time of issue, kept as the evidence for issuing. */
  attendedMinutes: integer("attended_minutes"),
});

export type Registration = typeof registrations.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type WebinarSession = typeof webinarSessions.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type NewRegistration = typeof registrations.$inferInsert;
export type ReferralCode = typeof referralCodes.$inferSelect;
