import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/content";
import Logo from "@/components/Logo";

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
];

const serviceLinks = [
  { href: "/services/ui-ux", label: "UI/UX" },
  { href: "/services/development", label: "Development" },
  { href: "/services/seo", label: "SEO / AEO" },
  { href: "/services/lead-generation", label: "Lead Generation" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/fynix_digital/",
    label: "Instagram",
    hoverClass:
      "hover:text-[#E4405F] hover:border-[#E4405F]/60 hover:bg-[#E4405F]/10",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://in.linkedin.com/company/fynixofficial",
    label: "LinkedIn",
    hoverClass:
      "hover:text-[#0A66C2] hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.978 0 1.778-.773 1.778-1.729V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: `mailto:${siteConfig.email}`,
    label: "Email",
    hoverClass:
      "hover:text-accent hover:border-accent/60 hover:bg-accent/10",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
];

type LinkGroup = {
  title: string;
  items: { href: string; label: string }[];
};

const groups: LinkGroup[] = [
  { title: "Site", items: siteLinks },
  { title: "Services", items: serviceLinks },
  { title: "Company", items: companyLinks },
  { title: "Legal", items: legalLinks },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-primary text-white overflow-hidden mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-20 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 flex flex-col">
            <Logo className="text-white" />
            <div className="mt-auto pt-6 flex items-center gap-2">
              {socialLinks.map((s) => {
                const external = s.href.startsWith("http");
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={`h-9 w-9 flex items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors duration-200 ${s.hoverClass}`}
                  >
                    {s.icon}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link groups */}
          {groups.map((group) => (
            <nav
              key={group.title}
              aria-label={group.title}
              className="col-span-1 md:col-span-2"
            >
              <h4 className="text-sm font-semibold text-white mb-5">
                {group.title}
              </h4>
              <ul className="space-y-3 text-sm text-white/60">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Divider + copyright */}
        <div className="mt-16 md:mt-20 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <span>&copy; {year} Fynix Digital · All rights reserved</span>
          {/* <span>
            {siteConfig.email} · {siteConfig.locations}
          </span> */}
        </div>
      </div>

      {/* Ghost brand wordmark */}
      <div
        aria-hidden
        className="relative select-none pointer-events-none overflow-hidden bg-primary h-[23vw]"
      >
        <Image
          src="/new_footer.webp"
          alt=""
          width={1200}
          height={800}
          sizes="100vw"
          priority
          fetchPriority="high"
          className="absolute inset-x-0 top-1/2 -translate-y-[47%] w-full h-auto opacity-40 invert"
        />
      </div>
    </footer>
  );
}
