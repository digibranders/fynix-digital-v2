import Image from "next/image";
import Link from "next/link";
import BlogHero from "@/components/blog/BlogHero";
import PostCard from "@/components/blog/PostCard";
import { prepareBody } from "@/lib/cms/body";
import { blogContent } from "@/lib/cms/content";
import { formatDate, readingLabel } from "@/lib/cms/format";
import { authorHref, categoryHref } from "@/lib/cms/paths";
import type { PostDetail } from "@/lib/cms/schema";
import { jsonLdScript } from "@/lib/cms/seo";

const TOC_INDENT: Record<2 | 3 | 4, string> = { 2: "", 3: "pl-4", 4: "pl-8" };

export default function PostArticle({ post }: { post: PostDetail }) {
  const body = prepareBody(post.html, post.h1Source);
  const showUpdated = formatDate(post.updatedAt) !== formatDate(post.publishedAt);
  const copy = blogContent.post;

  return (
    <>
      <BlogHero
        eyebrow={
          post.category ? (
            <Link href={categoryHref(post.category.slug)} className="hover:underline underline-offset-4">
              {post.category.name}
            </Link>
          ) : undefined
        }
        heading={body.heading.kind === "title" ? post.title : <div dangerouslySetInnerHTML={{ __html: body.heading.html }} />}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
          {post.authors.map((author) => (
            <span key={author.slug}>
              <Link href={authorHref(author.slug)} className="text-white hover:underline underline-offset-4">
                {author.name}
              </Link>
              {author.jobTitle ? <span className="text-white/60">, {author.jobTitle}</span> : null}
            </span>
          ))}
          <span>
            {copy.published} <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </span>
          {showUpdated ? (
            <span>
              {copy.updated} <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
            </span>
          ) : null}
          <span>{readingLabel(post.readingMinutes)}</span>
        </div>
      </BlogHero>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {post.toc.length > 0 ? (
            <nav
              aria-label={copy.contents}
              className="lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:sticky lg:top-28 lg:self-start"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-text-muted font-semibold mb-5">
                {copy.contents}
              </p>
              <ul className="space-y-3">
                {post.toc.map((item) => (
                  <li key={item.id} className={TOC_INDENT[item.level]}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-text-muted hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <article className="lg:col-span-8 lg:col-start-4 lg:row-start-1 min-w-0 max-w-3xl">
            {post.cover ? (
              <Image
                src={post.cover.url}
                alt={post.cover.alt}
                width={post.cover.width}
                height={post.cover.height}
                priority
                unoptimized
                sizes="(min-width: 1024px) 768px, 100vw"
                className="mb-10 h-auto w-full rounded-xl border border-border"
              />
            ) : null}

            <div className="post-prose" dangerouslySetInnerHTML={{ __html: body.html }} />

            {post.faq.length > 0 ? (
              <section aria-labelledby="post-faq" className="mt-16">
                <h2 id="post-faq" className="font-serif text-2xl md:text-3xl text-primary font-medium">
                  {copy.faq}
                </h2>
                <div className="mt-6 border-t border-border">
                  {post.faq.map((item) => (
                    <details key={item.question} className="group border-b border-border">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                        </svg>
                      </summary>
                      <p className="pb-6 text-text-muted font-light leading-relaxed whitespace-pre-line">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        </div>
      </section>

      {post.related.length > 0 ? (
        <section aria-labelledby="post-related" className="py-16 md:py-24 bg-background-soft">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h2 id="post-related" className="font-serif text-3xl md:text-4xl text-primary font-medium">
              {copy.related}
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {post.related.map((related) => (
                <li key={related.path} className="flex">
                  <PostCard post={related} as="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {post.jsonLd.map((node, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(node) }} />
      ))}
    </>
  );
}
