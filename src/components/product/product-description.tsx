import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function ProductDescription({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const hasShort = Boolean(product.shortDescription);
  const hasLong = Boolean(product.description);
  if (!hasShort && !hasLong) return null;

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <h2 className="font-display text-h2 text-text-heading">Описание</h2>
      <div className="flex flex-col gap-3 text-body text-text-secondary">
        {hasShort ? (
          <p className="text-text-heading">{product.shortDescription}</p>
        ) : null}
        {hasLong ? <p>{product.description}</p> : null}
      </div>
    </section>
  );
}
