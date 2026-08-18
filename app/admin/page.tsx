import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  issueFormToken,
  HONEYPOT_FIELDS,
  FORM_TOKEN_FIELD,
} from "@/lib/security/honeypot";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminHub from "@/components/admin/AdminHub";

export const runtime = "nodejs";
// Reads the session cookie on every request; never statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fynix Admin",
};

/**
 * Admin console entry point.
 *
 * Signed out, this is the login screen. Signed in, it is the list of events;
 * each card opens that event's own dashboard. Every admin route funnels through
 * here, so there is exactly one place to sign in.
 */
export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return (
      <AdminLoginForm
        formToken={issueFormToken()}
        honeypotFields={HONEYPOT_FIELDS}
        tokenFieldName={FORM_TOKEN_FIELD}
      />
    );
  }

  return <AdminHub />;
}
