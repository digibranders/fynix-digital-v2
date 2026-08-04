import Image from "next/image";
import { clients } from "@/lib/content";
import Reveal from "./Reveal";

export default function TrustedBy() {
  return (
    <section
      aria-labelledby="trusted-by-heading"
      className="pt-16 md:pt-20 pb-16 md:pb-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="pb-8 mb-12 md:mb-16">
            <h2
              id="trusted-by-heading"
              className="font-serif text-3xl md:text-5xl text-primary font-medium leading-tight"
            >
              Trusted by <span className="font-serif italic font-medium">Growing Businesses</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-text-muted font-normal leading-relaxed">
              From startups to established enterprises, businesses trust Fynix Digital
              <br />
              to strengthen their digital presence and accelerate sustainable growth.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <ul
            aria-label="Client logos"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-10 md:gap-y-14 items-center justify-items-center"
          >
            {clients.map((client) => (
              <li
                key={client.name}
                title={client.name}
                className="flex items-center justify-center w-full h-11 md:h-12"
              >
                <Image
                  src={client.logo}
                  alt={`${client.name} logo`}
                  width={160}
                  height={48}
                  // Logos have varying intrinsic ratios; `object-contain` + `w/h-auto`
                  // preserves each one within the box. Both max constraints are kept
                  // strictly below the width/height props (max-w 150 < 160, max-h 44 < 48)
                  // so a rendered dimension can never equal its attribute — which is
                  // exactly what next/image's aspect-ratio dev warning checks for.
                  className="max-h-10 md:max-h-11 max-w-[130px] md:max-w-[150px] w-auto h-auto object-contain"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
