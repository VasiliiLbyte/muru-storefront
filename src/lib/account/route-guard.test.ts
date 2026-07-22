import { describe, expect, it } from "vitest";

import {
  decideAccountGuard,
  hasRefreshSessionCookie,
  isPrivateAccountPath,
} from "./route-guard";

describe("isPrivateAccountPath", () => {
  it("matches account routes with trailing slash", () => {
    expect(isPrivateAccountPath("/account/")).toBe(true);
    expect(isPrivateAccountPath("/account/orders/")).toBe(true);
    expect(isPrivateAccountPath("/login/")).toBe(false);
  });
});

describe("hasRefreshSessionCookie", () => {
  it("returns true for non-empty cookie value", () => {
    expect(hasRefreshSessionCookie("muru_customer_rt=abc")).toBe(true);
    expect(
      hasRefreshSessionCookie("other=1; muru_customer_rt=token-value"),
    ).toBe(true);
  });

  it("returns false for empty or whitespace cookie value", () => {
    expect(hasRefreshSessionCookie("muru_customer_rt=")).toBe(false);
    expect(hasRefreshSessionCookie("muru_customer_rt=; path=/")).toBe(false);
    expect(hasRefreshSessionCookie("muru_customer_rt=%20")).toBe(false);
    expect(hasRefreshSessionCookie(null)).toBe(false);
  });
});

describe("decideAccountGuard", () => {
  it("redirects private path without cookie to login?next=", () => {
    const decision = decideAccountGuard({
      pathname: "/account/orders/",
      search: "",
      origin: "http://localhost:3000",
      cookieHeader: null,
    });
    expect(decision.type).toBe("redirect");
    if (decision.type === "redirect") {
      const url = new URL(decision.location);
      expect(url.pathname).toBe("/login/");
      expect(url.searchParams.get("next")).toBe("/account/orders/");
    }
  });

  it("treats empty refresh cookie as logged out on private path", () => {
    const decision = decideAccountGuard({
      pathname: "/account/",
      search: "",
      origin: "http://localhost:3000",
      cookieHeader: "muru_customer_rt=",
    });
    expect(decision.type).toBe("redirect");
  });

  it("redirects auth page with cookie to /account/", () => {
    const decision = decideAccountGuard({
      pathname: "/login/",
      search: "",
      origin: "http://localhost:3000",
      cookieHeader: "muru_customer_rt=abc",
    });
    expect(decision).toEqual({
      type: "redirect",
      location: "http://localhost:3000/account/",
    });
  });

  it("allows private path when cookie present", () => {
    const decision = decideAccountGuard({
      pathname: "/account/",
      search: "",
      origin: "http://localhost:3000",
      cookieHeader: "muru_customer_rt=abc",
    });
    expect(decision).toEqual({ type: "next" });
  });
});
