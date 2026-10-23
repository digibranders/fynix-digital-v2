import type { Page } from "@/lib/cms/paths";
import type { PostSummary } from "@/lib/cms/schema";
import { blogContent } from "@/lib/cms/content";
import Pagination from "@/components/blog/Pagination";
import PostCard from "@/components/blog/PostCard";

type Props = {
  page: Page<PostSummary>;
  base: string;
};

/** The card grid and pager shared by the blog index and the category and author archives. */
export default function PostListing({ page, base }: Props) {
  return (
    <section className="py-16 md:py-24 bg-background-soft">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {page.items.length === 0 ? (
          <p className="text-text-muted">{blogContent.empty}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {page.items.map((post) => (
              <li key={post.path} className="flex">
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
        <Pagination base={base} page={page.page} totalPages={page.totalPages} />
      </div>
    </section>
  );
}
