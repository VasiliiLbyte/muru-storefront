import { describe, expect, it } from "vitest";

import { buildWebPaymentRequestInit } from "./web-payment-auth";

describe("buildWebPaymentRequestInit", () => {
  const body = JSON.stringify({ items: [] });

  it("adds Authorization Bearer when access token is set", () => {
    const init = buildWebPaymentRequestInit(body, "access-xyz");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(body);
    expect(init.headers).toEqual({
      Authorization: "Bearer access-xyz",
    });
  });

  it("omits Authorization when access token is null", () => {
    const init = buildWebPaymentRequestInit(body, null);
    expect(init.method).toBe("POST");
    expect(init.body).toBe(body);
    expect(init.headers).toBeUndefined();
  });
});
