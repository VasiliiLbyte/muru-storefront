/**
 * Дерево категорий (seed) — раздел 4 ТЗ.
 *
 * Источник структуры (slug'и) — muru-url-inventory.csv / ТЗ; русские заголовки —
 * нейтральные названия разделов (это структура, не копируемый контент).
 * Лёгкий тип-узел, отдельный от CategorySchema: используется для меню/резолвера
 * каталога. Реальные данные категорий приходят из API (src/lib/api).
 */
export type TaxonomyNode = {
  slug: string;
  title: string;
  children?: TaxonomyNode[];
};

export const taxonomy: TaxonomyNode[] = [
  {
    slug: "vazy-i-aksessuary",
    title: "Вазы и аксессуары",
    children: [
      { slug: "vazy-i-kuvshiny", title: "Вазы и кувшины" },
      { slug: "podsvechniki", title: "Подсвечники" },
    ],
  },
  {
    slug: "interer",
    title: "Интерьер",
    children: [
      { slug: "postery", title: "Постеры" },
      { slug: "predmety-dekora", title: "Предметы декора" },
      { slug: "svet", title: "Свет" },
    ],
  },
  {
    slug: "kompleksnye-nabory",
    title: "Комплексные наборы",
    children: [
      { slug: "korporativnye-podarki", title: "Корпоративные подарки" },
    ],
  },
  {
    slug: "kukhnya-i-stolovaya",
    title: "Кухня и столовая",
    children: [
      { slug: "kukhonnye-aksessuary", title: "Кухонные аксессуары" },
      { slug: "podsvechniki1", title: "Подсвечники" },
      { slug: "posuda", title: "Посуда" },
      { slug: "servirovka", title: "Сервировка" },
      {
        slug: "tekstil-dlya-kukhni-i-stolovoy",
        title: "Текстиль для кухни и столовой",
      },
      { slug: "khranenie-i-poryadok", title: "Хранение и порядок" },
    ],
  },
  {
    slug: "naturalnyy-dekor",
    title: "Натуральный декор",
    children: [
      {
        slug: "korziny-i-pletenye-izdeliya",
        title: "Корзины и плетёные изделия",
      },
      { slug: "svechi", title: "Свечи" },
      { slug: "sukhotsvety", title: "Сухоцветы" },
    ],
  },
  {
    slug: "podarochnye-karty",
    title: "Подарочные карты",
  },
  {
    slug: "rasprodazha",
    title: "Распродажа",
  },
  {
    slug: "tekstil",
    title: "Текстиль",
    children: [{ slug: "spalnya", title: "Спальня" }],
  },
  {
    slug: "floristika-dlya-doma",
    title: "Флористика для дома",
    children: [
      { slug: "gorshki-i-kashpo", title: "Горшки и кашпо" },
      { slug: "floristicheskiy-instrument", title: "Флористический инструмент" },
    ],
  },
];

/** Плоский список всех узлов дерева (топ + подкатегории). */
export function flattenTaxonomy(nodes: TaxonomyNode[] = taxonomy): TaxonomyNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenTaxonomy(node.children) : []),
  ]);
}

/** Поиск узла по slug на любом уровне дерева. */
export function findNodeBySlug(
  slug: string,
  nodes: TaxonomyNode[] = taxonomy,
): TaxonomyNode | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    if (node.children) {
      const found = findNodeBySlug(slug, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

/** Топ-категория (предок верхнего уровня) для slug листа или узла. */
export function topCategoryOf(slug: string): string {
  for (const top of taxonomy) {
    if (top.slug === slug) return top.slug;
    if (top.children?.some((c) => c.slug === slug)) return top.slug;
  }
  return slug;
}
