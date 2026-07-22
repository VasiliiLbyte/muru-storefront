import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetAccountFetchForTests,
  accountFetch,
  ensureAccessToken,
} from "./account-fetch";
import { getAccessToken, setAccessToken } from "./session";

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify({ success: status < 400, data, error: null }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("accountFetch single-flight refresh", () => {
  beforeEach(() => {
    __resetAccountFetchForTests();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    __resetAccountFetchForTests();
    vi.unstubAllGlobals();
  });

  it("runs only one refresh for parallel 401s and retries both with access", async () => {
    let refreshCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/account/refresh")) {
        refreshCalls += 1;
        await new Promise((r) => setTimeout(r, 20));
        return jsonResponse(200, { accessToken: "new-access", expiresIn: 900 });
      }
      const auth = new Headers(init?.headers).get("Authorization");
      if (!auth) {
        return jsonResponse(401, null);
      }
      if (url.includes("/api/account/me")) {
        return jsonResponse(200, { customer: { id: 1, email: "a@b.c" } });
      }
      if (url.includes("/api/account/orders")) {
        return jsonResponse(200, { orders: [] });
      }
      return jsonResponse(404, null);
    });
    vi.stubGlobal("fetch", fetchMock);

    const [me, orders] = await Promise.all([
      accountFetch("me"),
      accountFetch("orders"),
    ]);

    expect(me.status).toBe(200);
    expect(orders.status).toBe(200);
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBe("new-access");
  });

  it("does not clear access when ensureAccessToken already succeeded", async () => {
    setAccessToken("existing");
    const fetchMock = vi.fn(async () =>
      jsonResponse(401, null),
    );
    vi.stubGlobal("fetch", fetchMock);

    const ok = await ensureAccessToken();
    expect(ok).toBe(true);
    expect(getAccessToken()).toBe("existing");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skipAuth on 401 does not call refresh", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/refresh")) {
        throw new Error("refresh must not be called");
      }
      return jsonResponse(401, {
        error: { message: "Invalid credentials", code: "UNAUTHORIZED" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await accountFetch(
      "login",
      {
        method: "POST",
        body: JSON.stringify({ email: "a@b.c", password: "x" }),
      },
      { skipAuth: true },
    );

    expect(res.status).toBe(401);
    expect(
      fetchMock.mock.calls.some((c) => String(c[0]).includes("/refresh")),
    ).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});
