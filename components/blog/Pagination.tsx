import Link from "next/link";
import { blogContent, pageLabel } from "@/lib/cms/content";
import { archivePageHref } from "@/lib/cms/paths";

type Props = {
  /** The unnumbered address of the list, for example /blog or /blog/category/seo. */
  base: string;
  page: number;
  totalPages: number;
};

const linkClass =
  "inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-medium text-primary transition-colors duration-200 hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong";

export default function Pagination({ base, page, totalPages }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={blogContent.pagination.label} className="mt-12 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={archivePageHref(base, page - 1)} rel="prev" className={linkClass}>
          {blogContent.pagination.previous}
        </Link>
      ) : (
        <span aria-hidden className="w-px" />
      )}
      <span className="text-sm text-text-muted tabular-nums">{pageLabel(page, totalPages)}</span>
      {page < totalPages ? (
        <Link href={archivePageHref(base, page + 1)} rel="next" className={linkClass}>
          {blogContent.pagination.next}
        </Link>
      ) : (
        <span aria-hidden className="w-px" />
      )}
    </nav>
  );
}
