import { ReactNode } from "react";
import { frameworkSteps } from "@/lib/content";
import Reveal from "./Reveal";

const ICON_NAVY = "#102234";
const ICON_COPPER = "#D27B1F";

const stepIcons: Record<string, ReactNode> = {
  "01": (
    <svg className="w-9 h-9" viewBox="0 0 128 128" fill="none" aria-hidden="true">
      <circle cx="57" cy="57" r="37" stroke={ICON_NAVY} strokeWidth="3.2" />
      <path d="M84 84 L103 103" stroke={ICON_NAVY} strokeWidth="8" strokeLinecap="round" />
      <path d="M88 88 L104 104" stroke={ICON_COPPER} strokeWidth="5" strokeLinecap="round" />
      <path d="M43 43 H70" stroke={ICON_COPPER} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M43 57 H70" stroke={ICON_NAVY} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M43 71 H70" stroke={ICON_NAVY} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  ),
  "02": (
    <svg className="w-9 h-9" viewBox="0 0 128 128" fill="none" aria-hidden="true">
      <path d="M15 68 H46 L61 29 L78 107 L94 55 L106 76 H117" stroke={ICON_NAVY} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="119" cy="76" r="9" fill={ICON_COPPER} />
    </svg>
  ),
  "03": (
    <svg className="w-9 h-9" viewBox="0 0 128 128" fill="none" aria-hidden="true">
      <circle cx="64" cy="64" r="45" stroke="#939AA2" strokeWidth="3" strokeDasharray="3 7" strokeLinecap="round" />
      <circle cx="64" cy="64" r="20" fill="#E6A664" stroke={ICON_NAVY} strokeWidth="3.4" />
      <circle cx="64" cy="19" r="10" fill="#FCFBF9" stroke={ICON_NAVY} strokeWidth="3.5" />
      <circle cx="109" cy="64" r="10" fill="#FCFBF9" stroke={ICON_NAVY} strokeWidth="3.5" />
      <circle cx="64" cy="109" r="10" fill="#FCFBF9" stroke={ICON_NAVY} strokeWidth="3.5" />
      <circle cx="19" cy="64" r="10" fill="#FCFBF9" stroke={ICON_NAVY} strokeWidth="3.5" />
    </svg>
  ),
  "04": (
    <svg className="w-9 h-9" viewBox="0 0 128 128" fill="none" aria-hidden="true">
      <rect x="23" y="82" width="18" height="22" rx="1.5" stroke={ICON_NAVY} strokeWidth="3.5" />
      <rect x="54" y="63" width="18" height="41" rx="1.5" stroke={ICON_NAVY} strokeWidth="3.5" />
      <rect x="85" y="39" width="18" height="65" rx="1.5" stroke={ICON_NAVY} strokeWidth="3.5" />
      <path d="M22 58 C48 55 74 39 104 9" stroke={ICON_COPPER} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M85 11 L105 8 L102 28" stroke={ICON_COPPER} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function GrowthFramework() {
  return (
    <section
      id="growth-framework"
      aria-labelledby="framework-heading"
      className="pt-8 md:pt-12 pb-16 md:pb-20 bg-background-soft relative isolate overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
          <div className="max-w-3xl">
            <Reveal>
              <h2
                id="framework-heading"
                className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary font-medium tracking-tight leading-[1.12]"
              >
                A Proven <span className="font-serif italic font-medium">Framework</span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-4 text-base md:text-lg text-text-muted font-normal leading-relaxed">
                A structured four-phase approach engineered to understand your market, build a tailored roadmap, execute with precision, and scale performance.
              </p>
            </Reveal>
          </div>
        </div>

        {/* 4-Step Grid */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[155px] left-[10%] right-[10%] h-[1.5px] bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 z-0 pointer-events-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 relative z-10">
            {frameworkSteps.map((step, idx) => {
              const icon = stepIcons[step.num];
              const hasOutgoing = idx < frameworkSteps.length - 1;

              return (
                <Reveal key={step.num} delay={idx * 100} variant="up">
                  <div className="group/step relative h-full">
                  <div className="group relative h-full bg-white rounded-2xl p-7 md:p-8 border border-border/80 shadow-xs hover:shadow-xl hover:border-accent/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* Step Header: Icon & Step Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-background-soft group-hover:bg-accent/10 flex items-center justify-center transition-all duration-300 border border-border/60 group-hover:border-accent/30 shadow-2xs">
                          {icon}
                        </div>
                      </div>

                      {/* Step Number Watermark & Title */}
                      <div className="relative">
                        <span
                          aria-hidden="true"
                          className="font-mono text-4xl md:text-5xl font-bold text-primary/10 group-hover:text-accent/20 transition-colors duration-300 select-none block mb-1"
                        >
                          {step.num}
                        </span>
                        <h3 className="font-serif text-2xl md:text-[26px] text-primary font-medium leading-tight">
                          {step.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-sm md:text-[15px] text-text-muted font-normal leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Subtle bottom divider — desktop only. */}
                    <div className="mt-8 pt-4 border-t border-border/40 hidden lg:block" />
                  </div>

                  {/* Outgoing connector — draws from this card toward the next on hover (no glow) */}
                  {hasOutgoing && (
                    <span
                      aria-hidden="true"
                      className="hidden lg:block pointer-events-none absolute top-[155px] left-full w-6 xl:w-8 z-20"
                    >
                      <span className="absolute inset-x-0 top-0 h-[1.5px] rounded-full bg-accent origin-left scale-x-0 group-hover/step:scale-x-100 transition-transform duration-500 ease-out" />
                    </span>
                  )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
