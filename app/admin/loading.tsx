import Logo from "@/components/Logo";
import { Card, Skeleton } from "@/components/admin/ui";

/** The event list while the session cookie is read. */
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Logo width={84} height={35} className="text-primary opacity-40" />
          <Skeleton className="h-7 w-20" />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <span className="sr-only" role="status">
          Loading the console
        </span>
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="mt-3 h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <Card key={i}>
              <div className="space-y-3 p-6">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
