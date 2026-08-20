/**
 * Exports the Fynix wordmark from `components/Logo.tsx` as a raster image for
 * the email masthead.
 *
 *   npx tsx scripts/generate-email-logo.tsx
 *
 * PNG, not SVG. This script used to write `public/email/logo.svg` and the
 * templates pointed an `<img>` at it, but no mainstream mail client renders an
 * SVG `<img>`: Gmail (web, iOS and Android), Yahoo, AOL and every version of
 * Outlook show a broken-image placeholder. The brand was therefore missing from
 * the top of every email in the majority of inboxes.
 *
 * Exported at 3x and displayed at `DISPLAY_WIDTH`, so it stays sharp on retina
 * and high-DPI Windows without a second asset.
 *
 * Primary navy, the same value the site header uses (`text-primary`), on the
 * email's fixed cream masthead band. One mark on a band that never inverts
 * renders identically in light and dark mode, which avoids the light/dark image
 * swap that Gmail does not support.
 *
 * Re-run this after any change to `components/Logo.tsx`.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import Logo from "../components/Logo";

/**
 * Slot width in the masthead. Must match `LOGO_WIDTH` in design.ts.
 *
 * 140px rather than a more typical 100px because the mark carries a small
 * "Digital" caption under the wordmark. Below about 130px that caption falls
 * under 7px tall and stops being readable, which turns the lockup into visual
 * noise rather than a signature.
 */
const DISPLAY_WIDTH = 140;
/** Source viewBox is 89x37. */
const ASPECT = 37 / 89;
const DISPLAY_HEIGHT = Math.round(DISPLAY_WIDTH * ASPECT);
const SCALE = 3;

const publicDir = join(__dirname, "..", "public", "email");

/**
 * `currentColor` is what the component uses, and librsvg resolves it against a
 * `color` property it does not inherit from an inline style the way a browser
 * does. Substituting an explicit hex before rasterising is the difference
 * between a white wordmark and a black rectangle.
 */
function markupWithFill(hex: string): string {
  const svg = renderToStaticMarkup(Logo({ width: 89, height: 37 }));
  return `<?xml version="1.0" encoding="UTF-8"?>\n${svg.replaceAll(
    'fill="currentColor"',
    `fill="${hex}"`
  )}\n`;
}

/** Primary navy, matching `--primary` in globals.css and the site header. */
const BRAND_NAVY = "#0C1E2E";

async function main(): Promise<void> {
  const markup = markupWithFill(BRAND_NAVY);

  // Kept for any surface that can render vectors. Email cannot: see above.
  writeFileSync(join(publicDir, "logo.svg"), markup, "utf-8");

  await sharp(Buffer.from(markup), { density: 72 * SCALE })
    .resize(DISPLAY_WIDTH * SCALE, DISPLAY_HEIGHT * SCALE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, "logo.png"));

  console.log(
    `Wrote public/email/logo.png at ${DISPLAY_WIDTH * SCALE}x${
      DISPLAY_HEIGHT * SCALE
    } for a ${DISPLAY_WIDTH}x${DISPLAY_HEIGHT} slot.`
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
