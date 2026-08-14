#!/usr/bin/env node
/**
 * CrUX monitoring script — real-user Core Web Vitals for fynix.digital.
 *
 * Queries the Chrome UX Report (CrUX) API and prints p75 field metrics
 * (LCP, INP, CLS, FCP, TTFB) with GOOD / NEEDS-IMPROVEMENT / POOR ratings
 * and the good/needs-improvement/poor distribution for each metric.
 *
 * Field data reflects real Chrome users over a rolling 28-day window — this is
 * the "ground truth" version of the Lighthouse lab metrics, and the data Google
 * uses for the Core Web Vitals ranking signal.
 *
 * SETUP
 *   1. Get a key: https://developer.chrome.com/docs/crux/api#requesting-an-api-key
 *   2. Add it to .env (git-ignored):   CRUX_API_KEY=your_key_here
 *
 * USAGE
 *   node --env-file=.env scripts/crux.mjs                 # origin + key pages, PHONE
 *   CRUX_API_KEY=xxx node scripts/crux.mjs                # key inline (no .env)
 *   node --env-file=.env scripts/crux.mjs --form-factor DESKTOP
 *   node --env-file=.env scripts/crux.mjs --form-factor ALL
 *   node --env-file=.env scripts/crux.mjs --url https://fynix.digital/services
 *
 * NOTE: CrUX only has data for origins/URLs with enough real-user traffic.
 * Low-traffic pages (or a whole low-traffic origin) return "no data" (404) —
 * that is expected, not an error, until traffic builds up.
 */

const ENDPOINT = "https://chromeuxreport.googleapis.com/v1/records:queryRecord";
const ORIGIN = "https://fynix.digital";

const KEY = process.env.CRUX_API_KEY;
if (!KEY) {
  console.error(
    "\n✗ Missing CRUX_API_KEY.\n" +
      "  Add it to .env:            CRUX_API_KEY=your_key_here   (then run with --env-file=.env)\n" +
      "  or pass it inline:         CRUX_API_KEY=xxx node scripts/crux.mjs\n" +
      "  Get a key:                 https://developer.chrome.com/docs/crux/api#requesting-an-api-key\n",
  );
  process.exit(1);
}

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const argVal = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const customUrl = argVal("--url");
const formFactor = (argVal("--form-factor") || "PHONE").toUpperCase(); // PHONE | DESKTOP | TABLET | ALL

// ---- CWV thresholds (p75) -------------------------------------------------
const THRESHOLDS = {
  largest_contentful_paint: { good: 2500, poor: 4000, unit: "ms", label: "LCP" },
  interaction_to_next_paint: { good: 200, poor: 500, unit: "ms", label: "INP" },
  cumulative_layout_shift: { good: 0.1, poor: 0.25, unit: "", label: "CLS" },
  first_contentful_paint: { good: 1800, poor: 3000, unit: "ms", label: "FCP" },
  experimental_time_to_first_byte: { good: 800, poor: 1800, unit: "ms", label: "TTFB" },
};
const ORDER = Object.keys(THRESHOLDS);

const rate = (key, p75) => {
  const t = THRESHOLDS[key];
  const v = Number(p75);
  if (v <= t.good) return "GOOD";
  if (v <= t.poor) return "NEEDS-IMPROVEMENT";
  return "POOR";
};

// ---- API ------------------------------------------------------------------
async function query(body) {
  const payload = { ...body };
  if (formFactor !== "ALL") payload.formFactor = formFactor; // omit => all form factors combined

  let res;
  try {
    res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return { error: `network error: ${err.message}` };
  }
  if (res.status === 404) return { noData: true };
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { error: `HTTP ${res.status} — ${txt.slice(0, 200)}` };
  }
  return res.json();
}

// ---- formatting -----------------------------------------------------------
function line(key, metric) {
  const t = THRESHOLDS[key];
  const p75 = metric?.percentiles?.p75;
  if (p75 == null) return `    ${t.label.padEnd(5)} —`;
  const val = t.unit === "ms" ? `${p75} ms` : `${p75}`;
  const dist = (metric.histogram || [])
    .map((b) => `${Math.round((b.density || 0) * 100)}%`)
    .join(" / ");
  return `    ${t.label.padEnd(5)} p75 ${String(val).padEnd(9)} ${rate(key, p75).padEnd(18)} good/ni/poor: ${dist}`;
}

function period(record) {
  const p = record?.collectionPeriod;
  if (!p) return "";
  const d = (x) => `${x.year}-${String(x.month).padStart(2, "0")}-${String(x.day).padStart(2, "0")}`;
  return `    window: ${d(p.firstDate)} → ${d(p.lastDate)}`;
}

// ---- run ------------------------------------------------------------------
const targets = customUrl
  ? [{ label: customUrl, body: { url: customUrl } }]
  : [
      { label: `${ORIGIN}  (whole origin)`, body: { origin: ORIGIN } },
      { label: `${ORIGIN}/`, body: { url: `${ORIGIN}/` } },
      { label: `${ORIGIN}/services`, body: { url: `${ORIGIN}/services` } },
      { label: `${ORIGIN}/pavel`, body: { url: `${ORIGIN}/pavel` } },
    ];

console.log(
  `\nCrUX field data — form factor: ${formFactor} — real users, rolling 28-day window\n` +
    "=".repeat(72),
);

let anyData = false;
for (const target of targets) {
  const data = await query(target.body);
  console.log(`\n▸ ${target.label}`);
  if (data.noData) {
    console.log(`    (no CrUX data — not enough real-user traffic for this ${target.body.origin ? "origin" : "URL"} yet)`);
    continue;
  }
  if (data.error) {
    console.log(`    ⚠ ${data.error}`);
    continue;
  }
  anyData = true;
  const metrics = data.record?.metrics || {};
  for (const key of ORDER) if (metrics[key]) console.log(line(key, metrics[key]));
  const win = period(data.record);
  if (win) console.log(win);
}

if (!anyData) {
  console.log(
    "\nNo field data returned for any target. For a lower-traffic site this is normal —\n" +
      "the origin needs sustained real-user Chrome traffic before it enters the dataset.",
  );
}
console.log("");
