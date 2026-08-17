import type { Metadata } from "next";
import Script from "next/script";
import { Figtree, Cormorant } from "next/font/google";
import { siteConfig, isProductionSite } from "@/lib/content";
import "./globals.css";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-T5W9T5VF";


const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic"],
  display: "swap",
});

// Shared gate — see isProductionSite() in lib/content.ts. Keeps this <meta robots>
// tag and robots.txt in lock-step so production is never accidentally de-indexed.
const isProductionDomain = isProductionSite();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | A digital marketing studio for Growing Brands`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  robots: isProductionDomain
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
  openGraph: {
    type: "website",
    title: `${siteConfig.name} | A digital marketing studio for Growing Brands`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image.jpg`,
        width: 1200,
        height: 800,
        alt: "Fynix Digital - Digital marketing that helps brands grow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | A digital marketing studio for Growing Brands`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-image.jpg`],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/og-image.jpg`,
  image: `${siteConfig.url}/og-image.jpg`,
  description: siteConfig.description,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.line1,
    addressLocality: "Thane West",
    addressRegion: "Maharashtra",
    postalCode: "400607",
    addressCountry: "IN",
  },
  sameAs: [
    "https://www.instagram.com/fynix_digital/",
    "https://in.linkedin.com/company/fynixofficial",
  ],
  knowsAbout: [
    "Cybersecurity Growth",
    "UI/UX Design",
    "Web Development",
    "Technical SEO",
    "Answer Engine Optimisation",
    "B2B Lead Generation",
  ],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  url: siteConfig.url,
  name: siteConfig.name,
  description: siteConfig.description,
  publisher: {
    "@id": `${siteConfig.url}/#organization`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        {gtmId && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd),
          }}
        />
        {/* Suppress unhandled promise rejections injected by browser extensions (e.g. MetaMask inpage.js) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('unhandledrejection', function(event) {
                  var reason = event.reason;
                  var reasonStr = reason ? String(reason.message || reason.stack || reason) : '';
                  if (
                    reasonStr.includes('MetaMask') ||
                    reasonStr.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                    (reason && reason.stack && reason.stack.includes('chrome-extension://'))
                  ) {
                    event.preventDefault();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}

