import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { loadRegistrations } from "@/lib/admin/registrations";
import PavelDashboard from "@/components/admin/PavelDashboard";

export const runtime = "nodejs";
// Reads cookies + live data on every request; never statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Semantic SEO Workshop · Fynix Admin",
};

/**
 * Registrations dashboard for the Semantic SEO workshop.
 *
 * Sign-in lives at `/admin`, so an unauthenticated visitor is sent there rather
 * than shown a second login form. Data comes from Postgres where it is
 * reachable and from the droplet's internal admin API otherwise; see
 * `lib/admin/gateway.ts`.
 */
export default async function PavelAdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { rows, error } = await loadRegistrations();

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-lg font-semibold text-white">
            Unable to load dashboard
          </h1>
          <p className="mt-2 text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return <PavelDashboard rows={rows} />;
}
