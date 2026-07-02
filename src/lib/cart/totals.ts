import type { CartItem, Product } from "@/lib/schemas";

export type CartTotals = {
  lineCount: number;
  unitCount: number;
  subtotal: number;
};

/** Считает итоги корзины по загруженным товарам. */
export function computeCartTotals(
  items: CartItem[],
  productsBySku: Map<string, Product>,
): CartTotals {
  let unitCount = 0;
  let subtotal = 0;

  for (const item of items) {
    const product = productsBySku.get(item.sku);
    if (!product) continue;
    unitCount += item.qty;
    subtotal += product.price * item.qty;
  }

  return {
    lineCount: items.filter((i) => productsBySku.has(i.sku)).length,
    unitCount,
    subtotal,
  };
}
