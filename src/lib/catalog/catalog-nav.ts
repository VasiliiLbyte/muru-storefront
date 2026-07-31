import type { Category } from "@/lib/schemas";

/** Nav node for catalog menus / route resolve (API or mock categories). */
export type CatalogNavNode = {
  slug: string;
  title: string;
  children?: CatalogNavNode[];
};

/** Build top-level nav tree from flat Category list. */
export function categoriesToNavTree(categories: Category[]): CatalogNavNode[] {
  const tops = categories
    .filter((c) => !c.parentSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return tops.map((top) => ({
    slug: top.slug,
    title: top.title,
    children: categories
      .filter((c) => c.parentSlug === top.slug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ slug: c.slug, title: c.title })),
  }));
}

/**
 * DFS lookup by slug anywhere in the tree.
 * Do **not** use for top-level catalog URLs (`/catalog/{slug}/`) when the same
 * slug may also appear as a child under another parent — prefer `tree.find` /
 * {@link isTopLevelNavSlug} so the top node wins.
 */
export function findNavNodeBySlug(
  slug: string,
  nodes: CatalogNavNode[],
): CatalogNavNode | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    if (node.children) {
      const found = findNavNodeBySlug(slug, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

export function isTopLevelNavSlug(
  slug: string,
  nodes: CatalogNavNode[],
): boolean {
  return nodes.some((n) => n.slug === slug);
}

export function childNavOf(
  parentSlug: string,
  childSlug: string,
  nodes: CatalogNavNode[],
): CatalogNavNode | undefined {
  const parent = nodes.find((n) => n.slug === parentSlug);
  return parent?.children?.find((c) => c.slug === childSlug);
}

/** Top category slug for a leaf (or self if already top). */
export function topCategorySlugOf(
  slug: string,
  categories: Category[],
): string {
  const node = categories.find((c) => c.slug === slug);
  if (!node) return slug;
  if (!node.parentSlug) return node.slug;
  return node.parentSlug;
}
