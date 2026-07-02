import Link from "next/link";

import { cn } from "@/lib/utils";

export type InfoTile = {
  title: string;
  description?: string;
  href: string;
};

export function InfoTileGrid({
  items,
  className,
}: {
  items: InfoTile[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="group flex flex-col gap-2 border border-border bg-background p-6 transition-colors hover:border-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="text-caption font-medium tracking-[0.12em] text-text-heading uppercase transition-colors group-hover:text-brand">
            {item.title}
          </span>
          {item.description ? (
            <span className="text-small text-text-muted">{item.description}</span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
