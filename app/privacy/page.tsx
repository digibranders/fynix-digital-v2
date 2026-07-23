import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import TableOfContents from "@/components/TableOfContents";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import { siteConfig } from "@/lib/content";

const LAST_UPDATED = "July 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Fynix collects, uses, and protects personal information from visitors to fynix.digital and from clients we work with.",
  alternates: { canonical: "/privacy" },
};

type Section = { id: string; heading: string; body: string };

const sections: Section[] = [
  {
    id: "overview",
    heading: "1. Overview",
    body: `${siteConfig.name} ("we", "us", "our") respects your privacy. This Policy explains what personal information we collect when you visit fynix.digital or engage us for services, how we use it, and the choices you have.`,
  },
  {
    id: "information-we-collect",
    heading: "2. Information We Collect",
    body: "We collect information you provide directly (name, work email, company, phone number, and the details of your enquiry), information collected automatically when you use the website (IP address, device and browser information, referring URL, pages viewed, timestamps), and information from third parties you connect to our services (such as analytics, CRM, or advertising platforms during an engagement).",
  },
  {
    id: "how-we-use",
    heading: "3. How We Use Information",
    body: "We use the information to respond to enquiries, deliver contracted services, improve the website and our offerings, communicate about relevant work, and meet legal, tax, and accounting obligations. We do not sell personal information.",
  },
  {
    id: "cookies",
    heading: "4. Cookies & Tracking",
    body: "We use a minimal set of first-party cookies for essential website functions and analytics. Analytics cookies help us understand which pages are useful. You can control cookies through your browser settings; blocking non-essential cookies will not prevent core site functionality.",
  },
  {
    id: "sharing",
    heading: "5. Sharing of Information",
    body: "We share personal information only with service providers who process it on our behalf under written agreements (hosting, analytics, email delivery), with authorities where required by law, and with a successor entity in the event of a merger, acquisition, or sale of assets. Every provider is subject to confidentiality obligations.",
  },
  {
    id: "retention",
    heading: "6. Retention",
    body: "We retain personal information only as long as necessary to fulfil the purposes described in this Policy, comply with our legal obligations, resolve disputes, and enforce our agreements. Enquiry data is retained for up to 24 months unless a client relationship is established.",
  },
  {
    id: "your-rights",
    heading: "7. Your Rights",
    body: "Subject to applicable law, you may request access to, correction of, deletion of, or a copy of the personal information we hold about you. You may also object to certain processing. Requests can be made to the contact address below and will be responded to within a reasonable timeframe.",
  },
  {
    id: "international-transfers",
    heading: "8. International Transfers",
    body: "We operate from India and the United Kingdom. Personal information may be transferred to, stored, and processed in these and other countries where our service providers operate. We use appropriate safeguards such as standard contractual clauses where required.",
  },
  {
    id: "security",
    heading: "9. Security",
    body: "We use reasonable technical and organisational measures to protect personal information against unauthorised access, disclosure, alteration, and destruction. No transmission or storage system is fully secure, and we cannot guarantee absolute security.",
  },
  {
    id: "changes",
    heading: "10. Changes to This Policy",
    body: "We may update this Policy from time to time. Material changes will be reflected on this page along with an updated effective date. Continued use of the website after changes constitutes acceptance of the revised Policy.",
  },
  {
    id: "contact",
    heading: "11. Contact",
    body: `For privacy questions or to exercise your rights, contact us at ${siteConfig.email}.`,
  },
];

const tocItems = sections.map((s) => ({
  id: s.id,
  label: s.heading.replace(/^\d+\.\s*/, ""),
}));

export default function PrivacyPage() {
  return (
    <>
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-6xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl md:text-6xl text-white font-medium leading-tight">
            Your data, our duty.{" "}
            <span className="font-serif italic text-[#e9af88] md:block">Handled with care.</span>
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
