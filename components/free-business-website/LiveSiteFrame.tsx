"use client";

import Image from "next/image";
import { useState } from "react";
import { frameSandboxAttribute, type FrameSandbox } from "@/lib/frame-sandbox";
import type { WorkSite } from "@/lib/work-sites";

type Props = {
  url: string;
  siteName: string;
  /** How the live page is isolated from this one; see lib/frame-sandbox.ts. */
  sandbox: FrameSandbox;
  /** Shown until the live page has loaded, so the window is never blank. */
  poster: WorkSite["image"];
};

/**
 * A client's live website at full size, filling the space it is given. The page is laid out at the visitor's own screen
 * width, so it scrolls and reads exactly as it does on its own domain.
 */
export default function LiveSiteFrame({ url, siteName, sandbox, poster }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative min-h-0 flex-1 bg-background">
      <Image
        src={poster.src}
        width={poster.width}
        height={poster.height}
        alt=""
        sizes="100vw"
        priority
        draggable={false}
        className={`absolute inset-0 size-full object-cover object-top transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}
      />
      {loaded ? null : (
        <p
          role="status"
          className="absolute inset-x-0 top-6 mx-auto w-fit rounded-full bg-primary/90 px-4 py-2 text-xs font-medium text-white shadow-lg"
        >
          Loading the live website…
        </p>
      )}
      <iframe
        src={url}
        title={`The ${siteName} website`}
        sandbox={frameSandboxAttribute(sandbox)}
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 size-full border-0 bg-white transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
