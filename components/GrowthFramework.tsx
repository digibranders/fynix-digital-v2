"use client";

import { ReactNode } from "react";
import { frameworkSteps } from "@/lib/content";
import Reveal from "./Reveal";

const stepIcons: Record<string, ReactNode> = {
  "01": (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <circle cx="11" cy="11" r="3" />
    </svg>
  ),
  "02": (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12h5l2-6 4 12 2-6h7" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  "03": (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  "04": (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  ),
};

export default function GrowthFramework() {
  return (
    <section
      id="growth-framework"
      aria-labelledby="framework-heading"
      className="pt-8 md:pt-12 pb-20 md:pb-28 bg-background-soft relative isolate overflow-hidden"
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
                A Proven Framework
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

              return (
                <Reveal key={step.num} delay={idx * 100} variant="up">
                  <div className="group relative h-full bg-white rounded-2xl p-7 md:p-8 border border-border/80 shadow-xs hover:shadow-xl hover:border-accent/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* Step Header: Icon & Step Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-background-soft group-hover:bg-accent/10 text-primary group-hover:text-accent flex items-center justify-center transition-all duration-300 border border-border/60 group-hover:border-accent/30 shadow-2xs">
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

                    {/* Subtle bottom indicator */}
                    <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-mono text-text-muted/60 group-hover:text-accent transition-colors">
                      <svg
                        className="w-4 h-4 transform -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
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
