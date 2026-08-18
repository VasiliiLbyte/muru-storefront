"use client";

import Image from "next/image";
import Link from "next/link";

import { ProductCardImages } from "@/components/catalog/product-card-images";
import { productHref } from "@/lib/catalog/urls";
import { formatPrice } from "@/lib/format";
import type { Hotspot, Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export type HotspotProductCardProps = {
  hotspot: Hotspot;
  product?: Product;
  className?: string;
  imageSizes?: string;
  layout?: "popover" | "sheet";
};

/** Shared lookbook hotspot product body (popover + bottom sheet). */
export function HotspotProductCard({
  hotspot,
  product,
  className,
  imageSizes = "224px",
  layout = "popover",
}: HotspotProductCardProps) {
  const fallbackUrl =
    product?.images[0]?.url ?? hotspot.product.image ?? undefined;
  const title = product?.title ?? hotspot.product.name;
  const href = product ? productHref(product) : hotspot.product.slug;
  const showSale = product?.isOnSale && product.oldPrice;
  const useCarousel = Boolean(product && product.images.length > 1);
  const isSheet = layout === "sheet";

  const details = (
    <>
      <p
        className={cn(
          "font-display text-body text-text-heading",
          isSheet ? "pr-12" : "pr-6",
        )}
      >
        {title}
      </p>

      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        {product ? (
          <>
            <span className="text-body font-medium text-text-heading">
              {formatPrice(product.price, product.currency)}
            </span>
            {showSale ? (
              <span className="text-small text-text-secondary line-through">
                {formatPrice(product.oldPrice!, product.currency)}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-body font-medium text-text-heading">
            {formatPrice(hotspot.product.price)}
          </span>
        )}
      </div>

      <Link
        href={href}
        className="mt-3 inline-block text-small text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Смотреть товар
      </Link>
    </>
  );

  if (isSheet) {
    return (
      <div className={cn("min-w-0", className)}>
        <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-surface">
          {useCarousel && product ? (
            <ProductCardImages
              images={product.images}
              href={productHref(product)}
              variant="compact"
              sizes={imageSizes}
            />
          ) : fallbackUrl ? (
            <Image
              src={fallbackUrl}
              alt=""
              fill
              sizes={imageSizes}
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="px-5 pt-4 pb-7">{details}</div>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      {useCarousel && product ? (
        <div className="relative mb-3 aspect-square w-full overflow-hidden bg-surface">
          <ProductCardImages
            images={product.images}
            href={productHref(product)}
            variant="compact"
            sizes={imageSizes}
          />
        </div>
      ) : fallbackUrl ? (
        <div className="relative mb-3 aspect-square w-full overflow-hidden bg-surface">
          <Image
            src={fallbackUrl}
            alt=""
            fill
            sizes={imageSizes}
            className="object-cover"
          />
        </div>
      ) : null}

      {details}
    </div>
  );
}
