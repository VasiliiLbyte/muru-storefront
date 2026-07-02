import Image from "next/image";
import Link from "next/link";

import { FavoriteToggle } from "@/components/catalog/favorite-toggle";
import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
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
  const image = product.images[0];
  const showSale = product.isOnSale && product.oldPrice;
  const discount = showSale
    ? discountPercent(product.price, product.oldPrice!)
    : 0;

  return (
    <article className={cn("group relative flex flex-col gap-3", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Link
          href={productHref(product)}
          className="absolute inset-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {image ? (
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              priority={priority}
              placeholder={image.blurDataURL ? "blur" : undefined}
              blurDataURL={image.blurDataURL}
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : null}
        </Link>
        {showSale && discount > 0 ? (
          <span className="absolute top-2 left-2 bg-brand px-2 py-0.5 text-caption font-medium text-text-inverse">
            −{discount}%
          </span>
        ) : showSale ? (
          <span className="absolute top-2 left-2 bg-brand px-2 py-0.5 text-caption font-medium text-text-inverse">
            Распродажа
          </span>
        ) : null}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteToggle sku={product.sku} productTitle={product.title} />
        </div>
        <AddToCartButton sku={product.sku} />
      </div>
      <Link
        href={productHref(product)}
        className="flex flex-col gap-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      >
        {product.inStock ? (
          <span className="text-caption text-text-secondary lowercase">
            в наличии
          </span>
        ) : null}
        <h3 className="text-body text-text-heading transition-colors group-hover:text-brand">
          {product.title}
        </h3>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-body font-medium text-text-heading">
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
