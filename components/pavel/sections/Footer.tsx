"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Container } from "../ui/Container";

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
              <li>
                <button
                  onClick={() => scrollTo("curriculum")}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Curriculum
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("instructor")}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Instructor
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("pricing")}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Reserve a seat
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("faq")}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="font-serif italic font-normal text-[13px] text-text-muted">
              Contact
            </p>
            <a
              href="mailto:hello@pavelklimakov.com"
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
