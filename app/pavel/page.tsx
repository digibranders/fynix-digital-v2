import { cookies, headers } from "next/headers";
import "./pavel.css";
import { WorkshopLanding } from "@/components/pavel/WorkshopLanding";
import { pavelMetadata } from "@/app/pavel/metadata";
import { countryFromParam } from "@/components/pavel/pricing";
import { TIME_ZONE_COOKIE } from "@/lib/pavel/timeZoneCookie";
import { validCountryCode, validTimeZone } from "@/lib/pavel/landingVariant";

export const metadata = pavelMetadata;

/**
 * Fallback rendering of the landing page.
 *
 * In production middleware rewrites `/pavel` to a prerendered variant, so this
 * normally never runs. It stays as the honest fallback for anything that
 * bypasses middleware, and it is what serves `?country=` overrides, which must
 * not be cached per query string.
 *
 * Dynamic by necessity: it reads the request to detect the visitor. That is
 * exactly the cost the variant route exists to avoid.
 */
export default async function PavelWorkshopPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const [{ country: countryParam }, headerList, cookieStore] = await Promise.all([
    searchParams,
    headers(),
    cookies(),
  ]);

  const countryCode = validCountryCode(headerList.get("x-vercel-ip-country"));
  const timeZone = validTimeZone(cookieStore.get(TIME_ZONE_COOKIE)?.value);

  return (
    <WorkshopLanding
      countryCode={countryCode}
      timeZone={timeZone}
      forcedPricingCountry={countryFromParam(countryParam) ?? undefined}
    />
  );
}
