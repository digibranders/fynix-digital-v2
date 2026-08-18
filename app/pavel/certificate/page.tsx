import { notFound } from "next/navigation";

/**
 * Retired route.
 *
 * This page used to render a certificate from query-string parameters
 * (`?name=…&id=…&date=…`), which meant anyone could mint a convincing
 * certificate of completion for any name simply by editing the URL. For a paid
 * credential that is forgery by design, so it is gone.
 *
 * Real certificates live at `/pavel/certificate/[credentialId]` and render only
 * what the issued database row says. The marketing sample on the landing page
 * renders the `Certificate` component directly and never used this route.
 */
export default function RetiredCertificatePage() {
  notFound();
}
