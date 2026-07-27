"use client";

import React from "react";
import { Container } from "../ui/Container";

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0F0E0C] text-[#C9C0A6] py-14">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#2A2620]">
          <div className="md:col-span-6 space-y-3">
            <p className="font-serif text-[22px] font-semibold text-[#F4EFE3]">
              Pavel Klimakov
            </p>
            <p className="font-serif italic font-normal text-[14px] text-[#8B857A] max-w-[380px] leading-[1.6]">
              Semantic SEO, taught from the machinery of search itself.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="font-serif italic font-normal text-[13px] text-[#8B857A]">
              Workshop
            </p>
            <ul className="space-y-2 text-[14px]">
              <li>
                <button
                  onClick={() => scrollTo("curriculum")}
                  className="text-[#C9C0A6] hover:text-[#F4EFE3] transition-colors"
                >
                  Curriculum
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("instructor")}
                  className="text-[#C9C0A6] hover:text-[#F4EFE3] transition-colors"
                >
                  Instructor
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("pricing")}
                  className="text-[#C9C0A6] hover:text-[#F4EFE3] transition-colors"
                >
                  Reserve a seat
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("faq")}
                  className="text-[#C9C0A6] hover:text-[#F4EFE3] transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="font-serif italic font-normal text-[13px] text-[#8B857A]">
              Contact
            </p>
            <a
              href="mailto:hello@pavelklimakov.com"
              className="block text-[14px] text-[#F4EFE3] hover:underline underline-offset-4"
            >
              hello@pavelklimakov.com
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12.5px] italic font-normal text-[#6B6659]">
          <p>&copy; {new Date().getFullYear()} Pavel Klimakov. All rights reserved.</p>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="hover:text-[#C9C0A6] transition-colors"
            >
              Privacy
            </a>
            <a href="/terms" className="hover:text-[#C9C0A6] transition-colors">
              Terms
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
