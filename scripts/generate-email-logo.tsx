import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import Logo from "../components/Logo";

const svgMarkup = renderToStaticMarkup(
  <Logo width={178} height={74} style={{ color: "#FFFFFF" }} />
);

const outPath = join(__dirname, "..", "public", "email", "logo.svg");
writeFileSync(outPath, `<?xml version="1.0" encoding="UTF-8"?>\n${svgMarkup}\n`, "utf-8");

console.log(`Logo written to ${outPath}`);
