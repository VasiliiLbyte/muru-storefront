import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

import { CATALOG_PRODUCT_GRID_CLASS } from "./catalog-grid-class";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  className,
  prioritizeLcp = true,
}: {
  products: Product[];
  className?: string;
  prioritizeLcp?: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-body text-text-muted">
        Товары не найдены
      </p>
    );
  }

  return (
    <div className={cn(CATALOG_PRODUCT_GRID_CLASS, className)}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={prioritizeLcp && index === 0}
        />
      ))}
    </div>
  );
}
