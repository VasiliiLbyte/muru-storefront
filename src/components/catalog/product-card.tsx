import Link from "next/link";

import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import { FavoriteToggle } from "@/components/catalog/favorite-toggle";
import { ProductCardImages } from "@/components/catalog/product-card-images";
import { productHref } from "@/lib/catalog/urls";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const showSale = product.isOnSale && product.oldPrice;
  const discount = showSale
    ? discountPercent(product.price, product.oldPrice!)
    : 0;

  return (
    <article className={cn("group relative flex flex-col gap-3", className)}>
      <div className="relative aspect-square overflow-hidden bg-surface">
        <ProductCardImages
          images={product.images}
          href={productHref(product)}
          priority={priority}
        />

        {/* Сердце — слева сверху, корзина — справа сверху, скидка — снизу
            справа (макет `сайт_2.pdf` / CARD-001). Всё без подложек. */}
        <div className="absolute top-1 left-1 z-20">
          <FavoriteToggle
            sku={product.sku}
            productTitle={product.title}
            variant="bare"
          />
        </div>

        <div className="absolute top-1 right-1 z-20">
          <AddToCartButton
            sku={product.sku}
            productTitle={product.title}
            imageUrl={product.images[0]?.url}
            variant="icon"
          />
        </div>

        {showSale ? (
          <span className="absolute right-0 bottom-0 z-10 bg-brand px-2 py-1 text-caption font-medium text-text-inverse">
            {discount > 0 ? `−${discount}%` : "Распродажа"}
          </span>
        ) : null}
      </div>

      <Link
        href={productHref(product)}
        className="flex min-w-0 flex-col gap-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="text-caption text-text-secondary lowercase">
          {product.inStock ? "в наличии" : "отсутствует"}
        </span>
        <h3 className="line-clamp-2 text-body text-text-heading transition-colors group-hover:text-brand">
          {product.title}
        </h3>
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className={cn(
              "text-body font-medium",
              showSale ? "text-brand" : "text-text-heading",
            )}
          >
            {formatPrice(product.price, product.currency)}
          </span>
          {showSale ? (
            <span className="text-small text-text-secondary line-through">
              {formatPrice(product.oldPrice!, product.currency)}
            </span>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
