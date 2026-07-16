import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Gift,
  MessageSquare,
  RotateCcw,
  Settings,
  Truck,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type HelpTile = {
  title: string;
  description?: string;
  href: string;
};

function iconForTitle(title: string): LucideIcon {
  const key = title.toLowerCase();
  if (key.includes("доставк")) return Truck;
  if (key.includes("отзыв")) return MessageSquare;
  if (key.includes("обслуживан") || key.includes("услови")) return Settings;
  if (key.includes("корпоратив")) return Gift;
  if (key.includes("возврат")) return RotateCcw;
  if (key.includes("карт")) return CreditCard;
  if (key.includes("подар")) return Gift;
  return Settings;
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
            <Icon
              className="size-8 text-text-secondary"
              strokeWidth={1.25}
              aria-hidden
            />
            <span className="font-display text-body tracking-[0.08em] text-text-heading uppercase transition-colors group-hover:text-brand">
              {item.title}
            </span>
            <span className="mt-auto inline-flex h-10 w-fit items-center bg-brand px-5 text-body text-text-inverse transition-colors group-hover:bg-brand-hover">
              Подробнее
            </span>
          </Link>
        );
      })}
    </div>
  );
}
