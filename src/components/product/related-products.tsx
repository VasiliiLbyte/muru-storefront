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
      <ProductGrid products={products} prioritizeLcp={false} />
    </section>
  );
}
