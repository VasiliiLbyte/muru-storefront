import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { getProducts } from "@/lib/api/endpoints";
import { ProductListQuerySchema, type Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/**
 * Mobile-only «Новинки» rail on the home page (M7-4 / M8-5).
 * Prefers newArrival; falls back to sort=new if fewer than 4 items.
 * Empty → null. Hidden from lg up (desktop backlog DEP-045).
 */
export async function HomeProductRail({
  headingSrOnly = false,
}: {
  /** When rail follows a «Новинки» banner — hide duplicate h2, keep «Все новинки». */
  headingSrOnly?: boolean;
} = {}) {
  let items: Product[] = [];
  try {
    const primary = await getProducts(
      ProductListQuerySchema.parse({
        page: 1,
        pageSize: 8,
        sort: "new",
        newArrival: true,
      }),
    );
    items = primary.items;
    if (items.length < 4) {
      const fallback = await getProducts(
        ProductListQuerySchema.parse({
          page: 1,
          pageSize: 8,
          sort: "new",
        }),
      );
      if (fallback.items.length > items.length) {
        items = fallback.items;
      }
    }
  } catch (e) {
    console.error("[home-rail]", e);
    return null;
  }

  if (items.length === 0) return null;

  return (
    <section
      className="flex flex-col gap-6 bg-background px-4 py-10 sm:px-8 lg:hidden"
      aria-labelledby="home-novinki-heading"
    >
      <div className="flex items-end justify-between gap-4">
        <h2
          id="home-novinki-heading"
          className={cn(
            // parity: muru.ru mobile section titles uppercase
            "font-display text-h2 text-text-heading uppercase",
            headingSrOnly && "sr-only",
          )}
        >
          Новинки
        </h2>
        <Link
          href="/new/"
          className="inline-flex min-h-11 shrink-0 items-center text-small text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          Все новинки
        </Link>
      </div>

      <div
        className="-mx-4 flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Новинки"
      >
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={false}
            className="w-[75vw] max-w-sm min-w-[75vw] shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  );
}
