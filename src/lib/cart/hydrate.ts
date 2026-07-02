import { getProductBySku } from "@/lib/api/endpoints";
import type { Product } from "@/lib/schemas";

/** Загружает товары корзины по SKU; неизвестные SKU пропускаются. */
export async function hydrateCartProducts(
  skus: string[],
): Promise<Map<string, Product>> {
  const unique = [...new Set(skus)];
  const results = await Promise.allSettled(
    unique.map((sku) => getProductBySku(sku)),
  );

  const map = new Map<string, Product>();
  for (let i = 0; i < unique.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      map.set(unique[i], result.value);
    }
  }
  return map;
}
