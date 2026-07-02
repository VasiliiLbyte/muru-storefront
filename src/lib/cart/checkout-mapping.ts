import type { CartItem, WebCheckoutItem } from "@/lib/schemas";

/** Маппит корзину в позиции гостевого веб-чекаута (1 SKU = 1 товар). */
export function toWebCheckoutItems(items: CartItem[]): WebCheckoutItem[] {
  return items.map(({ sku, qty }) => ({ sku, quantity: qty }));
}
