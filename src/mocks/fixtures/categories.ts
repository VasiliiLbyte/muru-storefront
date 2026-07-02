import type { Category } from "@/lib/schemas";
import { taxonomy, topCategoryOf, type TaxonomyNode } from "@/lib/taxonomy";

import { makeImage } from "./placeholders";

/**
 * Категории каталога — строго из taxonomy (раздел 4 ТЗ).
 * Заголовки/структура из taxonomy; данные категории (seo/external_id) синтезируем.
 */

function toCategory(
  node: TaxonomyNode,
  index: number,
  parentSlug?: string,
): Category {
  return {
    id: `cat-${node.slug}`,
    slug: node.slug,
    title: node.title,
    parentSlug,
    sortOrder: index,
    seo: {
      title: `${node.title} — MURU`,
      description: `${node.title}: подборка предметов декора MURU.`,
    },
    image: makeImage(node.title),
    external_id: `1c-cat-${node.slug}`,
  };
}

function collect(nodes: TaxonomyNode[], parentSlug?: string): Category[] {
  return nodes.flatMap((node, index) => [
    toCategory(node, index, parentSlug),
    ...(node.children ? collect(node.children, node.slug) : []),
  ]);
}

/** Плоский список всех категорий (топ + подкатегории). */
export const categories: Category[] = collect(taxonomy);

export const categoryBySlug = new Map<string, Category>(
  categories.map((c) => [c.slug, c]),
);

/** Slug'и листьев: подкатегории + топ-категории без детей. */
export function getLeafSlugs(): string[] {
  const leaves: string[] = [];
  const walk = (nodes: TaxonomyNode[]) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) walk(node.children);
      else leaves.push(node.slug);
    }
  };
  walk(taxonomy);
  return leaves;
}

/** Slug категории + всех её потомков (для фильтра листинга по топ-категории). */
export function descendantSlugs(slug: string): string[] {
  const find = (nodes: TaxonomyNode[]): TaxonomyNode | undefined => {
    for (const node of nodes) {
      if (node.slug === slug) return node;
      if (node.children) {
        const found = find(node.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  const root = find(taxonomy);
  if (!root) return [slug];
  const out: string[] = [];
  const walk = (node: TaxonomyNode) => {
    out.push(node.slug);
    node.children?.forEach(walk);
  };
  walk(root);
  return out;
}

export { topCategoryOf };
