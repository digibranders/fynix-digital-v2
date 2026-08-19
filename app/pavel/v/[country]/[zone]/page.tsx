import { notFound } from "next/navigation";
import "../../../pavel.css";
import { WorkshopLanding } from "@/components/pavel/WorkshopLanding";
import { pavelMetadata } from "@/app/pavel/metadata";
import {
  SEED_VARIANTS,
  countryToSlug,
  slugToCountry,
  slugToZone,
  validCountryCode,
  validTimeZone,
  zoneToSlug,
} from "@/lib/pavel/landingVariant";

export const metadata = pavelMetadata;

/**
 * The cacheable rendering of `/pavel`.
 *
 * Reached only by the middleware rewrite, so visitors never see this URL. It
 * reads nothing from the request — no headers, no cookies, no search params —
 * which is precisely what allows Next to prerender it and Vercel to serve it
 * from the edge beside the visitor instead of routing every request to the
 * function region.
 *
 * Revalidates on a timer so a cohort change reaches the page without a deploy;
 * the admin actions also revalidate it explicitly on save.
 */
export const revalidate = 300;

/** Any combination not prerendered is generated on first request, then cached. */
export const dynamicParams = true;

export function generateStaticParams() {
  return SEED_VARIANTS.map((variant) => ({
    country: countryToSlug(variant.countryCode),
    zone: zoneToSlug(variant.timeZone),
  }));
}

export default async function PavelVariantPage({
  params,
}: {
  params: Promise<{ country: string; zone: string }>;
}) {
  const { country, zone } = await params;

  // Both segments are attacker-controlled: anyone can request an arbitrary
  // path. Rejecting values this runtime does not recognise keeps junk out of
  // the rendered page and bounds how many distinct pages can ever be cached.
  const rawCountry = slugToCountry(country);
  const rawZone = slugToZone(zone);
  const countryCode = validCountryCode(rawCountry);
  const timeZone = validTimeZone(rawZone);

  if ((rawCountry && !countryCode) || (rawZone && !timeZone)) notFound();

  return <WorkshopLanding countryCode={countryCode} timeZone={timeZone} />;
}
