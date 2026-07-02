import { z } from "zod";

/**
 * Корзина — клиентское состояние (persist в localStorage).
 * Оформление — через createWebPayment (см. order.ts, api/endpoints.ts).
 */
export const CartItemSchema = z.object({
  sku: z.string(),
  qty: z.number().int().positive(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
});
export type Cart = z.infer<typeof CartSchema>;
