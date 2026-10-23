import Image from "next/image";
import Link from "next/link";
import { formatDate, readingLabel } from "@/lib/cms/format";
import type { PostSummary } from "@/lib/cms/schema";

type Props = {
  post: PostSummary;
  /** h2 on listing pages, h3 where the card sits under a section heading. */
  as?: "h2" | "h3";
};

export default function PostCard({ post, as: Heading = "h2" }: Props) {
  const byline = post.authors.map((author) => author.name).join(", ");
  return (
    <article className="relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-colors duration-200 hover:border-accent-strong">
      {post.cover ? (
        <Image
          src={post.cover.url}
          alt={post.cover.alt}
          width={post.cover.width}
          height={post.cover.height}
          unoptimized
          sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
          className="aspect-[16/9] w-full object-cover border-b border-border"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-6 md:p-7">
        {post.category ? (
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent-strong">{post.category.name}</p>
        ) : null}
        <Heading className="mt-3 font-serif text-xl md:text-2xl text-primary font-medium leading-snug text-balance">
          <Link
            href={post.path}
            className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
          >
            {post.title}
          </Link>
        </Heading>
        {post.excerpt ? (
          <p className="mt-3 text-sm md:text-base text-text-muted font-light leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}
        <p className="mt-auto pt-6 text-xs text-text-muted">
          {byline ? <span>{byline}</span> : null}
          {byline ? <span aria-hidden> / </span> : null}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden> / </span>
          <span>{readingLabel(post.readingMinutes)}</span>
        </p>
      </div>
    </article>
  );
}
