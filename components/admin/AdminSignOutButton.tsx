"use client";

import { useState } from "react";

/**
 * Ends the admin session and returns to the login screen.
 *
 * Navigates with a full page load rather than a router push so the server
 * components re-run against the cleared cookie instead of replaying a cached
 * authenticated render.
 */
export default function AdminSignOutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin";
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="rounded-lg border border-white/10 bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
    >
      {loggingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
