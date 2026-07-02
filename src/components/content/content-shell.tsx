import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

export function ContentShell({
  title,
  breadcrumbs,
  className,
  children,
}: {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8",
        className,
      )}
    >
      <Breadcrumbs items={breadcrumbs} className="mb-6 pt-8" />
      <h1 className="mb-8 font-display text-display text-text-heading">{title}</h1>
      {children}
    </div>
  );
}
