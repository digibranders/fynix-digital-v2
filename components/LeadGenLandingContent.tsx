import Reveal from "@/components/Reveal";
import HeroDarkBackdrop from "@/components/HeroDarkBackdrop";
import HeroBookingCalendar from "@/components/HeroBookingCalendar";
import { actAccents } from "@/components/ActsStack";
import {
  AccentBadge,
  AccentDot,
  ServiceAccentBand,
} from "@/components/ServiceContentKit";
import {
  bandEyebrow,
  bandPoints,
  bandQuote,
  leadGenProcess,
  leadGenServices,
  servicesIntro,
} from "@/components/LeadGenServiceContent";

const accent = actAccents["lead-generation"];

const heroHeadline = "Sales-ready meetings,";
const heroHeadlineAccent = "on your calendar.";
const preFooterHeading = "Ready to Build Predictable Pipeline?";
const preFooterCopy = "Pick a time that suits you. We will walk through your buyers and where pipeline is leaking.";
const heroCopy =
  "We find the right buyers, start the conversation, and qualify every reply, so the only thing left for your team is showing up and closing.";

/**
 * Lead-generation landing page (`/lp/lead-generation`).
 *
 * A copy of the `/services/lead-generation` page with a new hero (copy plus a
 * booking calendar backed by Cal.com, no button) and without the FAQ and pre-footer
 * sections. It reuses that page's content constants so the two never drift.
 * The route is `noindex, nofollow` and absent from the sitemap.
 */
export default function LeadGenLandingContent() {
  return (
    <>
      {/* HERO */}
      <section
        data-nav-theme="dark"
        className="relative isolate overflow-hidden -mt-20 md:-mt-24 pt-32 md:pt-40 pb-14 md:pb-24 bg-primary text-white"
      >
        <HeroDarkBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-5">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-white font-medium tracking-tight leading-[1.08] text-balance">
                {heroHeadline}{" "}
                <span className="font-serif italic text-[#e9af88] md:block">
                  {heroHeadlineAccent}
                </span>
              </h1>
              <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mt-8 max-w-xl">
                {heroCopy}
              </p>
            </div>

            <div className="lg:col-span-7 flex justify-center lg:justify-end">
              <HeroBookingCalendar />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="lead-generation-services"
        className="py-16 md:py-20 bg-background-soft scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              End-to-End Demand and Pipeline Generation
            </h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mt-6">
              {servicesIntro}
            </p>
          </Reveal>

          <div className="space-y-6 md:space-y-8">
            {leadGenServices.map((svc, idx) => (
              <Reveal key={svc.name} delay={idx * 60}>
                <article className="group relative overflow-hidden rounded-lg border border-border bg-white p-8 md:p-12 hover:border-accent/40 transition-colors duration-300">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-full w-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to bottom, ${accent.from}, ${accent.to})` }}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-5">
                      <AccentBadge accent={accent} className="h-9 w-9 text-sm">
                        {String(idx + 1).padStart(2, "0")}
                      </AccentBadge>
                      <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-4">
                        {svc.name}
                      </h3>
                      <p className="font-serif italic text-lg text-primary/55 mt-2 leading-snug">
                        {svc.tagline}
                      </p>
                      <p className="text-text-muted text-base font-normal leading-relaxed mt-5">
                        {svc.description}
                      </p>
                    </div>

                    <div className="lg:col-span-7 lg:border-l lg:border-border lg:pl-12">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {svc.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2.5 text-sm text-primary/85 font-normal"
                          >
                            <AccentDot accent={accent} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ServiceAccentBand
        accent={accent}
        eyebrow={bandEyebrow}
        quote={bandQuote}
        points={bandPoints}
      />

      {/* PROCESS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mb-16 border-b border-border pb-8 max-w-3xl">
            <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium max-w-2xl leading-tight">
              A Systematic Path From Target to Booked Meeting
            </h2>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {leadGenProcess.map((phase, idx) => (
              <li key={phase.step} className="h-full">
                <Reveal
                  delay={idx * 80}
                  className="h-full p-6 border border-border rounded-lg bg-background-soft/40 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <AccentBadge accent={accent} className="h-8 w-8 text-xs">
                      {String(idx + 1).padStart(2, "0")}
                    </AccentBadge>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted font-semibold">
                      Step
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-primary font-medium mt-4">
                    {phase.step}
                  </h3>
                  <p className="text-sm text-text-muted font-normal mt-3 leading-relaxed">
                    {phase.text}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRE-FOOTER: a second booking calendar, navy card on white */}
      <section id="book-a-call" className="py-16 md:py-24 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-serif italic text-3xl md:text-5xl text-primary font-medium leading-tight">
              {preFooterHeading}
            </h2>
            <p className="mt-4 text-base md:text-lg text-text-muted font-normal leading-relaxed text-balance">
              {preFooterCopy}
            </p>
          </Reveal>
          <div className="flex justify-center">
            <HeroBookingCalendar variant="dark" />
          </div>
        </div>
      </section>
    </>
  );
}
