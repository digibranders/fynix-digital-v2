import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { loadRegistrations } from "@/lib/admin/registrations";
import { loadSessions, mutateSession } from "@/lib/admin/sessions";
import PavelDashboard from "@/components/admin/PavelDashboard";
import { SessionPanel } from "@/components/admin/SessionPanel";

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

  const [{ rows, error }, sessionsResult] = await Promise.all([
    loadRegistrations(),
    loadSessions(),
  ]);

  /**
   * Session mutations re-check the operator's session. A form action is a POST
   * endpoint in its own right, so authorising only the page render would leave
   * these callable by anyone who knows the action id.
   */
  async function createSessionAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateSession("create", {
      zoomWebinarId: String(formData.get("zoomWebinarId") ?? ""),
      label: String(formData.get("label") ?? ""),
      startsAt: String(formData.get("startsAt") ?? ""),
      endsAt: String(formData.get("endsAt") ?? ""),
    });
    revalidatePath("/admin/pavel");
  }

  async function activateSessionAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateSession("activate", {
      sessionId: String(formData.get("sessionId") ?? ""),
    });
    revalidatePath("/admin/pavel");
  }

  async function setClosedAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateSession(
      formData.get("closed") === "true" ? "close" : "reopen",
      { sessionId: String(formData.get("sessionId") ?? "") }
    );
    revalidatePath("/admin/pavel");
    // The landing page renders the open/closed state from a cached read, so a
    // close that only updated the console would leave a price on screen.
    revalidatePath("/pavel");
  }

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

  return (
    <PavelDashboard rows={rows}>
      <SessionPanel
        sessions={sessionsResult.sessions}
        error={sessionsResult.error}
        createAction={createSessionAction}
        activateAction={activateSessionAction}
        setClosedAction={setClosedAction}
      />
    </PavelDashboard>
  );
}
