"use client";

import { useEffect, useRef, useState } from "react";
import { Certificate, type CertificateProps } from "@/components/pavel/Certificate";

/**
 * The certificate's inner layout uses fixed-pixel columns (spine + body), so it
 * only composes correctly at (or near) its design width — below ~900px those
 * columns overflow and overlap. To display it in a narrow marketing column we
 * therefore render it at full NATURAL_WIDTH and uniformly `transform: scale()`
 * the finished result down to whatever width the container gives us. Because it
 * is scaled (not reflowed), the composition stays pixel-perfect at any size,
 * and the text stays crisp (it's vector/DOM, not a raster).
 */
const NATURAL_WIDTH = 960;
const ASPECT = 1.414; // matches `.cert` aspect-ratio (A-series landscape)

export function CertificateEmbed(props: CertificateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) setScale(width / NATURAL_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      // aspect-ratio gives the box its correct height before JS measures, so the
      // section reserves the right space and nothing jumps on first paint.
      style={{
        width: "100%",
        aspectRatio: `${ASPECT} / 1`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: NATURAL_WIDTH,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          // Hidden until measured so the unscaled 960px render never flashes.
          visibility: scale ? "visible" : "hidden",
        }}
      >
        <Certificate {...props} />
      </div>
    </div>
  );
}
