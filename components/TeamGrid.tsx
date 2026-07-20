import { team } from "@/lib/content";
import Reveal from "./Reveal";

export default function TeamGrid() {
  return (
    <section
      aria-labelledby="team-heading"
      className="pt-16 md:pt-20 pb-16 md:pb-20 bg-background-soft"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
              Your growth pod
            </span>
            <h2
              id="team-heading"
              className="font-serif text-4xl md:text-5xl text-primary font-normal mt-3 leading-tight"
            >
              A small, senior team owns the outcome end to end.
            </h2>
            <p className="text-text-muted text-base font-light leading-relaxed mt-4">
              You work directly with the people doing the work. No junior handoffs, no account
              layer between you and the decisions.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <Reveal key={member.name} delay={idx * 90}>
              <article className="h-full bg-white border border-border rounded-lg p-6 flex flex-col">
                <div
                  aria-hidden
                  className="h-14 w-14 rounded-full bg-primary text-white font-serif text-lg flex items-center justify-center"
                >
                  {member.initials}
                </div>

                <h3 className="font-serif text-xl text-primary font-medium mt-6">{member.name}</h3>
                <span className="text-xs font-mono text-accent uppercase tracking-widest mt-2">
                  {member.role}
                </span>
                <p className="text-sm text-text-muted font-light leading-relaxed mt-4">
                  {member.focus}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
