import Image from "next/image";
import { clients } from "@/lib/content";
import Reveal from "./Reveal";

export default function TrustedBy() {
  return (
    <section
      aria-labelledby="trusted-by-heading"
      className="pt-20 md:pt-28 pb-16 md:pb-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="border-b border-border pb-8 mb-12 md:mb-16">
            <h2
              id="trusted-by-heading"
              className="font-serif text-3xl md:text-5xl text-primary font-medium leading-tight"
            >
              Trusted by Global Brands
            </h2>
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
                className="flex items-center justify-center w-full"
              >
                <Image
                  src={client.logo}
                  alt={`${client.name} logo`}
                  width={160}
                  height={40}
                  className="max-h-8 md:max-h-10 max-w-[140px] md:max-w-[160px] w-auto h-auto object-contain"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
