/** Routes for M0 mobile baseline (trailing slash parity with SEF / a11y). */

export const MOBILE_OVERFLOW_ROUTES = [
  "/",
  "/catalog/",
  "/catalog/vazy-i-aksessuary/",
  "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/",
  "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/vazy-i-kuvshiny-01/",
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
  "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/vazy-i-kuvshiny-01/",
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
