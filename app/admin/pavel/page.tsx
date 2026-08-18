import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { invoices, registrations } from "@/lib/db/schema";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  issueFormToken,
  HONEYPOT_FIELDS,
  FORM_TOKEN_FIELD,
} from "@/lib/security/honeypot";
import PavelLoginForm from "@/components/admin/PavelLoginForm";
import PavelDashboard, {
  type AdminRegistrationRow,
} from "@/components/admin/PavelDashboard";

export const runtime = "nodejs";
// Reads cookies + live DB on every request; never statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pavel Admin",
  robots: { index: false, follow: false },
};

async function loadRegistrations(): Promise<{
  rows: AdminRegistrationRow[];
  error: string | null;
}> {
  const db = getDb();
  if (!db) {
    return { rows: [], error: "Database is not configured (DATABASE_URL unset)." };
  }

  try {
    const records = await db
      .select({
        ref: registrations.ref,
        name: registrations.name,
        email: registrations.email,
        phone: registrations.phone,
        country: registrations.country,
        state: registrations.state,
        referralCode: registrations.referralCode,
        discountPercent: registrations.discountPercent,
        amountDisplay: registrations.amountDisplay,
        status: registrations.status,
        createdAt: registrations.createdAt,
        paidAt: registrations.paidAt,
        razorpayPaymentId: registrations.razorpayPaymentId,
        invoiceNo: invoices.invoiceNo,
      })
      .from(registrations)
      // Left join: pending seats have no invoice, and a paid seat whose issuance
      // failed should still appear in the table (with a blank invoice cell)
      // rather than vanish from the operator's view.
      .leftJoin(invoices, eq(invoices.registrationId, registrations.id))
      .orderBy(desc(registrations.createdAt));

    const rows: AdminRegistrationRow[] = records.map((r) => ({
      ref: r.ref,
      name: r.name,
      email: r.email,
      phone: r.phone,
      country: r.country,
      state: r.state,
      referralCode: r.referralCode,
      discountPercent: r.discountPercent,
      amountDisplay: r.amountDisplay,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      paidAt: r.paidAt ? r.paidAt.toISOString() : null,
      razorpayPaymentId: r.razorpayPaymentId,
      invoiceNo: r.invoiceNo,
    }));

    return { rows, error: null };
  } catch (error) {
    console.error("[admin/pavel] failed to load registrations", error);
    return {
      rows: [],
      error: "Could not load registrations. Please try again.",
    };
  }
}

export default async function PavelAdminPage() {
  // The admin dashboard reads the database directly, so it only functions where
  // the DB lives (the droplet). On a DB-less host (the Vercel marketing site)
  // send operators to the API origin that actually serves it, rather than
  // showing a login form that can never load data.
  if (!getDb()) {
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
      /\/+$/,
      ""
    );
    if (apiBase) redirect(`${apiBase}/admin/pavel`);
  }

  if (!(await isAdminAuthenticated())) {
    return (
      <PavelLoginForm
        formToken={issueFormToken()}
        honeypotFields={HONEYPOT_FIELDS}
        tokenFieldName={FORM_TOKEN_FIELD}
      />
    );
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
