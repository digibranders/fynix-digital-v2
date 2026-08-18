"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "../ui/Container";

/** Landing-page sections the footer points at, in on-page order. */
const WORKSHOP_LINKS = [
  { id: "curriculum", label: "Curriculum" },
  { id: "instructor", label: "Instructor" },
  { id: "pricing", label: "Reserve a seat" },
  { id: "faq", label: "FAQ" },
];

/**
 * A footer link to a section of the landing page.
 *
 * The footer is shared with routes that have none of those sections, so the
 * link is a real anchor to `/pavel#id` and only intercepts the click when the
 * section is present on the current page. That keeps the smooth scroll on the
 * landing page while making the same link navigate everywhere else, rather than
 * silently doing nothing as a scroll-only button did.
 */
const SectionLink: React.FC<{ id: string; label: string }> = ({ id, label }) => (
  <Link
    href={`/pavel#${id}`}
    onClick={(event) => {
      const el = document.getElementById(id);
      if (!el) return;
      event.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }}
    className="text-white/60 hover:text-white transition-colors"
  >
    {label}
  </Link>
);

export const Footer: React.FC = () => {

  return (
    <footer className="bg-primary text-white/60 py-14">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 pv-seam-bd">
          <div className="md:col-span-6 space-y-3">
            <p className="font-serif text-[22px] font-semibold text-white">
              Pavel Klimakov
            </p>
            <p className="font-serif italic font-normal text-[14px] text-text-muted max-w-[380px] leading-[1.6]">
              Semantic SEO, taught from the machinery of search itself.
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-white transition-colors"
            >
              A Fynix Digital workshop
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="font-serif italic font-normal text-[13px] text-text-muted">
              Workshop
            </p>
            <ul className="space-y-2 text-[14px]">
              {WORKSHOP_LINKS.map((link) => (
                <li key={link.id}>
                  <SectionLink id={link.id} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="font-serif italic font-normal text-[13px] text-text-muted">
              Contact
            </p>
            <a
              href="mailto:hello@fynix.digital"
              className="block text-[14px] text-white hover:underline underline-offset-4"
            >
              hello@fynix.digital
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12.5px] italic font-normal text-text-muted">
          <p>&copy; {new Date().getFullYear()} Pavel Klimakov. All rights reserved.</p>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="hover:text-white/60 transition-colors"
            >
              Privacy
            </a>
            <a href="/terms" className="hover:text-white/60 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
