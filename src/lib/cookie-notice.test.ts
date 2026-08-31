import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  acceptAnalyticsCookies,
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_REJECTED,
  COOKIE_NOTICE_KEY,
  COOKIE_NOTICE_VALUE,
  getCookieConsent,
  hasCookieConsentChoice,
  isAnalyticsConsentGranted,
  rejectAnalyticsCookies,
} from "./cookie-notice";

function installLocalStorageMock() {
  const store = new Map<string, string>();
  const listeners = new Map<string, Set<EventListener>>();

  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };

  const windowStub = {
    localStorage,
    addEventListener: (type: string, listener: EventListener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener: (type: string, listener: EventListener) => {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent: (event: Event) => {
      listeners.get(event.type)?.forEach((listener) => listener(event));
      return true;
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: windowStub,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: localStorage,
  });

  return store;
}

describe("cookie-notice", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = installLocalStorageMock();
  });

  it("returns null when no choice stored", () => {
    expect(getCookieConsent()).toBeNull();
    expect(hasCookieConsentChoice()).toBe(false);
    expect(isAnalyticsConsentGranted()).toBe(false);
  });

  it("migrates legacy dismiss value to accepted", () => {
    store.set(COOKIE_NOTICE_KEY, COOKIE_NOTICE_VALUE);
    expect(getCookieConsent()).toBe(COOKIE_CONSENT_ACCEPTED);
    expect(isAnalyticsConsentGranted()).toBe(true);
  });

  it("accept stores accepted and grants analytics", () => {
    acceptAnalyticsCookies();
    expect(store.get(COOKIE_NOTICE_KEY)).toBe(COOKIE_CONSENT_ACCEPTED);
    expect(isAnalyticsConsentGranted()).toBe(true);
  });

  it("reject stores rejected and blocks analytics", () => {
    rejectAnalyticsCookies();
    expect(store.get(COOKIE_NOTICE_KEY)).toBe(COOKIE_CONSENT_REJECTED);
    expect(isAnalyticsConsentGranted()).toBe(false);
    expect(hasCookieConsentChoice()).toBe(true);
  });

  it("dispatches consent change event on accept", () => {
    const handler = vi.fn();
    window.addEventListener("muru:cookie-consent-changed", handler);
    acceptAnalyticsCookies();
    expect(handler).toHaveBeenCalledOnce();
  });
});
