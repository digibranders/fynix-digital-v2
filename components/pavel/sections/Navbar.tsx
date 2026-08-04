"use client";

import React, { useState, useEffect } from "react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRight, Menu, X } from "lucide-react";
import { usePricing } from "../PricingProvider";

const NAV_ITEMS = [
  { id: "problem", label: "The Problem" },
  { id: "curriculum", label: "Curriculum" },
  { id: "instructor", label: "Instructor" },
  { id: "faq", label: "FAQ" },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { price } = usePricing();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background-soft/92 backdrop-blur-[8px] border-b border-border"
          : "bg-background-soft/85 backdrop-blur-[6px] border-b border-border/60"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-[44px] md:h-[68px]">
          <button
            onClick={() => scrollTo("hero")}
            className="text-[22px] font-semibold tracking-[-0.015em] text-primary leading-none"
            aria-label="Pavel Klimakov"
          >
            Pavel Klimakov
          </button>

          <nav className="hidden md:flex items-center gap-9 text-[16px] font-normal text-text-muted">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="hover:text-primary transition-colors py-1 italic font-normal"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <Button size="md" variant="primary" onClick={() => scrollTo("pricing")}>
              Reserve seat, {price.display}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 text-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-5 pt-2 border-t border-border space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left py-2.5 text-[17px] italic font-normal text-primary"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3">
              <Button
                size="md"
                variant="primary"
                className="w-full"
                onClick={() => scrollTo("pricing")}
              >
                Reserve seat, {price.display}
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};
