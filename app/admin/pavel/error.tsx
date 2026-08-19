"use client";

import { AdminErrorState } from "@/components/admin/AdminErrorState";

export default function PavelAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AdminErrorState
      error={error}
      reset={reset}
      what="The registrations dashboard"
    />
  );
}
