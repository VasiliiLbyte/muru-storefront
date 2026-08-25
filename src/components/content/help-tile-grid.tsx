import Link from "next/link";
import type { ComponentType } from "react";

import {
  IconCard,
  IconDelivery,
  IconGift,
  IconReturn,
  IconReview,
  IconService,
  type MuruIconProps,
} from "@/components/icons";
import { cn } from "@/lib/utils";

export type HelpTile = {
  title: string;
  description?: string;
  href: string;
};

function iconForTitle(title: string): ComponentType<MuruIconProps> {
  const key = title.toLowerCase();
  if (key.includes("доставк")) return IconDelivery;
  if (key.includes("отзыв")) return IconReview;
  if (key.includes("обслуживан") || key.includes("услови")) return IconService;
  if (key.includes("корпоратив")) return IconGift;
  if (key.includes("возврат")) return IconReturn;
  if (key.includes("карт")) return IconCard;
  if (key.includes("подар")) return IconGift;
  return IconService;
}

/**
 * Плитки «Клиентам»: иконка + uppercase title + brand «Подробнее».
 */
export function HelpTileGrid({
  items,
  className,
}: {
  items: HelpTile[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = iconForTitle(item.title);
        return (
          <Link
            key={item.title}
            href={item.href}
            className="group flex flex-col gap-4 border border-border bg-background p-6 transition-colors hover:border-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Icon className="size-8 text-text-secondary" aria-hidden />
            <span className="font-display text-body tracking-[0.08em] text-text-heading uppercase transition-colors group-hover:text-brand">
              {item.title}
            </span>
            <span className="mt-auto inline-flex h-[45px] w-fit items-center bg-brand px-8 text-body text-text-inverse transition-colors group-hover:bg-brand-hover">
              Подробнее
            </span>
          </Link>
        );
      })}
    </div>
  );
}
