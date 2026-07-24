import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import TableOfContents from "@/components/TableOfContents";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import { siteConfig } from "@/lib/content";

const LAST_UPDATED = "July 2026";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions that govern engagements with Fynix and the use of fynix.digital.",
  alternates: { canonical: "/terms" },
};

type Section = { id: string; heading: string; body: string };

const sections: Section[] = [
  {
    id: "overview",
    heading: "1. Overview",
    body: `These Terms and Conditions ("Terms") govern your access to and use of ${siteConfig.name} ("we", "us", "our") and the services we deliver, including UI/UX design, web development, SEO/AEO, and lead generation for cybersecurity companies. By engaging our services or using this website, you agree to these Terms.`,
  },
  {
    id: "services",
    heading: "2. Services",
    body: "The scope, deliverables, timelines, and fees of any engagement are defined in a written proposal or statement of work (SOW) executed between you and Fynix. In the event of a conflict between these Terms and an SOW, the SOW governs the specific engagement.",
  },
  {
    id: "acceptance",
    heading: "3. Acceptance & Changes",
    body: "By signing a proposal or SOW, you accept these Terms as they apply to that engagement. We may update these Terms from time to time; the version in force at the time of your SOW governs that engagement. Website use is subject to the current published version.",
  },
  {
    id: "client-obligations",
    heading: "4. Client Obligations",
    body: "You agree to provide timely feedback, access to stakeholders, brand assets, analytics, and any accounts or credentials required to complete the engagement. Delays caused by missing inputs may extend timelines and are not the responsibility of Fynix.",
  },
  {
    id: "fees-payment",
    heading: "5. Fees & Payment",
    body: "Fees are set in the SOW. Unless stated otherwise, invoices are due within 14 days of issue. Late payments may incur interest at the maximum rate permitted by law. Third-party costs (hosting, licenses, ad spend) are billed at cost or as agreed in the SOW.",
  },
  {
    id: "intellectual-property",
    heading: "6. Intellectual Property",
    body: "On full payment, we assign to you all rights in the final custom deliverables produced for your engagement, excluding third-party assets, our pre-existing tools, methodologies, and generally reusable components, which we license to you under a non-exclusive, worldwide licence for use with the delivered work.",
  },
  {
    id: "confidentiality",
    heading: "7. Confidentiality",
    body: "Each party will keep confidential information disclosed by the other confidential and use it only for the purposes of the engagement. This obligation survives termination for three years. Publicly available information and information required to be disclosed by law are excluded.",
  },
  {
    id: "warranties-liability",
    heading: "8. Warranties & Liability",
    body: `We provide services with reasonable care and skill. We do not warrant that the website or its outputs will be uninterrupted or error-free. To the maximum extent permitted by law, our aggregate liability arising out of or in connection with an engagement is limited to the fees paid to Fynix in the twelve months preceding the claim.`,
  },
  {
    id: "termination",
    heading: "9. Termination",
    body: "Either party may terminate an engagement by written notice for material breach uncured within 30 days of notice. On termination, you pay for all services performed up to the effective date of termination.",
  },
  {
    id: "governing-law",
    heading: "10. Governing Law",
    body: "These Terms are governed by the laws of India, without regard to conflict-of-law rules. The courts of Bengaluru have exclusive jurisdiction, without prejudice to any mandatory statutory rights.",
  },
  {
    id: "contact",
    heading: "11. Contact",
    body: `Questions about these Terms can be sent to ${siteConfig.email}.`,
  },
];

const tocItems = sections.map((s) => ({
  id: s.id,
  label: s.heading.replace(/^\d+\.\s*/, ""),
}));

export default function TermsPage() {
  return (
    <>
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-6xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[64px] text-white font-medium leading-tight">
            The ground rules.{" "}
            <span className="font-serif italic text-[#e9af88] md:block">Clear, fair, short.</span>
          </h1>
          <p className="text-white/60 text-sm font-mono uppercase tracking-widest mt-6">
            Last updated · {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <aside className="lg:col-span-4 xl:col-span-3 order-first lg:order-none">
            <div className="lg:sticky lg:top-28">
              <TableOfContents items={tocItems} />
            </div>
          </aside>

          <div className="lg:col-span-8 xl:col-span-9 space-y-14">
            {sections.map((section, idx) => (
              <Reveal key={section.id} delay={idx * 40}>
                <article id={section.id} className="scroll-mt-28">
                  <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium leading-tight">
                    {section.heading}
                  </h2>
                  <p className="mt-4 text-base text-text-muted font-normal leading-relaxed">
                    {section.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
