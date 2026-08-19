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
      className="console-focus rounded-lg border border-console-control bg-console-surface px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-console-sunken disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loggingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
