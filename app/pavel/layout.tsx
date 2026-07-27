import SmoothScroll from "@/components/SmoothScroll";

/**
 * The /pavel workshop page is a standalone route (outside the (site) group),
 * so it doesn't inherit the site's SmoothScroll. Wrap it here so the workshop
 * page gets the same Lenis smooth-scroll feel as the rest of fynix.
 */
export default function PavelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
