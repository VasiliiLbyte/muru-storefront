import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ProductDescription } from "@/components/product/product-description";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductSpecsAccordion } from "@/components/product/product-specs-accordion";
import { RelatedProducts } from "@/components/product/related-products";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function ProductPdp({
  product,
  breadcrumbs,
  relatedProducts,
  className,
}: {
  product: Product;
  breadcrumbs: BreadcrumbItem[];
  relatedProducts: Product[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8",
        className,
      )}
    >
      <Breadcrumbs items={breadcrumbs} className="mb-6 pt-8" />

      <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} title={product.title} />
        <div className="flex flex-col">
          <ProductPurchase product={product} />
          <ProductSpecsAccordion product={product} />
        </div>
      </div>

      <div className="flex flex-col gap-12">
        <ProductDescription product={product} />
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
