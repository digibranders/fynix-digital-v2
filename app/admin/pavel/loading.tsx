import Logo from "@/components/Logo";
import { Card, Skeleton } from "@/components/admin/ui";

/**
 * The dashboard while its three reads are in flight.
 *
 * The page is `force-dynamic`, which does not mean there is no loading state:
 * Next still streams the shell and this fallback first, then the resolved page.
 * On the droplet those reads take a visible moment, and what used to be there
 * was a white screen.
 *
 * The table is drawn as full-width bars rather than a grid of fake cells. The
 * real column set comes from the operator's saved preference and is only known
 * once the client has hydrated, so any specific number of columns here would be
 * wrong for anyone who has changed it.
 */
export default function PavelAdminLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <Logo width={84} height={35} className="text-primary opacity-40" />
          <Skeleton className="h-4 w-48" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
        <div className="mx-auto max-w-[1800px] px-4 pb-3 sm:px-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-4 px-4 py-6 sm:px-6">
        <span className="sr-only" role="status">
          Loading the registrations dashboard
        </span>

        <Card>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-5 py-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i}>
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="mt-2.5 h-6 w-24" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <Skeleton className="h-10 w-72" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <div className="border-t border-border">
            <div className="bg-console-sunken px-4 py-3">
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="px-4 py-3.5">
                  {/* One bar per row, not a fake grid: see the note above. */}
                  <Skeleton className="h-4" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
