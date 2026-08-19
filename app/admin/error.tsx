"use client";

import { AdminErrorState } from "@/components/admin/AdminErrorState";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminErrorState error={error} reset={reset} what="The console" />;
}
