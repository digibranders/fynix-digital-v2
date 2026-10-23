import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogHero from "@/components/blog/BlogHero";
import PostListing from "@/components/blog/PostListing";
import { pageOrLeave } from "@/components/blog/archivePaging";
import { getAllPosts, getAuthors, isCmsConfigured } from "@/lib/cms/client";
import { archiveDescription, blogContent } from "@/lib/cms/content";
import { archivePageHref, authorHref, parsePageSegments } from "@/lib/cms/paths";

export const revalidate = 300;

type Params = { slug: string; page?: string[] };

/** Nothing is prerendered at build; an empty list is what makes Next cache each address after its first visit (ISR). */
export function generateStaticParams(): never[] {
  return [];
}

async function loadAuthor(slug: string) {
  if (!isCmsConfigured()) return null;
  const [authors, posts] = await Promise.all([getAuthors(), getAllPosts()]);
  const author = authors.find((entry) => entry.slug === slug);
  const byAuthor = posts.filter((post) => post.authors.some((entry) => entry.slug === slug));
  return author === undefined || byAuthor.length === 0 ? null : { author, posts: byAuthor };
}

const describe = (author: { bio: string | null }, count: number): string =>
  author.bio ?? archiveDescription(count, "written");

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, page } = await params;
  const parsed = parsePageSegments(page);
  const found = parsed.kind === "page" ? await loadAuthor(slug) : null;
  if (found === null || parsed.kind !== "page") return {};
  return {
    title: parsed.page === 1 ? found.author.name : `${found.author.name}, page ${parsed.page}`,
    description: describe(found.author, found.author.count),
    alternates: { canonical: archivePageHref(authorHref(slug), parsed.page) },
  };
}

export default async function AuthorArchivePage({ params }: { params: Promise<Params> }) {
  const { slug, page } = await params;
  const found = await loadAuthor(slug);
  if (found === null) notFound();

  const base = authorHref(slug);
  const current = pageOrLeave(found.posts, page, base);
  return (
    <>
      <BlogHero
        eyebrow={found.author.jobTitle ? `${blogContent.archive.author}, ${found.author.jobTitle}` : blogContent.archive.author}
        heading={found.author.name}
        description={describe(found.author, found.author.count)}
      />
      <PostListing page={current} base={base} />
    </>
  );
}
