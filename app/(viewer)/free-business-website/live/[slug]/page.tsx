import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import LiveSiteFrame from "@/components/free-business-website/LiveSiteFrame";
import Logo from "@/components/Logo";
import { findWorkSite, workSites, type WorkSite } from "@/lib/work-sites";

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return workSites.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = findWorkSite(slug);
  if (!site) return {};
  return {
    title: `${site.title} website`,
    description: `The live ${site.title} website, built by Fynix Digital.`,
    // The page is the client's own site in a frame; the free business website page is what should be found in search.
    alternates: { canonical: "/free-business-website" },
    robots: { index: false, follow: true },
  };
}

/** For a site that refuses to be framed: its full-length homepage, scrolled like the real page. */
function CapturedSite({ site }: { readonly site: WorkSite }): ReactElement {
  const capture = site.fullPage ?? site.image;
  return (
    <div className="relative min-h-0 flex-1">
      <div
        tabIndex={0}
        role="region"
        aria-label={`${site.title} homepage, full length`}
        className="absolute inset-0 overflow-y-auto overscroll-contain bg-background-soft"
      >
        <Image
          src={capture.src}
          width={capture.width}
          height={capture.height}
          alt={capture.alt}
          sizes="(min-width: 1280px) 1280px, 100vw"
          priority
          draggable={false}
          className="mx-auto block h-auto w-full max-w-[80rem]"
        />
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-5 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-full bg-primary/90 px-4 py-2 text-center text-xs font-medium text-white shadow-lg">
        A full-length capture of the homepage. This site can only be opened on its own domain.
      </p>
    </div>
  );
}

/**
 * A client's website at full size inside Fynix, with a slim bar to find the way back. Visitors can scroll and click
 * through the real site without leaving ours; the bar still offers the site on its own domain.
 *
 * It sits outside the site layout on purpose: no menu, footer or smooth scrolling, so the site gets the screen.
 */
export default async function LiveSitePage({ params }: Props): Promise<ReactElement> {
  const { slug } = await params;
  const site = findWorkSite(slug);
  if (!site) notFound();

  const host = new URL(site.url).hostname.replace(/^www\./, "");

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center gap-3 bg-primary px-3 py-2.5 text-white sm:gap-5 sm:px-5">
        <Link href="/" aria-label="Fynix Digital home" className="shrink-0 rounded-md px-1 text-white">
          <Logo width={67} height={28} />
        </Link>
        <Link
          href="/free-business-website#work"
          className="group inline-flex min-w-0 items-center gap-2 rounded-full py-1.5 pr-2 text-sm font-medium text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          <span className="truncate">
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to the free business website</span>
          </span>
        </Link>
        <span className="mx-auto hidden min-w-0 truncate rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/75 md:block">{host}</span>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-primary transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:ml-0"
        >
          <span className="hidden sm:inline">Open in new tab</span>
          <span className="sm:hidden">Open</span>
          <svg aria-hidden viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
          <span className="sr-only">{` ${site.title} (opens in a new tab)`}</span>
        </a>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">The {site.title} website</h1>
        {site.embeddable ? (
          <LiveSiteFrame url={site.url} siteName={site.title} sandbox={site.sandbox} poster={site.image} />
        ) : (
          <CapturedSite site={site} />
        )}
      </main>
    </div>
  );
}
