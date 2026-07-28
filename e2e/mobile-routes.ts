/**
 * Routes for M0 mobile baseline (trailing slash parity with SEF / a11y).
 *
 * Catalog paths use Latin API/mock slugs. PDP default is MSW fixture
 * `vazy-i-kuvshiny-01`. When e2e hits live catalog API (:4000), override via
 * `E2E_PDP_PATH` (full path with trailing slash from by-slug product URL).
 */

const LIVE_PDP =
  process.env.E2E_PDP_PATH?.replace(/\/?$/, "/") ??
  "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/vazy-i-kuvshiny-01/";

export const MOBILE_OVERFLOW_ROUTES = [
  "/",
  "/catalog/",
  "/catalog/vazy-i-aksessuary/",
  "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/",
  LIVE_PDP,
  "/basket/",
  "/checkout/",
  "/search/?q=ваза",
  "/login/",
  "/register/",
  "/account/",
  "/account/orders/",
  "/account/addresses/",
  "/account/favorites/",
  "/lookbooks/",
  "/landings/",
  "/company/contacts/",
  "/help/",
  "/legal/offer/",
] as const;

/** Key routes for tap-target scan (shorter suite). */
export const KEY_MOBILE_ROUTES = [
  "/",
  "/catalog/",
  LIVE_PDP,
  "/basket/",
  "/login/",
  "/search/?q=ваза",
] as const;

/** Pages with form controls for iOS zoom (≥16px font) check. */
export const IOS_ZOOM_ROUTES = [
  "/login/",
  "/register/",
  "/checkout/",
  "/search/?q=ваза",
  "/basket/",
] as const;

export { LIVE_PDP as E2E_PRODUCT_PDP_PATH };
