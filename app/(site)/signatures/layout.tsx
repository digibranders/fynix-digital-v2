import type { Metadata } from "next";

/**
 * Internal tool page. `robots: noindex, nofollow` stays: this lists team
 * members' names, roles, and direct contact links, not something meant to
 * surface in search or have its outbound links crawled.
 */
export const metadata: Metadata = {
  title: "Email Signatures",
  robots: { index: false, follow: false },
};

export default function SignaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
