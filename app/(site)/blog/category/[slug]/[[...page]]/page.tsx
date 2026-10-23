import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogHero from "@/components/blog/BlogHero";
import PostListing from "@/components/blog/PostListing";
import { pageOrLeave } from "@/components/blog/archivePaging";
import { getAllPosts, getCategories, isCmsConfigured } from "@/lib/cms/client";
import { archiveDescription, blogContent } from "@/lib/cms/content";
import { archivePageHref, categoryHref, parsePageSegments } from "@/lib/cms/paths";

export const revalidate = 300;

type Params = { slug: string; page?: string[] };

/** Nothing is prerendered at build; an empty list is what makes Next cache each address after its first visit (ISR). */
export function generateStaticParams(): never[] {
  return [];
}

async function loadCategory(slug: string) {
  if (!isCmsConfigured()) return null;
  const [categories, posts] = await Promise.all([getCategories(), getAllPosts()]);
  const category = categories.find((entry) => entry.slug === slug);
  const inCategory = posts.filter((post) => post.category?.slug === slug);
  return category === undefined || inCategory.length === 0 ? null : { category, posts: inCategory };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, page } = await params;
  const parsed = parsePageSegments(page);
  const found = parsed.kind === "page" ? await loadCategory(slug) : null;
  if (found === null || parsed.kind !== "page") return {};
  return {
    title: parsed.page === 1 ? found.category.name : `${found.category.name}, page ${parsed.page}`,
    description: found.category.description ?? archiveDescription(found.category.count, "in this category"),
    alternates: { canonical: archivePageHref(categoryHref(slug), parsed.page) },
  };
}

export default async function CategoryArchivePage({ params }: { params: Promise<Params> }) {
  const { slug, page } = await params;
  const found = await loadCategory(slug);
  if (found === null) notFound();

  const base = categoryHref(slug);
  const current = pageOrLeave(found.posts, page, base);
  return (
    <>
      <BlogHero
        eyebrow={blogContent.archive.category}
        heading={found.category.name}
        description={found.category.description ?? archiveDescription(found.category.count, "in this category")}
      />
      <PostListing page={current} base={base} />
    </>
  );
}
