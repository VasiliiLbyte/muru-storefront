export const COOKIE_NOTICE_KEY = "muru-cookie-notice";

/** @deprecated Legacy dismiss value — treated as analytics accepted on read. */
export const COOKIE_NOTICE_VALUE = "1";

export const COOKIE_CONSENT_ACCEPTED = "accepted";
export const COOKIE_CONSENT_REJECTED = "rejected";

export type CookieConsentChoice =
  | typeof COOKIE_CONSENT_ACCEPTED
  | typeof COOKIE_CONSENT_REJECTED;

export const COOKIE_CONSENT_CHANGED_EVENT = "muru:cookie-consent-changed";

function readStoredConsent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(COOKIE_NOTICE_KEY);
  } catch {
    return null;
  }
}

function normalizeStoredConsent(raw: string | null): CookieConsentChoice | null {
  if (raw === COOKIE_CONSENT_ACCEPTED || raw === COOKIE_NOTICE_VALUE) {
    return COOKIE_CONSENT_ACCEPTED;
  }
  if (raw === COOKIE_CONSENT_REJECTED) {
    return COOKIE_CONSENT_REJECTED;
  }
  return null;
}

/** User has made an explicit analytics consent choice (accept or reject). */
export function hasCookieConsentChoice(): boolean {
  return getCookieConsent() !== null;
}

export function getCookieConsent(): CookieConsentChoice | null {
  return normalizeStoredConsent(readStoredConsent());
}

/** True when the user allowed analytics cookies (Yandex Metrika). */
export function isAnalyticsConsentGranted(): boolean {
  return getCookieConsent() === COOKIE_CONSENT_ACCEPTED;
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COOKIE_NOTICE_KEY, choice);
    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
  } catch {
    // private mode / quota — ignore
  }
}

/** @deprecated Use hasCookieConsentChoice — kept for existing imports during migration. */
export function isCookieNoticeDismissed(): boolean {
  return hasCookieConsentChoice();
}

/** @deprecated Use setCookieConsent("accepted") — maps old dismiss to accept. */
export function dismissCookieNotice(): void {
  setCookieConsent(COOKIE_CONSENT_ACCEPTED);
}

export function acceptAnalyticsCookies(): void {
  setCookieConsent(COOKIE_CONSENT_ACCEPTED);
}

export function rejectAnalyticsCookies(): void {
  setCookieConsent(COOKIE_CONSENT_REJECTED);
}
