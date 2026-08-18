import type { Metadata } from "next";
import { assertAdminUiEnabled } from "@/lib/admin/host";

/**
 * Shell for every admin route.
 *
 * Two jobs: keep the console out of search indexes, and enforce the
 * single-console rule — on a host that only backs the console (the droplet)
 * every page under `/admin` 404s. The pages render full-screen layouts, so
 * nothing is wrapped around them.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  assertAdminUiEnabled();
  return children;
}
