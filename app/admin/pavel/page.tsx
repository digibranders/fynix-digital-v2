import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { loadRegistrations } from "@/lib/admin/registrations";
import { loadSessions, mutateSession } from "@/lib/admin/sessions";
import { loadReferrals, mutateReferral } from "@/lib/admin/referrals";
import PavelDashboard from "@/components/admin/PavelDashboard";
import { SessionPanel } from "@/components/admin/SessionPanel";
import {
  OperationsPanel,
  type OperationState,
} from "@/components/admin/OperationsPanel";
import { runAdminOperation } from "@/lib/admin/operations";
import { ReferralPanel } from "@/components/admin/ReferralPanel";
import { ADMIN_EVENTS } from "@/lib/admin/events";

export const runtime = "nodejs";
// Reads cookies + live data on every request; never statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Semantic SEO Workshop · Fynix Admin",
};

/** The event this dashboard manages, so its name is not written twice. */
const EVENT = ADMIN_EVENTS.find((e) => e.slug === "pavel");

/** "How old is this?" in the zone the workshop runs in. */
const LOADED_AT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Clear the landing page from every cache after a session change.
 *
 * `/pavel` is served from prerendered per-country/timezone variants, so
 * revalidating the public path alone would leave the cached variants serving
 * the old date, or a price for a cohort that has just been closed. Passing the
 * route pattern with type "page" clears every generated combination at once.
 *
 * The checkout route re-derives the window from the database on every attempt,
 * so a stale page could never actually sell a closed seat; this is about the
 * operator seeing their change take effect immediately.
 */
async function revalidateLanding() {
  "use server";
  revalidatePath("/admin/pavel");
  revalidatePath("/pavel");
  revalidatePath("/pavel/v/[country]/[zone]", "page");
}

/**
 * Read the referral code fields out of a submitted form.
 *
 * Module scope on purpose. Declared inside the component it became a closure
 * the inline server actions captured, and an action's captured bindings are
 * serialised — a function is not something that can survive that.
 * `mutateReferral` validates every one of these, so they are passed through raw.
 */
function referralFields(formData: FormData) {
  return {
    code: String(formData.get("code") ?? ""),
    discountPercent: String(formData.get("discountPercent") ?? ""),
    label: String(formData.get("label") ?? ""),
    ownerName: String(formData.get("ownerName") ?? ""),
    ownerEmail: String(formData.get("ownerEmail") ?? ""),
    commissionPercent: String(formData.get("commissionPercent") ?? ""),
    maxUses: String(formData.get("maxUses") ?? ""),
    expiresAt: String(formData.get("expiresAt") ?? ""),
  };
}

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

  const [{ rows, error }, sessionsResult, referralsResult] = await Promise.all([
    loadRegistrations(),
    loadSessions(),
    loadReferrals(),
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
    await revalidateLanding();
  }

  /** Set or correct when an existing session runs. */
  async function updateSessionAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateSession("update", {
      sessionId: String(formData.get("sessionId") ?? ""),
      startsAt: String(formData.get("startsAt") ?? ""),
      endsAt: String(formData.get("endsAt") ?? ""),
    });
    await revalidateLanding();
  }

  async function activateSessionAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateSession("activate", {
      sessionId: String(formData.get("sessionId") ?? ""),
    });
    await revalidateLanding();
  }

  /** Publish or clear the Zoom recording link, and its passcode, for a session. */
  async function setRecordingAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateSession("recording", {
      sessionId: String(formData.get("sessionId") ?? ""),
      recordingUrl: String(formData.get("recordingUrl") ?? ""),
      recordingPasscode: String(formData.get("recordingPasscode") ?? ""),
    });
    await revalidateLanding();
  }

  async function deleteSessionAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateSession("delete", {
      sessionId: String(formData.get("sessionId") ?? ""),
    });
    await revalidateLanding();
  }

  async function setClosedAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    await mutateSession(
      formData.get("closed") === "true" ? "close" : "reopen",
      { sessionId: String(formData.get("sessionId") ?? "") }
    );
    await revalidateLanding();
  }

  /**
   * Referral mutations. Authorised individually, for the same reason the session
   * actions are: a form action is a POST endpoint in its own right, so
   * authorising only the page render would leave these callable by anyone who
   * knows the action id.
   *
   * Each returns what happened rather than swallowing it. `mutateReferral` does
   * all the validation and answers with a message an operator can act on ("That
   * code already exists", "Discount must be a whole number between 1 and 100"),
   * and discarding that made a rejected create indistinguishable from a
   * successful one: the form simply cleared and no code appeared.
   *
   * Only `/admin/pavel` is revalidated, not the landing page: a code change
   * alters nothing that is cached publicly. The page never renders a code, and
   * checkout re-reads the rules from the database on every attempt.
   */
  async function createReferralAction(
    _state: OperationState,
    formData: FormData
  ): Promise<OperationState> {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    const error = await mutateReferral("create", referralFields(formData));
    revalidatePath("/admin/pavel");
    return error
      ? { ok: false, message: error }
      : { ok: true, message: "Code created." };
  }

  async function updateReferralAction(
    _state: OperationState,
    formData: FormData
  ): Promise<OperationState> {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    const error = await mutateReferral("update", {
      id: String(formData.get("id") ?? ""),
      ...referralFields(formData),
    });
    revalidatePath("/admin/pavel");
    return error ? { ok: false, message: error } : { ok: true, message: "Saved." };
  }

  async function toggleReferralAction(
    _state: OperationState,
    formData: FormData
  ): Promise<OperationState> {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    const active = formData.get("active") === "true";
    const error = await mutateReferral("toggle", {
      id: String(formData.get("id") ?? ""),
      active,
    });
    revalidatePath("/admin/pavel");
    return error
      ? { ok: false, message: error }
      : { ok: true, message: active ? "Code switched on." : "Code switched off." };
  }

  async function deleteReferralAction(
    _state: OperationState,
    formData: FormData
  ): Promise<OperationState> {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    const error = await mutateReferral("delete", {
      id: String(formData.get("id") ?? ""),
    });
    revalidatePath("/admin/pavel");
    return error
      ? { ok: false, message: error }
      : { ok: true, message: "Code deleted." };
  }

  /**
   * Manual recovery actions. Each returns what happened so the panel can show
   * it: these are used when something already failed once, and a silent result
   * is indistinguishable from another failure.
   */
  async function resendConfirmationAction(
    _state: OperationState,
    formData: FormData
  ): Promise<OperationState> {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    return runAdminOperation("resend_confirmation", {
      ref: String(formData.get("ref") ?? ""),
    });
  }

  async function resendCertificateAction(
    _state: OperationState,
    formData: FormData
  ): Promise<OperationState> {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    return runAdminOperation("resend_certificate", {
      ref: String(formData.get("ref") ?? ""),
    });
  }

  async function sendRecordingAction(): Promise<OperationState> {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    return runAdminOperation("send_recording");
  }

  async function syncAttendanceAction(): Promise<OperationState> {
    "use server";
    if (!(await isAdminAuthenticated())) redirect("/admin");
    const result = await runAdminOperation("sync_attendance");
    revalidatePath("/admin/pavel");
    return result;
  }

  /*
    When the data was read, in IST.

    Formatted on the SERVER and passed down as a string. Formatting it in the
    browser would render a different value than the server did and mismatch on
    hydration; fixing the zone to Asia/Kolkata makes it deterministic, and IST
    is the zone every other time on this page is shown in.
  */
  const loadedAtLabel = LOADED_AT.format(new Date());

  /*
    A failed registrations read is no longer a dead end.

    It used to replace the whole page with a red box, which also took away the
    session and referral panels — both of which load independently and are
    usually fine. The error travels into the console instead, where the views
    that depend on it say so and the ones that do not still work.
  */
  return (
    <PavelDashboard
      rows={rows}
      error={error ?? null}
      eventName={EVENT?.name ?? "Semantic SEO Workshop"}
      publicPath={EVENT?.publicPath ?? "/pavel"}
      loadedAtLabel={loadedAtLabel}
      // Per-seat recovery, rendered as the table's Actions column and in a
      // row's detail drawer.
      resendConfirmationAction={resendConfirmationAction}
      resendCertificateAction={resendCertificateAction}
      sessionsSlot={
        <div className="space-y-4">
          <SessionPanel
            sessions={sessionsResult.sessions}
            error={sessionsResult.error}
            createAction={createSessionAction}
            activateAction={activateSessionAction}
            setClosedAction={setClosedAction}
            deleteAction={deleteSessionAction}
            recordingAction={setRecordingAction}
            updateAction={updateSessionAction}
          />
          {/* Sits with the session because that is what it acts on: it pulls
              the active webinar's attendance report. */}
          <OperationsPanel
            syncAttendanceAction={syncAttendanceAction}
            sendRecordingAction={sendRecordingAction}
          />
        </div>
      }
      referralsSlot={
        <ReferralPanel
          codes={referralsResult.codes}
          error={referralsResult.error}
          createAction={createReferralAction}
          updateAction={updateReferralAction}
          toggleAction={toggleReferralAction}
          deleteAction={deleteReferralAction}
        />
      }
    />
  );
}
