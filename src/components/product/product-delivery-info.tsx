import Link from "next/link";

import {
  DELIVERY_HELP_LINKS,
  DELIVERY_SUMMARY_ROWS,
} from "@/lib/content/delivery-summary";
import { cn } from "@/lib/utils";

/**
 * Блок условий доставки на карточке товара (стилистика kuchenland:
 * подпись слева, значение справа, серая подстрока снизу).
 * Точная стоимость считается в чекауте по адресу — здесь только условия.
 */
export function ProductDeliveryInfo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <dl className="flex flex-col gap-3 border-t border-border pt-4">
        {DELIVERY_SUMMARY_ROWS.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-body text-text-heading">{row.label}</dt>
              <dd className="text-right text-body text-text-secondary">
                {row.value}
              </dd>
            </div>
            {row.note ? (
              <p className="text-small text-text-muted">{row.note}</p>
            ) : null}
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4">
        {DELIVERY_HELP_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center text-small text-text-secondary underline underline-offset-4 transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
