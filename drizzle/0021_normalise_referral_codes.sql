-- Normalise referral codes recorded on registrations.
--
-- `registrations.referral_code` used to store whatever the buyer typed. A seat
-- bought with 'steve10' therefore never matched the code stored as 'STEVE10',
-- and every read is an exact match: the redemption went uncounted, so the
-- console reported no revenue for a real sale, the owner join missed so no
-- commission was calculated, and the cap read the code as untouched and would
-- have kept selling past its limit.
--
-- Registration now validates the code and stores the normalised form, so this
-- is a one-off correction of the rows written before that. The reading side
-- also canonicalises, so a stray value can never cause this again.
--
-- Only whitespace and case change. No code is invented and no row without a
-- code is touched, so this cannot attribute a seat to a code it never carried.
UPDATE "registrations"
SET "referral_code" = upper(btrim("referral_code"))
WHERE "referral_code" IS NOT NULL
  AND "referral_code" <> upper(btrim("referral_code"));

-- `invoices.referral_code` is deliberately NOT rewritten. An invoice is a legal
-- record of what was issued and has to reproduce exactly as issued, so the
-- reading side canonicalises instead.
