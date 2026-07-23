import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex-1 flex items-center justify-center py-24 md:py-32 bg-background-soft">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-primary font-medium leading-tight">
          This page has moved on.
        </h1>
        <p className="text-text-muted text-base font-normal leading-relaxed mt-6">
          The page you&apos;re looking for isn&apos;t here. Head back to the homepage or explore our
          services.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200"
          >
            Return home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center px-8 py-4 text-primary hover:text-accent font-medium rounded-full border border-border bg-white hover:bg-background-soft cta-secondary transition-all duration-200"
          >
            View services
          </Link>
        </div>
      </div>
    </section>
  );
}
