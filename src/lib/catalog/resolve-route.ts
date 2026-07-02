import { isCatalogBackendEnabled } from "@/lib/api/catalog-backend";
import { findNodeBySlug, taxonomy, type TaxonomyNode } from "@/lib/taxonomy";

export type CatalogRoute =
  | { type: "root" }
  | {
      type: "category";
      slug: string;
      node: TaxonomyNode;
      children: TaxonomyNode[];
    }
  | {
      type: "subcategory";
      parentSlug: string;
      parentNode: TaxonomyNode;
      subSlug: string;
      node: TaxonomyNode;
    }
  | {
      type: "product";
      parentSlug: string;
      subSlug: string;
      productSlug: string;
    };

function isTopLevel(slug: string): boolean {
  return taxonomy.some((n) => n.slug === slug);
}

function childOf(parentSlug: string, childSlug: string): TaxonomyNode | undefined {
  const parent = findNodeBySlug(parentSlug);
  return parent?.children?.find((c) => c.slug === childSlug);
}

/**
 * Резолвит catch-all slug каталога в тип страницы.
 * @throws never — невалидные пути возвращают null (→ notFound).
 */
export function resolveCatalogRoute(slug: string[] | undefined): CatalogRoute | null {
  const segments = (slug ?? []).map((s) => {
    try {
      return decodeURIComponent(s).normalize("NFC");
    } catch {
      return s.normalize("NFC");
    }
  });

  if (segments.length === 0) {
    return { type: "root" };
  }

  if (isCatalogBackendEnabled()) {
    if (segments.length === 1) {
      return {
        type: "category",
        slug: segments[0],
        node: { slug: segments[0], title: segments[0], children: [] },
        children: [],
      };
    }

    if (segments.length === 2) {
      return {
        type: "subcategory",
        parentSlug: segments[0],
        parentNode: { slug: segments[0], title: segments[0], children: [] },
        subSlug: segments[1],
        node: { slug: segments[1], title: segments[1], children: [] },
      };
    }

    if (segments.length === 3) {
      return {
        type: "product",
        parentSlug: segments[0],
        subSlug: segments[1],
        productSlug: segments[2],
      };
    }

    return null;
  }

  if (segments.length === 1) {
    const node = findNodeBySlug(segments[0]);
    if (!node || !isTopLevel(segments[0])) return null;
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
    const parentNode = findNodeBySlug(parentSlug);
    const subNode = childOf(parentSlug, subSlug);
    if (!parentNode || !subNode || !isTopLevel(parentSlug)) return null;
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
    if (!isTopLevel(parentSlug)) return null;
    const subNode = childOf(parentSlug, subSlug);
    const isTopLeaf = parentSlug === subSlug && findNodeBySlug(parentSlug);
    if (!subNode && !isTopLeaf) return null;
    return { type: "product", parentSlug, subSlug, productSlug };
  }

  return null;
}
