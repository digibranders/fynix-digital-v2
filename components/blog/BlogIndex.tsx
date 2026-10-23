import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogHero from "@/components/blog/BlogHero";
import PostListing from "@/components/blog/PostListing";
import { pageOrLeave } from "@/components/blog/archivePaging";
import { getAllPosts, isCmsConfigured } from "@/lib/cms/client";
import { blogContent } from "@/lib/cms/content";
import { BLOG_PATH, archivePageHref } from "@/lib/cms/paths";

/** Segments after /blog for a numbered page: `page/<n>`; empty for the first page. */
const segmentsFor = (page: number | null): string[] | undefined => (page === null ? undefined : ["page", String(page)]);

export function blogIndexMetadata(page: number | null): Metadata {
  return {
    title: page === null ? blogContent.index.metaTitle : `${blogContent.index.metaTitle}, page ${page}`,
    description: blogContent.index.description,
    alternates: { canonical: archivePageHref(BLOG_PATH, page ?? 1) },
  };
}

/** The blog index. `page` is null for /blog and the number for /blog/page/<n>. */
export default async function BlogIndex({ page }: { page: number | null }) {
  if (!isCmsConfigured()) notFound();
  const posts = await getAllPosts();
  const current = pageOrLeave(posts, segmentsFor(page), BLOG_PATH);

  return (
    <>
      <BlogHero heading={blogContent.index.title} description={blogContent.index.description} />
      <PostListing page={current} base={BLOG_PATH} />
    </>
  );
}
