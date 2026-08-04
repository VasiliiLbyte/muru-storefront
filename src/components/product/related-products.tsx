import { ProductCard } from "@/components/catalog/product-card";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function RelatedProducts({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={cn("flex flex-col gap-8", className)}>
      <h2 className="font-display text-h2 text-text-heading">Похожие товары</h2>

      {/* Mobile: horizontal snap carousel */}
      <div
        className="-mx-4 flex gap-3 overflow-x-auto px-4 scroll-px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8 sm:scroll-px-8 lg:hidden"
        aria-label="Похожие товары"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={false}
            className="w-[75vw] max-w-sm min-w-[75vw] shrink-0 snap-start"
          />
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:block">
        <ProductGrid products={products} prioritizeLcp={false} />
      </div>
    </section>
  );
}
