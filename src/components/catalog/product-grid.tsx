import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
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
