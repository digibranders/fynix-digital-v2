import { notFound } from "next/navigation";

/**
 * Single-console rule.
 *
 * The same app is deployed twice: the marketing site on Vercel and the API on
 * the DigitalOcean droplet. Both would otherwise serve `/admin`, giving
 * operators two login screens for one system. Setting `ADMIN_UI_DISABLED=true`
 * on the droplet makes it 404 the console and its session routes, leaving
 * fynix.digital/admin as the only way in. The droplet keeps serving
 * `/api/admin/data/*`, which is how the console reads the database.
 *
 * Checked in the Node runtime rather than in middleware, so the value is read
 * from the live environment on every request instead of being frozen into the
 * edge bundle at build time.
 */
export function isAdminUiDisabled(): boolean {
  return process.env.ADMIN_UI_DISABLED === "true";
}

/** Render a 404 for console pages on a host that only backs the console. */
export function assertAdminUiEnabled(): void {
  if (isAdminUiDisabled()) notFound();
}
