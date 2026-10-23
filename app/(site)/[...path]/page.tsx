import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import PostArticle from "@/components/blog/PostArticle";
import { getPostByPath, getRedirect, isCmsConfigured } from "@/lib/cms/client";
import { safeRedirectTarget, toSitePath } from "@/lib/cms/paths";
import { postMetadata } from "@/lib/cms/seo";
import { isProductionSite } from "@/lib/content";

/**
 * Renders a CMS post at its full address, which an editor can set to anything (/blog/my-post, /resources/my-post).
 * Static routes always win over this catch-all. An unknown address is looked up in the CMS redirects, then 404s.
 * While the CMS is not configured every address here is a 404, so shipping this before the CMS is live is safe.
 */
export const revalidate = 300;

type Params = { path: string[] };

/** Nothing is prerendered at build; an empty list is what makes Next cache each address after its first visit (ISR). */
export function generateStaticParams(): never[] {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const sitePath = toSitePath((await params).path);
  if (sitePath === null) return {};
  const post = await getPostByPath(sitePath);
  return post === null ? {} : postMetadata(post, { indexable: isProductionSite() });
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const sitePath = toSitePath((await params).path);
  if (sitePath === null || !isCmsConfigured()) notFound();

  const post = await getPostByPath(sitePath);
  if (post !== null) return <PostArticle post={post} />;

  const redirect = await getRedirect(sitePath);
  const target = redirect === null ? null : safeRedirectTarget(redirect.to, sitePath);
  if (target !== null) permanentRedirect(target);
  notFound();
}
