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
import { mainNav } from "@/lib/site";

const linkClass =
  "text-body font-light text-text-secondary transition-colors hover:text-text-primary";

type CatalogMenuPanelProps = {
  catalogItems: { label: string; href: string }[];
};

/**
 * Десктопное меню «Каталог» — левый drawer (как .catalog-side-panel на muru.ru).
 */
export function CatalogMenuPanel({ catalogItems }: CatalogMenuPanelProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={catalogTriggerClass}>Каталог</SheetTrigger>
      <SheetContent
        side="left"
        backdropClassName="bg-black/30"
        className="w-full gap-0 p-8 sm:w-[520px] sm:max-w-[520px]"
      >
        <SheetTitle className="sr-only">Каталог</SheetTitle>
        <div className="grid grid-cols-2 gap-8">
          <nav aria-label="Сайт">
            <ul className="flex flex-col gap-y-3">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Каталог">
            <ul className="flex flex-col gap-y-3">
              {catalogItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
