/**
 * Render a money amount in words for a tax invoice.
 *
 * Indian invoices state the total in words, and INR uses the Indian numbering
 * system (thousand, lakh, crore) rather than the short scale. USD invoices use
 * the short scale (thousand, million, billion).
 *
 * Input is always an integer in the currency's minor unit (paise / cents), which
 * is how every amount is stored, so this never has to deal with float drift.
 */

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty",
  "Ninety",
];

type SupportedCurrency = "INR" | "USD";

const CURRENCY_WORDS: Record<
  SupportedCurrency,
  { major: string; minor: string }
> = {
  INR: { major: "Rupees", minor: "Paise" },
  USD: { major: "US Dollars", minor: "Cents" },
};

/** Words for 0..999. */
function underThousand(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) {
    const tens = TENS[Math.floor(n / 10)];
    const rest = n % 10;
    return rest ? `${tens} ${ONES[rest]}` : tens;
  }
  const hundreds = `${ONES[Math.floor(n / 100)]} Hundred`;
  const rest = n % 100;
  return rest ? `${hundreds} ${underThousand(rest)}` : hundreds;
}

/** Indian system: last three digits, then groups of two (thousand, lakh, crore). */
function indianWords(n: number): string {
  if (n === 0) return ONES[0];

  const parts: string[] = [];
  const scales = [
    { value: 10_000_000, name: "Crore" },
    { value: 100_000, name: "Lakh" },
    { value: 1_000, name: "Thousand" },
  ];

  let remaining = n;
  for (const { value, name } of scales) {
    const count = Math.floor(remaining / value);
    if (count > 0) {
      // Crore can exceed 999 for very large amounts, so recurse for that group.
      const countWords = count > 999 ? indianWords(count) : underThousand(count);
      parts.push(`${countWords} ${name}`);
      remaining %= value;
    }
  }
  if (remaining > 0) parts.push(underThousand(remaining));

  return parts.join(" ");
}

/** Short scale: groups of three (thousand, million, billion). */
function shortScaleWords(n: number): string {
  if (n === 0) return ONES[0];

  const parts: string[] = [];
  const scales = [
    { value: 1_000_000_000, name: "Billion" },
    { value: 1_000_000, name: "Million" },
    { value: 1_000, name: "Thousand" },
  ];

  let remaining = n;
  for (const { value, name } of scales) {
    const count = Math.floor(remaining / value);
    if (count > 0) {
      parts.push(`${underThousand(count)} ${name}`);
      remaining %= value;
    }
  }
  if (remaining > 0) parts.push(underThousand(remaining));

  return parts.join(" ");
}

/**
 * Convert a minor-unit amount to invoice wording,
 * e.g. `amountInWords(884882, "INR")` gives
 * "Rupees Eight Thousand Eight Hundred Forty Eight and Eighty Two Paise Only".
 */
export function amountInWords(
  minorAmount: number,
  currency: SupportedCurrency
): string {
  if (!Number.isInteger(minorAmount)) {
    throw new Error(
      `Amount must be an integer in minor units, received ${minorAmount}.`
    );
  }
  if (minorAmount < 0) {
    throw new Error(`Amount must not be negative, received ${minorAmount}.`);
  }

  const words = CURRENCY_WORDS[currency];
  const major = Math.floor(minorAmount / 100);
  const minor = minorAmount % 100;

  const toWords = currency === "INR" ? indianWords : shortScaleWords;
  const majorWords = toWords(major);

  if (minor === 0) {
    return `${words.major} ${majorWords} Only`;
  }
  return `${words.major} ${majorWords} and ${underThousand(minor)} ${words.minor} Only`;
}
