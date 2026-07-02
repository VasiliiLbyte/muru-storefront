import type { Currency, Dimensions } from "@/lib/schemas";

const formatters = new Map<Currency, Intl.NumberFormat>();

function getFormatter(currency: Currency): Intl.NumberFormat {
  let fmt = formatters.get(currency);
  if (!fmt) {
    fmt = new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    formatters.set(currency, fmt);
  }
  return fmt;
}

/** Форматирует цену в рублях (или другой валюте контракта). */
export function formatPrice(amount: number, currency: Currency = "RUB"): string {
  return getFormatter(currency).format(amount);
}

/** Процент скидки для бейджа (округление вниз). */
export function discountPercent(price: number, oldPrice: number): number {
  if (oldPrice <= price) return 0;
  return Math.floor(((oldPrice - price) / oldPrice) * 100);
}

const DIMENSION_UNIT_LABEL: Record<Dimensions["unit"], string> = {
  cm: "см",
  mm: "мм",
  m: "м",
};

/** Габариты для отображения на PDP. */
export function formatDimensions(d: Dimensions): string {
  const unit = DIMENSION_UNIT_LABEL[d.unit];
  return `${d.l} × ${d.w} × ${d.h} ${unit}`;
}

/** Список цветов через запятую. */
export function formatColors(colors: string[]): string {
  return colors.join(", ");
}
