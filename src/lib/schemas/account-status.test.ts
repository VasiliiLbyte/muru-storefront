import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  CustomerOrderDetailSchema,
  isActiveOrderStatus,
  orderStatusProgress,
} from "./account";

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

describe("CustomerOrderDetailSchema", () => {
  it("parses detail payload with track and items", () => {
    const parsed = CustomerOrderDetailSchema.parse({
      id: 42,
      status: "В пути",
      total: 1000,
      channel: "web",
      createdAt: "2026-08-01T10:00:00.000Z",
      paidAt: "2026-08-01T10:05:00.000Z",
      deliveryMode: "delivery",
      address: "ул. Примерная, 1",
      trackNumber: "1234567890",
      cdekStatus: null,
      deliveryCity: "Санкт-Петербург",
      pvzAddress: "ПВЗ на Невском",
      pvzCode: "SPB1",
      deliveryPrice: 450,
      deliveryEta: "2-3 дня",
      deliveryOption: "pvz",
      items: [{ sku: "MU0001", name: "Ваза", price: 500, quantity: 2 }],
    });
    expect(parsed.trackNumber).toBe("1234567890");
    expect(parsed.items).toHaveLength(1);
    expect(parsed.deliveryPrice).toBe(450);
  });

  it("allows null trackNumber before shipment", () => {
    const parsed = CustomerOrderDetailSchema.parse({
      id: 1,
      status: "Новый",
      total: 500,
      createdAt: "2026-08-01T10:00:00.000Z",
      trackNumber: null,
      items: [],
    });
    expect(parsed.trackNumber).toBeNull();
    expect(parsed.items).toEqual([]);
  });

  it("unwraps BE envelope { order: detail }", () => {
    const detail = {
      id: 42,
      status: "В пути",
      total: 1000,
      createdAt: "2026-08-01T10:00:00.000Z",
      trackNumber: "1234567890",
      items: [{ sku: "MU0001", name: "Ваза", price: 500, quantity: 2 }],
    };
    const parsed = z
      .object({ order: CustomerOrderDetailSchema })
      .parse({ order: detail });
    expect(parsed.order.id).toBe(42);
    expect(parsed.order.trackNumber).toBe("1234567890");
  });
});
