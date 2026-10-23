import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import BlogIndex, { blogIndexMetadata } from "@/components/blog/BlogIndex";
import { BLOG_PATH, parsePageSegments } from "@/lib/cms/paths";

export const revalidate = 300;

type Params = { page: string };

/** Nothing is prerendered at build; an empty list is what makes Next cache each address after its first visit (ISR). */
export function generateStaticParams(): never[] {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const parsed = parsePageSegments(["page", (await params).page]);
  return parsed.kind === "page" ? blogIndexMetadata(parsed.page) : {};
}

export default async function BlogPageNumber({ params }: { params: Promise<Params> }) {
  const parsed = parsePageSegments(["page", (await params).page]);
  if (parsed.kind === "first") permanentRedirect(BLOG_PATH);
  if (parsed.kind === "invalid") notFound();
  return <BlogIndex page={parsed.page} />;
}
