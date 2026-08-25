import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

/** Mobile section / content page titles (~26px light uppercase). */
export const mobileSectionTitleClass =
  "font-display text-[26px] leading-8 font-light text-text-heading uppercase";

export function ContentShell({
  title,
  breadcrumbs,
  titleAlign = "left",
  showTitle = true,
  showBreadcrumbs = true,
  className,
  children,
}: {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  titleAlign?: "left" | "center";
  showTitle?: boolean;
  showBreadcrumbs?: boolean;
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
      {showBreadcrumbs ? (
        <Breadcrumbs items={breadcrumbs} className="mb-6 pt-8" />
      ) : null}
      {showTitle ? (
        <h1
          className={cn(
            "mb-8",
            mobileSectionTitleClass,
            "lg:text-display lg:leading-[var(--text-display--line-height)]",
            titleAlign === "center" && "text-center",
          )}
        >
          {title}
        </h1>
      ) : null}
      {children}
    </div>
  );
}
