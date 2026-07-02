import type { Redirect } from "next/dist/lib/load-custom-routes";

const BITRIX_REDIRECTS: { source: string; destination: string }[] = [
  {
    source: "/include/licenses_detail.php",
    destination: "/legal/privacy/",
  },
  {
    source: "/include/offer_detail.php",
    destination: "/legal/offer/",
  },
];

/** 301/308-редиректы со старых Bitrix-URL на чистые маршруты витрины. */
export function getBitrixRedirects(): Redirect[] {
  return BITRIX_REDIRECTS.flatMap(({ source, destination }) => [
    { source, destination, permanent: true },
    { source: `${source}/`, destination, permanent: true },
  ]);
}
