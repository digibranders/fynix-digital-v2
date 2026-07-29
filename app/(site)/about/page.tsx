import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionSeam from "@/components/SectionSeam";
import PreFooterBackdrop from "@/components/PreFooterBackdrop";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import { actAccents } from "@/components/ActsStack";
import { siteConfig } from "@/lib/content";

// The four pillar hues from the services "act stack", reused here as a restrained
// editorial accent system — applied sparingly (a whisper in the hero, the four
// "why" cards, and the values numerals) rather than in every section.
type Accent = { from: string; to: string; ink: string };
const actColors: Accent[] = [
  actAccents["ui-ux"], // gold
  actAccents.development, // sage
  actAccents.seo, // rose
  actAccents["lead-generation"], // violet
];

// Decorative numeral colour: keep each pillar's hue but deepen it toward its
// ink so it stays legible on the light backgrounds.
function numeralColor(c: Accent): string {
  return `color-mix(in srgb, ${c.from} 74%, ${c.ink})`;
}

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Fynix Digital partners with ambitious B2B companies to build stronger digital brands, attract the right customers, and create sustainable growth through strategy, technology, and creativity.",
  alternates: { canonical: "/about" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteConfig.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "About Us",
      item: `${siteConfig.url}/about`,
    },
  ],
};

// Prose kept as string constants so JSX stays free of unescaped-entity issues.
const heroLead1 =
  "Fynix Digital was built on one belief: businesses need clarity, not digital noise. We help B2B brands grow through strategy, technology, and exceptional experiences.";

const story = [
  "Digital marketing has changed dramatically, yet many businesses still struggle to turn digital investment into measurable outcomes.",
  "We started Fynix Digital to change that, helping businesses build a digital foundation that creates long-term competitive advantage.",
];
const storyQuestion = "How can we help this business grow?";

const whyIntro =
  "Every recommendation, campaign, design, and technology decision is aligned with one objective: helping your business grow.";

const whyChoose: { title: string; body: string }[] = [
  {
    title: "Business First",
    body: "Every strategy begins with your business goals, not marketing trends.",
  },
  {
    title: "Data Driven",
    body: "We combine market insights, analytics, and AI to make smarter decisions.",
  },
  {
    title: "Growth Focused",
    body: "Every initiative is designed to generate measurable business impact.",
  },
  {
    title: "Long-Term Partnership",
    body: "We become an extension of your team, committed to your long-term success.",
  },
];

const founders: {
  name: string;
  role: string;
  initials: string;
  accent: Accent;
  photo?: string;
  quote: string;
}[] = [
  {
    name: "Siddique",
    role: "Co-Founder",
    initials: "S",
    accent: actColors[0], // gold
    photo: "/siddique.webp",
    quote:
      "Digital strategy isn't about following short-term trends — it's about building unfair competitive advantages that compound over years.",
  },
  {
    name: "Savita Katiyar",
    role: "Co-Founder",
    initials: "SK",
    accent: actColors[2], // rose
    photo: "/savita-katiyar-2.webp",
    quote:
      "Every design and technical choice must serve a single goal: creating meaningful, measurable business clarity.",
  },
];

const values: { numeral: string; title: string; body: string }[] = [
  {
    numeral: "I",
    title: "Business First",
    body: "We always prioritize business outcomes over marketing activities.",
  },
  {
    numeral: "II",
    title: "Curiosity",
    body: "We ask better questions before offering solutions.",
  },
  {
    numeral: "III",
    title: "Simplicity",
    body: "Complex challenges deserve clear, practical solutions.",
  },
  {
    numeral: "IV",
    title: "Transparency",
    body: "We communicate openly, honestly, and without unnecessary jargon.",
  },
  {
    numeral: "V",
    title: "Continuous Improvement",
    body: "Digital never stands still, and neither do we.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-20 md:min-h-[491px] bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[64px] text-white font-medium leading-tight tracking-tight max-w-4xl text-balance">
            Building Digital{" "}
            <span className="font-serif italic text-[#e9af88] md:block">
              Growth That Lasts
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg font-normal leading-relaxed mt-8 max-w-2xl">
            {heroLead1}
          </p>
          {/* <p className="text-white/70 text-base md:text-lg font-normal leading-relaxed mt-5 max-w-2xl">
            {heroLead2}
          </p> */}
        </div>
      </section>

      {/* ─── OUR STORY ────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium leading-[1.1] tracking-tight">
                Every great partnership starts with understanding.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-7" delay={120}>
              {story.map((p, i) => (
                <p
                  key={i}
                  className={`text-base md:text-lg text-text-muted font-normal leading-relaxed ${
                    i === 0 ? "" : "mt-5"
                  }`}
                >
                  {p}
                </p>
              ))}
              <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-5">
                Every strategy we develop begins with one question:{" "}
                <strong className="font-medium text-primary">{storyQuestion}</strong>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* ─── WHY BUSINESSES CHOOSE FYNIX ──────────────────────── */}
      <section className="py-16 md:py-20 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-2xl mb-14 md:mb-16">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium leading-[1.1] tracking-tight">
              Why businesses choose Fynix Digital.
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {whyIntro}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
            {whyChoose.map((item, idx) => {
              const c = actColors[idx];
              return (
                <Reveal key={item.title} delay={idx * 100} className="h-full">
                  <div className="relative h-full pt-8 flex flex-col">
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-[3px] w-full rounded-full"
                      style={{ background: `linear-gradient(to right, ${c.from}, ${c.to})` }}
                    />
                    <span
                      aria-hidden
                      className="font-mono text-xs font-semibold tabular-nums"
                      style={{ color: numeralColor(c) }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-serif text-2xl text-primary font-medium mt-4 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[15px] text-text-muted font-normal leading-relaxed mt-4 flex-1">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* ─── FOUNDERS ─────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-2xl mb-14 md:mb-16">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium leading-[1.1] tracking-tight">
              The people behind Fynix Digital.
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              Two founders, one commitment: turning digital investment into
              growth that lasts.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 max-w-3xl">
            {founders.map((f, idx) => (
              <Reveal key={f.name} delay={idx * 120}>
                <figure className="group">
                  {/* Portrait — real headshot when a photo is set, else a monogram placeholder. */}
                  <div
                    className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(15,14,12,0.06),0_24px_50px_-24px_rgba(15,14,12,0.28)]"
                    style={
                      f.photo
                        ? undefined
                        : {
                            background: `linear-gradient(150deg, #0C1E2E 0%, color-mix(in srgb, ${f.accent.from} 55%, #0C1E2E) 100%)`,
                          }
                    }
                  >
                    {f.photo ? (
                      <Image
                        src={f.photo}
                        alt={f.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <>
                        <span
                          aria-hidden
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.16), transparent 58%)",
                          }}
                        />
                        <span
                          aria-hidden
                          className="absolute inset-0 flex items-center justify-center font-serif text-white/90 text-6xl md:text-7xl tracking-tight select-none"
                        >
                          {f.initials}
                        </span>
                      </>
                    )}
                    <span
                      aria-hidden
                      className="absolute left-0 bottom-0 h-[3px] w-full"
                      style={{
                        background: `linear-gradient(to right, ${f.accent.from}, ${f.accent.to})`,
                      }}
                    />
                  </div>
                  <figcaption className="mt-6">
                    <h3 className="font-serif text-2xl text-primary font-medium leading-snug">
                      {f.name}
                    </h3>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.12em] mt-2"
                      style={{ color: numeralColor(f.accent) }}
                    >
                      {f.role}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionSeam from="white" to="soft" />

      {/* ─── OUR VALUES ───────────────────────────────────────── */}
      <section className="pt-16 md:pt-20 pb-12 md:pb-16 bg-background-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="max-w-2xl mb-14 md:mb-16">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium leading-[1.1] tracking-tight">
              The principles that guide every decision.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {values.map((v, idx) => {
              const c = actColors[idx % actColors.length];
              return (
                <Reveal key={v.title} delay={idx * 90} className="h-full">
                  <div className="h-full pt-8 border-t border-primary/70 flex flex-col">
                    <span
                      aria-hidden
                      className="font-serif italic text-4xl leading-none block"
                      style={{ color: numeralColor(c) }}
                    >
                      {v.numeral}.
                    </span>
                    <h3 className="font-serif text-2xl text-primary font-medium mt-5 leading-snug">
                      {v.title}
                    </h3>
                    <p className="text-[15px] text-text-muted font-normal leading-relaxed mt-4 flex-1">
                      {v.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionSeam from="soft" to="white" />

      {/* ─── CLOSING CTA ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-12 md:pt-16 pb-24 md:pb-32 bg-transparent">
        <PreFooterBackdrop />
        <div className="relative max-w-4xl mx-auto px-6 md:px-12 text-center">
          <Reveal>
            <h2 className="font-serif italic text-4xl md:text-6xl text-primary font-medium leading-[1.05] tracking-tight">
              Let&apos;s build something that creates lasting growth.
            </h2>
          </Reveal>

          <Reveal variant="up" delay={160} className="mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 cta-glide cta-reveal-gradient bg-primary text-white hover:text-[#0C1E2E] font-medium rounded-full shadow-sm"
              >
                Book a Strategy Call
                <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
