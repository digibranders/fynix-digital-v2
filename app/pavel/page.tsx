import type { Metadata } from "next";
import "./pavel.css";
import { Navbar } from "@/components/pavel/sections/Navbar";
import { Hero } from "@/components/pavel/sections/Hero";
import { Instructor } from "@/components/pavel/sections/Instructor";
import { Testimonials } from "@/components/pavel/sections/Testimonials";
import { Problem } from "@/components/pavel/sections/Problem";
import { Shift } from "@/components/pavel/sections/Shift";
import { Curriculum } from "@/components/pavel/sections/Curriculum";
import { Audience } from "@/components/pavel/sections/Audience";
import { Deliverables } from "@/components/pavel/sections/Deliverables";
import { Pricing } from "@/components/pavel/sections/Pricing";
import { FAQ } from "@/components/pavel/sections/FAQ";
import { FinalCTA } from "@/components/pavel/sections/FinalCTA";
import { Footer } from "@/components/pavel/sections/Footer";

export const metadata: Metadata = {
  title:
    "Semantic SEO Workshop with Pavel Klimakov. Stop Guessing What Google Wants.",
  description:
    "A 3-hour live workshop on the Semantic SEO framework. Learn how Google actually evaluates content, build topical authority, and rank without out-spending competitors on links. $79. 100 seats. Live on Zoom.",
  openGraph: {
    title: "Semantic SEO Workshop with Pavel Klimakov",
    description:
      "The system that engineers relevance. A 3-hour live intensive on entities, topical authority, and reading Google the way it reads the web.",
    type: "website",
  },
};

export default function PavelWorkshopPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE3] text-[#0F0E0C] tnum">
      <Navbar />
      <Hero />
      <Problem />
      <Instructor />
      <Testimonials />
      <Shift />
      <Curriculum />
      <Audience />
      <Deliverables />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
