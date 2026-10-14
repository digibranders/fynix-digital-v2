import Image from "next/image";
import type { ReactElement, ReactNode } from "react";

/**
 * The icons beside each row of the plan table, taken from Firstfold's plan table (/plans): a product's own mark in its own
 * colours where the row is that product, and a 24px line icon (1.5 stroke, round caps) where it is a service.
 */
export type PlanIconKey =
  | "hosting"
  | "code"
  | "website"
  | "chatbot"
  | "calendar"
  | "google-business"
  | "facebook"
  | "instagram"
  | "google-ads"
  | "meta-ads"
  | "target"
  | "reporting"
  | "marketing";

interface GlyphProps {
  readonly className?: string;
}

function Line({ className, children }: GlyphProps & { readonly children: ReactNode }): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function Brand({ className, children }: GlyphProps & { readonly children: ReactNode }): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}>
      {children}
    </svg>
  );
}

/** The Next.js icon: a black disc with a white N whose diagonal fades out. */
function NextjsMark({ className }: GlyphProps): ReactElement {
  return (
    <svg viewBox="0 0 180 180" aria-hidden focusable="false" className={className}>
      <defs>
        <linearGradient id="fbw-nextjs-diagonal" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fbw-nextjs-stem" x1="121" y1="54" x2="120.8" y2="106.9" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r="87" fill="#000" stroke="#fff" strokeWidth="6" />
      <path d="M149.5 157.5 69.1 54H54v72h12.1V69.4L140 164.8a90 90 0 0 0 9.5-7.3Z" fill="url(#fbw-nextjs-diagonal)" />
      <rect x="115" y="54" width="12" height="72" fill="url(#fbw-nextjs-stem)" />
    </svg>
  );
}

/** Meta's infinity mark, in Meta's blue, for the one row that covers both Facebook and Instagram. */
function MetaMark({ className }: GlyphProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}>
      <path
        d="M6.2 16c-2 0-3.2-1.7-3.2-4s1.6-4.5 3.6-4.5c3.6 0 7 9 11 9 1.8 0 3.2-1.6 3.2-4.5s-1.4-4.5-3.2-4.5c-4 0-7.4 9-11 9Z"
        fill="none"
        stroke="#0866FF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const GLYPHS: Readonly<Record<PlanIconKey, { readonly brand: boolean; readonly draw: (props: GlyphProps) => ReactElement }>> = {
  hosting: {
    brand: false,
    draw: ({ className }) => (
      <Line className={className}>
        <ellipse cx="12" cy="6" rx="7" ry="2.75" />
        <path d="M5 6v6c0 1.5 3.1 2.75 7 2.75S19 13.5 19 12V6M5 12v6c0 1.5 3.1 2.75 7 2.75S19 19.5 19 18v-6" />
      </Line>
    ),
  },
  code: { brand: true, draw: NextjsMark },
  website: {
    brand: false,
    draw: ({ className }) => (
      <Line className={className}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.8 3.3 2.8 13.7 0 17M12 3.5c-2.8 3.3-2.8 13.7 0 17" />
      </Line>
    ),
  },
  chatbot: {
    brand: true,
    draw: ({ className }) => <Image src="/free-business-website/oyechats-c.png" alt="" width={512} height={512} className={className} />,
  },
  calendar: {
    brand: false,
    draw: ({ className }) => (
      <Line className={className}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
        <path d="M3.5 9.5h17M8 3v4M16 3v4M8 13.5h2M14 13.5h2M8 17h2" />
      </Line>
    ),
  },
  "google-business": {
    brand: true,
    draw: ({ className }) => (
      <Brand className={className}>
        <path d="M3 9.5 4.6 4h14.8L21 9.5H3Z" fill="#4285F4" />
        <path d="M3 9.5c0 1.5 1.2 2.7 2.7 2.7S8.4 11 8.4 9.5H3Z" fill="#EA4335" />
        <path d="M8.4 9.5c0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7H8.4Z" fill="#FBBC04" />
        <path d="M13.8 9.5c0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7h-5.4Z" fill="#34A853" />
        <path d="M18.9 9.5c0 1.5 1 2.7 2.1 2.7V9.5h-2.1Z" fill="#EA4335" />
        <path d="M4.5 12.5V20h15v-7.5" fill="none" stroke="#5F6368" strokeWidth="1.7" strokeLinejoin="round" />
        <rect x="9.5" y="14.5" width="5" height="5.5" rx=".6" fill="#34A853" />
      </Brand>
    ),
  },
  facebook: {
    brand: true,
    draw: ({ className }) => (
      <Brand className={className}>
        <circle cx="12" cy="12" r="11" fill="#1877F2" />
        <path
          d="M13.4 22.9v-8.2h2.7l.5-3.2h-3.2V9.6c0-.9.4-1.7 1.8-1.7h1.5V5.1s-1.3-.2-2.6-.2c-2.6 0-4.3 1.6-4.3 4.4v2.2H7v3.2h2.8v8.2a11 11 0 0 0 3.6 0Z"
          fill="#fff"
        />
      </Brand>
    ),
  },
  instagram: {
    brand: true,
    draw: ({ className }) => (
      <Brand className={className}>
        <defs>
          <linearGradient id="fbw-ig-grad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FEDA77" />
            <stop offset="0.35" stopColor="#F58529" />
            <stop offset="0.6" stopColor="#DD2A7B" />
            <stop offset="1" stopColor="#515BD4" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#fbw-ig-grad)" />
        <rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.7" />
        <circle cx="16.2" cy="7.8" r="1" fill="#fff" />
      </Brand>
    ),
  },
  "google-ads": {
    brand: true,
    draw: ({ className }) => (
      <Brand className={className}>
        <path d="M10.6 4.5 3 16.8 8 19.9 15.6 7.6Z" fill="#FBBC04" />
        <path d="M13.2 6 18.6 16.7" stroke="#4285F4" strokeWidth="6.8" strokeLinecap="round" fill="none" />
        <circle cx="5.5" cy="18.3" r="3.2" fill="#34A853" />
      </Brand>
    ),
  },
  "meta-ads": { brand: true, draw: MetaMark },
  target: {
    brand: false,
    draw: ({ className }) => (
      <Line className={className}>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" />
      </Line>
    ),
  },
  reporting: {
    brand: false,
    draw: ({ className }) => (
      <Line className={className}>
        <path d="M4 17a8 8 0 1 1 16 0" />
        <path d="M12 17l3.5-5" />
      </Line>
    ),
  },
  marketing: {
    brand: false,
    draw: ({ className }) => (
      <Line className={className}>
        <path d="M4 10v4h3l8 4.5v-13L7 10H4Z" />
        <path d="M7 14l1 5h2.5l-.9-4.5M18.5 9.5a3.5 3.5 0 0 1 0 5" />
      </Line>
    ),
  },
};

/** A row's icon, drawn bare as Firstfold's plan table does: a mark in its own colours, a line icon in navy. */
export default function PlanIcon({ name }: { readonly name: PlanIconKey }): ReactElement {
  const { brand, draw: Glyph } = GLYPHS[name];
  return <Glyph className={brand ? "size-6 shrink-0" : "size-6 shrink-0 text-primary/80"} />;
}
