import { getCategories } from "@/lib/api/endpoints";
import {
  categoriesToNavTree,
  childNavOf,
  findNavNodeBySlug,
  isTopLevelNavSlug,
  type CatalogNavNode,
} from "@/lib/catalog/catalog-nav";

export type CatalogRoute =
  | { type: "root" }
  | {
      type: "category";
      slug: string;
      node: CatalogNavNode;
      children: CatalogNavNode[];
    }
  | {
      type: "subcategory";
      parentSlug: string;
      parentNode: CatalogNavNode;
      subSlug: string;
      node: CatalogNavNode;
    }
  | {
      type: "product";
      parentSlug: string;
      subSlug: string;
      productSlug: string;
    };

/**
 * Pure segment → route resolve against an already-built nav tree.
 * Single-segment paths use top-level lookup only (not DFS) so a top
 * category is not shadowed by a same-slug leaf under another parent.
 */
export function resolveCatalogSegments(
  segments: string[],
  tree: CatalogNavNode[],
): CatalogRoute | null {
  if (segments.length === 0) {
    return { type: "root" };
  }

  if (segments.length === 1) {
    const node = tree.find((n) => n.slug === segments[0]);
    if (!node) return null;
    return {
      type: "category",
      slug: segments[0],
      node,
      children: node.children ?? [],
    };
  }

  if (segments.length === 2) {
    const parentSlug = segments[0];
    const subSlug = segments[1];
    const parentNode = tree.find((n) => n.slug === parentSlug);
    const subNode = childNavOf(parentSlug, subSlug, tree);
    if (!parentNode || !subNode || !isTopLevelNavSlug(parentSlug, tree)) {
      return null;
    }
    return {
      type: "subcategory",
      parentSlug,
      parentNode,
      subSlug,
      node: subNode,
    };
  }

  if (segments.length === 3) {
    const parentSlug = segments[0];
    const subSlug = segments[1];
    const productSlug = segments[2];
    if (!isTopLevelNavSlug(parentSlug, tree)) return null;
    const subNode = childNavOf(parentSlug, subSlug, tree);
    const isTopLeaf =
      parentSlug === subSlug && findNavNodeBySlug(parentSlug, tree);
    if (!subNode && !isTopLeaf) return null;
    return { type: "product", parentSlug, subSlug, productSlug };
  }

  return null;
}

/**
 * Резолвит catch-all slug каталога в тип страницы.
 * Валидирует сегменты против дерева категорий (API или MSW-фикстуры).
 * Невалидные пути → null (→ notFound).
 */
export async function resolveCatalogRoute(
  slug: string[] | undefined,
): Promise<CatalogRoute | null> {
  const segments = (slug ?? []).map((s) => {
    try {
      return decodeURIComponent(s).normalize("NFC");
    } catch {
      return s.normalize("NFC");
    }
  });

  let tree: CatalogNavNode[];
  try {
    tree = categoriesToNavTree(await getCategories());
  } catch {
    return null;
  }

  return resolveCatalogSegments(segments, tree);
}
