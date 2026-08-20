export const COOKIE_NOTICE_KEY = "muru-cookie-notice";
export const COOKIE_NOTICE_VALUE = "1";

/** True when the user has dismissed the notice (localStorage = "1"). */
export function isCookieNoticeDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COOKIE_NOTICE_KEY) === COOKIE_NOTICE_VALUE;
  } catch {
    return false;
  }
}

/** Persist dismiss so the notice is not shown again on this origin. */
export function dismissCookieNotice(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COOKIE_NOTICE_KEY, COOKIE_NOTICE_VALUE);
  } catch {
    // private mode / quota — ignore
  }
}
