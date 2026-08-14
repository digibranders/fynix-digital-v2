#!/usr/bin/env node
/**
 * Website evaluation script — runs Lighthouse across every key page and prints
 * a scorecard (Performance / Accessibility / Best Practices / SEO) plus the
 * Core Web Vitals (LCP / CLS / TBT) for each.
 *
 * This is lab data (a synthetic run on an emulated mobile device), which is how
 * you check "could this page be fast?" before/after changes. No API key needed.
 *
 * REQUIREMENTS: Google Chrome installed. Lighthouse is fetched on demand via npx.
 *
 * USAGE
 *   node scripts/audit.mjs                      # live site, mobile
 *   node scripts/audit.mjs --desktop            # live site, desktop
 *   node scripts/audit.mjs --base http://localhost:3000   # audit a local build
 *   node scripts/audit.mjs --only /pavel        # just one route
 *
 * TIP: to evaluate a production build locally first:
 *   npm run build && npm run start        (in one terminal)
 *   node scripts/audit.mjs --base http://localhost:3000
 */

import { execFile } from "node:child_process";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const argVal = (f) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};
const has = (f) => args.includes(f);

const BASE = (argVal("--base") || "https://fynix.digital").replace(/\/$/, "");
const DESKTOP = has("--desktop");
const ONLY = argVal("--only");

// The pages worth evaluating (one representative slug for each dynamic route).
const ROUTES = ONLY
  ? [ONLY]
  : [
      "/",
      "/services",
      "/services/seo",
      "/case-studies",
      "/case-studies/eventus",
      "/about",
      "/contact",
      "/faqs",
      "/pavel",
    ];

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

function runLighthouse(url, outPath) {
  const lhArgs = [
    "--yes",
    "lighthouse",
    url,
    `--only-categories=${CATEGORIES.join(",")}`,
    DESKTOP ? "--preset=desktop" : "--form-factor=mobile",
    "--output=json",
    `--output-path=${outPath}`,
    '--chrome-flags=--headless=new --no-sandbox',
    "--quiet",
  ];
  if (!DESKTOP) lhArgs.splice(4, 0, "--screenEmulation.mobile");
  return new Promise((resolve, reject) => {
    execFile("npx", lhArgs, { maxBuffer: 1024 * 1024 * 64 }, (err) =>
      err ? reject(err) : resolve(),
    );
  });
}

const pct = (c) => (c == null ? "  -" : String(Math.round(c * 100)).padStart(3));
const dot = (c) => (c == null ? "?" : c >= 0.9 ? "🟢" : c >= 0.5 ? "🟠" : "🔴");

const rows = [];

console.log(
  `\nEvaluating ${BASE}  —  ${DESKTOP ? "DESKTOP" : "MOBILE"}  —  ${ROUTES.length} page(s)\n` +
    "This runs a full Lighthouse audit per page; expect ~30–60s each.\n" +
    "=".repeat(78),
);

const dir = await mkdtemp(join(tmpdir(), "fynix-audit-"));
try {
  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    process.stdout.write(`\n▸ ${route.padEnd(26)} auditing…`);
    const out = join(dir, `${route.replace(/[^a-z0-9]/gi, "_") || "root"}.json`);
    try {
      await runLighthouse(url, out);
      const r = JSON.parse(await readFile(out, "utf8"));
      const c = r.categories;
      const a = r.audits;
      const row = {
        route,
        perf: c.performance?.score,
        a11y: c.accessibility?.score,
        bp: c["best-practices"]?.score,
        seo: c.seo?.score,
        lcp: a["largest-contentful-paint"]?.displayValue || "-",
        cls: a["cumulative-layout-shift"]?.displayValue || "-",
        tbt: a["total-blocking-time"]?.displayValue || "-",
      };
      rows.push(row);
      process.stdout.write(
        `\r▸ ${route.padEnd(26)} ${dot(row.perf)} P ${pct(row.perf)}  ${dot(row.a11y)} A ${pct(row.a11y)}  ${dot(row.bp)} BP ${pct(row.bp)}  ${dot(row.seo)} SEO ${pct(row.seo)}   LCP ${row.lcp}  CLS ${row.cls}  TBT ${row.tbt}\n`,
      );
    } catch (err) {
      process.stdout.write(`\r▸ ${route.padEnd(26)} ⚠ failed: ${String(err.message).slice(0, 80)}\n`);
    }
  }
} finally {
  await rm(dir, { recursive: true, force: true });
}

// ---- summary --------------------------------------------------------------
if (rows.length) {
  const avg = (k) => {
    const vals = rows.map((r) => r[k]).filter((v) => v != null);
    return vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) : "-";
  };
  console.log("\n" + "=".repeat(78));
  console.log(
    `AVERAGES across ${rows.length} pages —  Perf ${avg("perf")}   A11y ${avg("a11y")}   Best-Practices ${avg("bp")}   SEO ${avg("seo")}`,
  );
  const worstPerf = [...rows].sort((a, b) => (a.perf ?? 1) - (b.perf ?? 1))[0];
  console.log(`Lowest performer: ${worstPerf.route} (Perf ${pct(worstPerf.perf).trim()})`);
  console.log("");
}
