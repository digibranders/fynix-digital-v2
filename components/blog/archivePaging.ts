import { notFound, permanentRedirect } from "next/navigation";
import { paginate, parsePageSegments, type Page } from "@/lib/cms/paths";
import type { PostSummary } from "@/lib/cms/schema";

/**
 * The requested page of an archive, or a redirect or 404. `page/1` duplicates the unnumbered address, so it
 * redirects there; a malformed or out-of-range page is a 404.
 */
export function pageOrLeave(posts: readonly PostSummary[], segments: readonly string[] | undefined, base: string): Page<PostSummary> {
  const parsed = parsePageSegments(segments);
  if (parsed.kind === "first") permanentRedirect(base);
  if (parsed.kind === "invalid") notFound();
  const page = paginate(posts, parsed.page);
  if (page === null) notFound();
  return page;
}
