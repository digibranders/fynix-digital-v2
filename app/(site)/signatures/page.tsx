import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

type Signature = {
  name: string;
  filename: string;
  role: string;
};

// Internal roster for the signature tool. Not derived from lib/content's
// public team copy — this is the full team's real contact signatures, kept
// separate from the marketing "team" section on /about.
const signatures: Signature[] = [
  { name: "Dr. Savita Katiyar", filename: "dr-savita-katiyar.html", role: "Co-founder & COO" },
  { name: "Siddique Ahmed", filename: "siddique-ahmed.html", role: "Co-founder & CEO" },
  { name: "Satyam Yadav", filename: "satyam-yadav.html", role: "Creative Head" },
  { name: "Gaurav Jadhav", filename: "gaurav-jadhav.html", role: "AI Engineer" },
  { name: "Pranita Kadav", filename: "pranita-kadav.html", role: "Senior SEO Executive" },
  { name: "Nitesh Alim", filename: "nitesh-alim.html", role: "Graphic Designer" },
  { name: "Anushka Tiwari", filename: "anushka-tiwari.html", role: "Client Relationship Executive" },
  { name: "Farheen Khan", filename: "farheen-khan.html", role: "Web Developer" },
  { name: "Mayur Bate", filename: "mayu-bate.html", role: "UI/UX Designer" },
  { name: "Appurva Panchabhai", filename: "appurva-panchabhai.html", role: "Content Strategist" },
  { name: "Steve Nadar", filename: "steve.html", role: "Software Engineer" },
  { name: "Firdous Shaikh", filename: "firdous-shaikh.html", role: "SEO Analyst" },
];

export default function SignaturesPage() {
  return (
    <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-background-soft">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
              Email Signatures
            </h1>
            <p className="text-text-muted text-base font-normal leading-relaxed mt-4">
              Click your name to open your official Fynix Digital email signature, then copy it
              straight into your email client&apos;s signature settings.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {signatures.map((sig, idx) => (
            <Reveal key={sig.filename} delay={idx * 60}>
              <Link
                href={`/signatures/${sig.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between h-full bg-white border border-border rounded-lg p-6 transition-colors hover:border-accent/60"
              >
                <div>
                  <h2 className="font-serif text-xl text-primary font-medium">{sig.name}</h2>
                  <span className="text-xs font-mono text-accent uppercase tracking-widest mt-2 block">
                    {sig.role}
                  </span>
                </div>
                <ArrowRight
                  aria-hidden
                  className="w-5 h-5 text-text-muted shrink-0 ml-4 transition-transform group-hover:translate-x-1 group-hover:text-accent"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
