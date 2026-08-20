import { beforeEach, describe, expect, it } from "vitest";

import {
  COOKIE_NOTICE_KEY,
  COOKIE_NOTICE_VALUE,
  dismissCookieNotice,
  isCookieNoticeDismissed,
} from "./cookie-notice";

function installLocalStorageMock() {
  const store = new Map<string, string>();
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
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: { localStorage },
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

  it("returns false when key is missing", () => {
    expect(isCookieNoticeDismissed()).toBe(false);
  });

  it("returns false for unexpected values", () => {
    store.set(COOKIE_NOTICE_KEY, "0");
    expect(isCookieNoticeDismissed()).toBe(false);
  });

  it("dismiss sets key and isCookieNoticeDismissed becomes true", () => {
    dismissCookieNotice();
    expect(store.get(COOKIE_NOTICE_KEY)).toBe(COOKIE_NOTICE_VALUE);
    expect(isCookieNoticeDismissed()).toBe(true);
  });
});
