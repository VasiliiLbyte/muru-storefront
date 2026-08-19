import { describe, expect, it } from "vitest";

import { isActiveOrderStatus, orderStatusProgress } from "./account";

describe("orderStatusProgress", () => {
  it("maps fulfillment flow to 4 steps", () => {
    expect(orderStatusProgress("Новый")).toEqual({ step: 1, total: 4 });
    expect(orderStatusProgress("Собирается")).toEqual({ step: 2, total: 4 });
    expect(orderStatusProgress("В пути")).toEqual({ step: 3, total: 4 });
    expect(orderStatusProgress("Доставлен")).toEqual({ step: 4, total: 4 });
  });

  it("returns step 0 for non-flow statuses", () => {
    expect(orderStatusProgress("Отменён")).toEqual({ step: 0, total: 4 });
    expect(orderStatusProgress("Возврат")).toEqual({ step: 0, total: 4 });
    expect(orderStatusProgress("В обработке")).toEqual({ step: 0, total: 4 });
  });
});

describe("isActiveOrderStatus", () => {
  it("treats in-progress statuses as active", () => {
    expect(isActiveOrderStatus("В пути")).toBe(true);
    expect(isActiveOrderStatus("Собирается")).toBe(true);
  });

  it("treats terminal statuses as done", () => {
    expect(isActiveOrderStatus("Доставлен")).toBe(false);
    expect(isActiveOrderStatus("Отменён")).toBe(false);
    expect(isActiveOrderStatus("Возврат")).toBe(false);
  });
});
