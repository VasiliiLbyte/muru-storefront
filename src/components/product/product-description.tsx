import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function DescriptionBody({ product }: { product: Product }) {
  const hasShort = Boolean(product.shortDescription);
  const hasLong = Boolean(product.description);

  return (
    <div className="flex flex-col gap-3 text-body text-text-secondary">
      {hasShort ? (
        <p className="text-text-heading">{product.shortDescription}</p>
      ) : null}
      {hasLong ? <p>{product.description}</p> : null}
    </div>
  );
}

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
    <>
      {/* Mobile: collapsed accordion */}
      <details
        className={cn("group border-t border-border lg:hidden", className)}
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 text-body text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
          <span className="font-display text-h2">Описание</span>
          <span
            className="text-h2 leading-none font-light text-text-secondary group-open:hidden"
            aria-hidden
          >
            +
          </span>
          <span
            className="hidden text-h2 leading-none font-light text-text-secondary group-open:inline"
            aria-hidden
          >
            −
          </span>
        </summary>
        <div className="pb-4">
          <DescriptionBody product={product} />
        </div>
      </details>

      {/* Desktop: always-open section */}
      <section
        className={cn("hidden flex-col gap-4 lg:flex", className)}
      >
        <h2 className="font-display text-h2 text-text-heading">Описание</h2>
        <DescriptionBody product={product} />
      </section>
    </>
  );
}
