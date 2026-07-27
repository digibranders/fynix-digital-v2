import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-accent text-white font-mono text-xs rounded-md shadow-lg transition-all"
      >
        Skip to main content
      </a>
      <SmoothScroll>
        <AnnouncementBanner />
        <Header />
        <main id="main" className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
