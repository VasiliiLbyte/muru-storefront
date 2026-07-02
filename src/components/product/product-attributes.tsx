import { formatColors, formatDimensions } from "@/lib/format";
import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type AttributeRow = { label: string; value: string };

function buildRows(product: Product): AttributeRow[] {
  const { attributes } = product;
  const rows: AttributeRow[] = [];

  if (attributes.material) {
    rows.push({ label: "Материал", value: attributes.material });
  }
  if (attributes.dimensions) {
    rows.push({
      label: "Габариты",
      value: formatDimensions(attributes.dimensions),
    });
  }
  if (attributes.color && attributes.color.length > 0) {
    rows.push({ label: "Цвет", value: formatColors(attributes.color) });
  }

  return rows;
}

export function ProductAttributes({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const rows = buildRows(product);
  if (rows.length === 0) return null;

  return (
    <dl
      className={cn(
        "grid gap-3 border-t border-border pt-6 text-body",
        className,
      )}
    >
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(0,8rem)_1fr] gap-2">
          <dt className="text-text-secondary">{row.label}</dt>
          <dd className="text-text-heading">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
