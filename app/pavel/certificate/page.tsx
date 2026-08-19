import type { Metadata } from "next";
import "../pavel.css";
import "./certificate.css";
import { loadSchedule } from "@/lib/pavel/loadSchedule";
import { PricingProvider } from "@/components/pavel/PricingProvider";
import { Navbar } from "@/components/pavel/sections/Navbar";
import { Footer } from "@/components/pavel/sections/Footer";
import { CertificateVerify } from "@/components/pavel/CertificateVerify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify a certificate — Semantic SEO Masterclass | Fynix Digital",
  description:
    "Check that a Semantic SEO Masterclass certificate was issued by Fynix Digital, using its credential ID or the email it was issued to.",
  // Indexable, unlike the certificates themselves: this page holds nobody's
  // details, and an employer looking for "verify Fynix certificate" should
  // find it.
  robots: { index: true, follow: true },
};

/**
 * Certificate verification.
 *
 * This route used to render a certificate straight from query-string
 * parameters, which let anyone mint a convincing credential for any name by
 * editing the URL. It was retired to a 404. It now does the opposite job:
 * proving a certificate is real rather than fabricating one.
 *
 * Nothing is rendered here from user input. The form asks the server, and the
 * server answers with a credential id or nothing at all; the certificate itself
 * is then loaded by the page that reads the issued row.
 *
 * The email route is a deliberate product decision with a cost attached: it
 * answers whether a given person attended, which the credential id alone does
 * not. The lookup endpoint carries the bot screen and rate limit that keep that
 * from being cheap to abuse in bulk.
 */
export default async function CertificateVerifyPage() {
  const schedule = await loadSchedule();

  return (
    <PricingProvider initialCountry="REST" schedule={schedule}>
      <div className="min-h-screen bg-background-soft text-primary tnum">
        <Navbar minimal />
        <main className="cert-main">
          <section className="cert-verify">
            <p className="cert-verify__eyebrow">Credential check</p>
            <h1 className="cert-verify__title">Verify a certificate</h1>
            <p className="cert-verify__lead">
              Every Semantic SEO Masterclass certificate carries a credential ID.
              Enter it below, or the email the seat was booked with, to open the
              certificate it belongs to.
            </p>

            <CertificateVerify />

            <p className="cert-verify__note">
              Certificates are issued only to attendees who completed the live
              session. If nothing comes up, check the ID for typos or write to{" "}
              <a href="mailto:hello@fynix.digital" className="cert-verify__link">
                hello@fynix.digital
              </a>
              .
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </PricingProvider>
  );
}
