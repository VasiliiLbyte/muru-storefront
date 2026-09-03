"use client";

import { useState } from "react";
import Link from "next/link";

import { catalogTriggerClass } from "@/components/layout/catalog-trigger-class";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isSaleCategorySlug } from "@/lib/catalog/sale-category";
import { cn } from "@/lib/utils";

const linkClass =
  "text-body font-light text-text-secondary transition-colors hover:text-text-primary";

function catalogSlugFromHref(href: string): string {
  const path = href.split("?")[0] ?? href;
  const parts = path.split("/").filter(Boolean);
  return parts[0] === "catalog" ? decodeURIComponent(parts[1] ?? "") : "";
}

type CatalogMenuPanelProps = {
  catalogItems: { label: string; href: string }[];
};

/**
 * Десктопное меню «Каталог» — левый drawer (как .catalog-side-panel на muru.ru).
 * Только категории (catalog_only) — без mainNav.
 */
export function CatalogMenuPanel({ catalogItems }: CatalogMenuPanelProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={catalogTriggerClass}>Каталог</SheetTrigger>
      <SheetContent
        side="left"
        onSwipeClose={close}
        backdropClassName="bg-black/30"
        className="w-full gap-0 p-8 sm:w-[320px] sm:max-w-[360px]"
      >
        <SheetTitle className="sr-only">Каталог</SheetTitle>
        <nav aria-label="Каталог">
          <ul className="flex flex-col gap-y-3">
            {catalogItems.map((item) => {
              const sale = isSaleCategorySlug(catalogSlugFromHref(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      linkClass,
                      sale && "text-brand hover:text-brand",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
