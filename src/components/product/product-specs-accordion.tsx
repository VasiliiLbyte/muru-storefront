import { formatColors } from "@/lib/format";
import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type SpecRow = { label: string; value: string };

function buildSpecRows(product: Product): SpecRow[] {
  const rows: SpecRow[] = [];
  const seen = new Set<string>();

  for (const [label, value] of Object.entries(product.specs ?? {})) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    rows.push({ label, value: trimmed });
    seen.add(label.toLowerCase());
  }

  const colorValue =
    product.attributes.color && product.attributes.color.length > 0
      ? formatColors(product.attributes.color)
      : "";

  if (colorValue && !seen.has("цвет")) {
    rows.push({ label: "Цвет", value: colorValue });
  }

  return rows;
}

/**
 * Артикул / цвет + аккордеон «Характеристики» (свёрнут по умолчанию).
 */
export function ProductSpecsAccordion({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const colorValue =
    product.attributes.color && product.attributes.color.length > 0
      ? formatColors(product.attributes.color)
      : null;
  const rows = buildSpecRows(product);

  return (
    <div className={cn("mt-8 flex flex-col gap-4 border-t border-border pt-6", className)}>
      <p className="text-body text-text-secondary">
        Артикул:{" "}
        <span className="text-text-heading">{product.sku}</span>
      </p>
      {colorValue ? (
        <p className="text-body text-text-secondary">
          Цвет: <span className="text-text-heading">{colorValue}</span>
        </p>
      ) : null}

      {rows.length > 0 ? (
        <details className="group border-t border-border pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            <span>Характеристики</span>
            <span
              className="text-h2 leading-none font-light text-text-secondary group-open:hidden"
              aria-hidden
            >
              +
            </span>
            <span
              className="hidden text-h2 leading-none font-light text-text-secondary group-open:inline"
              aria-hidden
            >
              −
            </span>
          </summary>
          <dl className="mt-4 flex flex-col gap-3">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline gap-2 text-body"
              >
                <dt className="shrink-0 text-text-secondary">{row.label}</dt>
                <dd className="min-w-0 flex-1 border-b border-dotted border-border pb-0.5 text-right text-text-heading">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
    </div>
  );
}
