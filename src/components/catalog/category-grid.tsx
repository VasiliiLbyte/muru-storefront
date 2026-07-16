import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/lib/schemas";
import { catalogHref } from "@/lib/site";
import type { TaxonomyNode } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export function CategoryGrid({
  parentSlug,
  subcategories,
  categories,
  className,
}: {
  parentSlug: string;
  subcategories: TaxonomyNode[];
  categories: Category[];
  className?: string;
}) {
  if (subcategories.length === 0) return null;

  const imageBySlug = new Map(categories.map((c) => [c.slug, c.image]));

  return (
    <div className={cn("mb-10", className)}>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {subcategories.map((child, index) => {
          const image = imageBySlug.get(child.slug);
          return (
            <Link
              key={child.slug}
              href={catalogHref.sub(parentSlug, child.slug)}
              className="group flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt ?? child.title}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    priority={index === 0}
                    placeholder={image.blurDataURL ? "blur" : undefined}
                    blurDataURL={image.blurDataURL}
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : null}
              </div>
              <h3 className="font-display text-h2 text-text-heading transition-colors group-hover:text-brand">
                {child.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
