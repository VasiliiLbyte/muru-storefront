import { ProductGrid } from "@/components/catalog/product-grid";
import { getProducts } from "@/lib/api/endpoints";
import { ProductListQuerySchema, type Product } from "@/lib/schemas";

const SUGGESTION_COUNT = 8;
/** Берём выборку шире, чтобы после дедупликации осталось чем заполнить сетку. */
const SUGGESTION_POOL = 32;

/** Не больше стольких товаров из одной корневой категории. */
const MAX_PER_CATEGORY = 2;

/**
 * Отбор для витрины подсказок.
 *
 * Популярное отдаёт близкие SKU подряд: несколько «Ароматическая свеча в
 * стекле», следом четыре букета из сухоцветов — сетка читалась как одно
 * повторённое фото. Поэтому два ограничения:
 *   1) одно название — один товар;
 *   2) не больше `MAX_PER_CATEGORY` из одной корневой категории.
 * Если после фильтров товаров не хватило, добираем остатком по порядку
 * популярности, чтобы сетка не оказалась полупустой.
 */
function pickVaried(items: Product[], limit: number): Product[] {
  const seenTitle = new Set<string>();
  const perCategory = new Map<string, number>();
  const picked: Product[] = [];
  const rest: Product[] = [];

  for (const item of items) {
    const title = item.title.trim().toLowerCase();
    if (seenTitle.has(title)) continue;
    seenTitle.add(title);

    const top = item.categorySlugs[0] ?? "";
    const used = perCategory.get(top) ?? 0;
    if (used >= MAX_PER_CATEGORY) {
      rest.push(item);
      continue;
    }
    perCategory.set(top, used + 1);
    picked.push(item);
    if (picked.length === limit) return picked;
  }

  return [...picked, ...rest].slice(0, limit);
}

/**
 * Подборка на пустом поиске — «Возможно, вас заинтересует»
 * (по образцу kuchenland: пустая страница поиска не должна быть пустой).
 *
 * Логика подбора, этап 1 (сейчас): популярные товары в наличии, SSR,
 * без персонализации — данных о пользователе на этом экране нет,
 * а популярное это разумный дефолт для холодного старта.
 *
 * Этап 2 (когда добавим на бэкенде): подмешивать по последнему поисковому
 * запросу и просмотренным товарам. Точка расширения — только этот файл,
 * страница поиска про источник данных ничего не знает.
 */
export async function SearchSuggestions() {
  let items: Product[] = [];
  try {
    const res = await getProducts(
      ProductListQuerySchema.parse({
        page: 1,
        pageSize: SUGGESTION_POOL,
        sort: "popular",
        inStock: true,
      }),
    );
    items = pickVaried(res.items, SUGGESTION_COUNT);
  } catch (e) {
    console.error("[search-suggestions]", e);
    return null;
  }

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="search-suggestions-heading">
      <h2
        id="search-suggestions-heading"
        className="mb-6 font-display text-h2 text-text-heading"
      >
        Возможно, вас заинтересует
      </h2>
      <ProductGrid products={items} prioritizeLcp={false} />
    </section>
  );
}
