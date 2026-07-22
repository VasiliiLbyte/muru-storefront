import { describe, expect, it } from "vitest";

import {
  serializeClearRefreshCookie,
  serializeRefreshCookie,
} from "./bff-cookies";
import { extractAndStripRefreshToken } from "./bff-tokens";

describe("extractAndStripRefreshToken", () => {
  it("removes refreshToken from login envelope data", () => {
    const envelope = {
      success: true,
      data: {
        accessToken: "access-1",
        refreshToken: "refresh-secret",
        expiresIn: 900,
        customer: { id: 1, email: "a@b.c" },
      },
      error: null,
    };

    const { body, refreshToken } = extractAndStripRefreshToken(envelope);

    expect(refreshToken).toBe("refresh-secret");
    expect(body).toEqual({
      success: true,
      data: {
        accessToken: "access-1",
        expiresIn: 900,
        customer: { id: 1, email: "a@b.c" },
      },
      error: null,
    });
    expect(JSON.stringify(body)).not.toContain("refreshToken");
    expect(JSON.stringify(body)).not.toContain("refresh-secret");
  });

  it("leaves payloads without refreshToken unchanged", () => {
    const envelope = {
      success: true,
      data: { customer: { id: 1 } },
      error: null,
    };
    const { body, refreshToken } = extractAndStripRefreshToken(envelope);
    expect(refreshToken).toBeNull();
    expect(body).toEqual(envelope);
  });
});

describe("serializeRefreshCookie", () => {
  it("sets httpOnly SameSite Lax and omits Secure in non-production", () => {
    const cookie = serializeRefreshCookie({
      value: "rt-value",
      secure: false,
    });
    expect(cookie).toContain("muru_customer_rt=rt-value");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).not.toContain("Secure");
  });

  it("clear cookie has Max-Age=0 and epoch Expires", () => {
    const cookie = serializeClearRefreshCookie(false);
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(cookie).toContain("muru_customer_rt=");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });
});
