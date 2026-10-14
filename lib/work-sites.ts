import type { FrameSandbox } from "./frame-sandbox";

/**
 * The client websites shown on /free-business-website, and how each opens inside Fynix (the viewer at
 * /free-business-website/live/[slug]). Plain data with relative imports only: next.config.ts reads it too, to allow
 * exactly these origins in the page's frame-src.
 */
export interface WorkSite {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly summary: string;
  /** The site on its own domain. */
  readonly url: string;
  /** Whether the site allows itself to be framed. A site that does not is shown as a full-length capture of its homepage. */
  readonly embeddable: boolean;
  readonly sandbox: FrameSandbox;
  /** The card's picture, and the placeholder behind the frame until the live page has loaded. */
  readonly image: { readonly src: string; readonly width: number; readonly height: number; readonly alt: string };
  /** The whole homepage in one tall picture, for a site that cannot be framed. */
  readonly fullPage?: { readonly src: string; readonly width: number; readonly height: number; readonly alt: string };
}

export const workSites: readonly WorkSite[] = [
  {
    slug: "curry-cook",
    title: "Curry Cook",
    category: "Restaurant with online ordering",
    summary: "A bright restaurant website where customers browse the menu, build their own curry plate and order online.",
    url: "https://currycook.com/",
    embeddable: true,
    // Checked to set no cookies and load no trackers when framed, and it needs its own origin to load its menu.
    sandbox: "own-origin",
    image: {
      src: "/free-business-website/curry-cook.jpg",
      width: 1600,
      height: 1000,
      alt: "The Curry Cook home page: the headline “Taste bud reviving Curry flavors” on bright yellow, pink and green banners beside a plate of curry, rice and naan, with an Order now button.",
    },
  },
  {
    slug: "payweek",
    title: "PayWeek",
    category: "Payroll and accounting software",
    summary: "A clean product website that shows the software at work and leads to a free trial.",
    url: "https://payweek.com/home",
    embeddable: true,
    // Its scripts set tracking cookies when the page keeps its origin; isolated, it looks the same.
    sandbox: "isolated",
    image: {
      src: "/free-business-website/payweek.jpg",
      width: 1600,
      height: 1000,
      alt: "The PayWeek home page: a payroll and accounting product website with a free trial button.",
    },
  },
  {
    slug: "gkr-hospitality",
    title: "GKR Hospitality",
    category: "Hospitality consultancy",
    summary: "A dark, confident website for a consultancy, built around one next step: a free discovery call.",
    url: "https://www.gkrhospitality.com/",
    // It refuses to be framed, so the viewer shows its full-length homepage instead.
    embeddable: false,
    sandbox: "isolated",
    image: {
      src: "/free-business-website/gkr-hospitality.jpg",
      width: 1600,
      height: 1000,
      alt: "The GKR Hospitality home page: a dark website for a hospitality consultancy with a discovery call button.",
    },
    fullPage: {
      src: "/free-business-website/gkr-hospitality-full.jpg",
      width: 1280,
      height: 5361,
      alt: "The full GKR Hospitality home page, from the rooftop hero through the seven areas of support and the invitation to a discovery call, down to the contact footer.",
    },
  },
];

export function findWorkSite(slug: string): WorkSite | undefined {
  return workSites.find((site) => site.slug === slug);
}

/** The origins of the sites that are framed live, once each, in the order given: what the page's frame-src must allow. */
export function framedSiteOrigins(sites: readonly Pick<WorkSite, "url" | "embeddable">[] = workSites): string[] {
  return [...new Set(sites.filter((site) => site.embeddable).map((site) => new URL(site.url).origin))];
}
