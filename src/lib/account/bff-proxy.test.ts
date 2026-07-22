import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildUpstreamHeaders,
  proxyToUpstream,
  resolveClientIp,
} from "./bff-proxy";

describe("resolveClientIp", () => {
  it("uses first x-forwarded-for hop", () => {
    const req = new Request("http://localhost/api/account/login", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });
    expect(resolveClientIp(req)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost/api/account/login", {
      headers: { "x-real-ip": "198.51.100.7" },
    });
    expect(resolveClientIp(req)).toBe("198.51.100.7");
  });
});

describe("buildUpstreamHeaders / proxyToUpstream X-Forwarded-For", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards client IP on outgoing upstream fetch", async () => {
    const request = new Request("http://localhost/api/account/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.44",
        authorization: "Bearer access-xyz",
      },
      body: JSON.stringify({ email: "a@b.c", password: "secret12" }),
    });

    const headers = buildUpstreamHeaders(request, { hasBody: true });
    expect(headers.get("X-Forwarded-For")).toBe("203.0.113.44");
    expect(headers.get("X-Real-IP")).toBe("203.0.113.44");
    expect(headers.get("Authorization")).toBe("Bearer access-xyz");

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
    expect(outHeaders.get("X-Forwarded-For")).toBe("203.0.113.44");
    expect(outHeaders.get("X-Real-IP")).toBe("203.0.113.44");
  });
});
