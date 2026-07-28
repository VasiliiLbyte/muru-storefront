import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AccountPathNotAllowedError,
  assertAllowedAccountPath,
  buildUpstreamAccountUrl,
  buildUpstreamHeaders,
  proxyToUpstream,
  resolveClientIp,
} from "./bff-proxy";

describe("resolveClientIp", () => {
  it("uses last x-forwarded-for hop (first hop does not win)", () => {
    const req = new Request("http://localhost/api/account/login", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });
    expect(resolveClientIp(req)).toBe("10.0.0.1");
  });

  it("skips trailing empty hops", () => {
    const req = new Request("http://localhost/api/account/login", {
      headers: { "x-forwarded-for": "203.0.113.10, 198.51.100.7,  " },
    });
    expect(resolveClientIp(req)).toBe("198.51.100.7");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost/api/account/login", {
      headers: { "x-real-ip": "198.51.100.7" },
    });
    expect(resolveClientIp(req)).toBe("198.51.100.7");
  });
});

describe("buildUpstreamHeaders / proxyToUpstream X-Client-IP", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("maps different last-hops to different X-Client-IP", () => {
    const a = buildUpstreamHeaders(
      new Request("http://localhost/api/account/login", {
        headers: { "x-forwarded-for": "1.1.1.1, 203.0.113.10" },
      }),
    );
    const b = buildUpstreamHeaders(
      new Request("http://localhost/api/account/login", {
        headers: { "x-forwarded-for": "1.1.1.1, 198.51.100.20" },
      }),
    );
    expect(a.get("X-Client-IP")).toBe("203.0.113.10");
    expect(b.get("X-Client-IP")).toBe("198.51.100.20");
    expect(a.get("X-Client-IP")).not.toBe(b.get("X-Client-IP"));
  });

  it("sets Client-IP + token when INTERNAL_PROXY_TOKEN is set; no forged XFF", async () => {
    vi.stubEnv("INTERNAL_PROXY_TOKEN", "test-internal-proxy-token-32chars!!");

    const request = new Request("http://localhost/api/account/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.10, 203.0.113.44",
        authorization: "Bearer access-xyz",
      },
      body: JSON.stringify({ email: "a@b.c", password: "secret12" }),
    });

    const headers = buildUpstreamHeaders(request, { hasBody: true });
    expect(headers.get("X-Client-IP")).toBe("203.0.113.44");
    expect(headers.get("X-Internal-Proxy-Token")).toBe(
      "test-internal-proxy-token-32chars!!",
    );
    expect(headers.get("X-Forwarded-For")).toBeNull();
    expect(headers.get("X-Real-IP")).toBeNull();
    expect(headers.get("Authorization")).toBe("Bearer access-xyz");
    expect(headers.get("Content-Type")).toBe("application/json");

    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit): Promise<Response> =>
        new Response("{}", { status: 200 }),
    );
    await proxyToUpstream(
      "http://localhost:4000/api/account/login",
      {
        method: "POST",
        headers,
        body: JSON.stringify({ email: "a@b.c", password: "secret12" }),
      },
      fetchMock as unknown as typeof fetch,
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    const outHeaders = new Headers(call![1]?.headers);
    expect(outHeaders.get("X-Client-IP")).toBe("203.0.113.44");
    expect(outHeaders.get("X-Internal-Proxy-Token")).toBe(
      "test-internal-proxy-token-32chars!!",
    );
    expect(outHeaders.get("X-Forwarded-For")).toBeNull();
    expect(outHeaders.get("X-Real-IP")).toBeNull();
  });

  it("omits proxy token header when INTERNAL_PROXY_TOKEN is empty", () => {
    vi.stubEnv("INTERNAL_PROXY_TOKEN", "");

    const headers = buildUpstreamHeaders(
      new Request("http://localhost/api/account/login", {
        headers: { "x-forwarded-for": "10.0.0.5" },
      }),
    );
    expect(headers.get("X-Client-IP")).toBe("10.0.0.5");
    expect(headers.get("X-Internal-Proxy-Token")).toBeNull();
    expect(headers.get("X-Forwarded-For")).toBeNull();
  });
});

describe("assertAllowedAccountPath / buildUpstreamAccountUrl whitelist", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects .. and encoded %2e%2e traversal segments", () => {
    expect(() => assertAllowedAccountPath(["..", "crm"])).toThrow(
      AccountPathNotAllowedError,
    );
    expect(() => assertAllowedAccountPath(["%2e%2e"])).toThrow(
      AccountPathNotAllowedError,
    );
    expect(() => assertAllowedAccountPath(["%2E%2E", "crm"])).toThrow(
      AccountPathNotAllowedError,
    );
  });

  it("rejects segments containing / or \\", () => {
    expect(() => assertAllowedAccountPath(["foo/bar"])).toThrow(
      AccountPathNotAllowedError,
    );
    expect(() => assertAllowedAccountPath(["a\\b"])).toThrow(
      AccountPathNotAllowedError,
    );
  });

  it("allows legitimate account paths and builds upstream URL", () => {
    vi.stubEnv("MURU_API_BASE", "http://localhost:4000/api");

    const cases: string[][] = [
      ["login"],
      ["me"],
      ["addresses", "12"],
      ["orders", "5"],
      ["favorites"],
      ["password", "forgot"],
    ];

    for (const segments of cases) {
      expect(() => assertAllowedAccountPath(segments)).not.toThrow();
      const url = buildUpstreamAccountUrl(segments, "");
      expect(url).toContain("/account/");
      expect(url).toContain(segments.map(encodeURIComponent).join("/"));
    }
  });

  it("does not call upstream fetch when path is denied (route-order simulation)", async () => {
    const fetchMock = vi.fn(
      async (): Promise<Response> => new Response("{}", { status: 200 }),
    );

    let status = 200;
    try {
      assertAllowedAccountPath(["..", "crm"]);
      await proxyToUpstream(
        "http://localhost:4000/api/account/../crm",
        { method: "GET", headers: new Headers() },
        fetchMock as unknown as typeof fetch,
      );
    } catch (err) {
      if (err instanceof AccountPathNotAllowedError) {
        status = 404;
      } else {
        throw err;
      }
    }

    expect(status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(() => buildUpstreamAccountUrl([".."], "")).toThrow(
      AccountPathNotAllowedError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unsafe ids under addresses/orders", () => {
    expect(() =>
      assertAllowedAccountPath(["addresses", ".."]),
    ).toThrow(AccountPathNotAllowedError);
    expect(() =>
      assertAllowedAccountPath(["orders", "12.34"]),
    ).toThrow(AccountPathNotAllowedError);
    expect(() =>
      assertAllowedAccountPath(["orders", "not-an-id"]),
    ).toThrow(AccountPathNotAllowedError);
  });
});
