import { z } from "zod";

import {
  CategorySchema,
  ProductSchema,
  type Category,
  type Product,
} from "@/lib/schemas";

import { SALE_CATEGORY_SLUG } from "@/lib/catalog/sale-category";
import { resolveCatalogImageUrl } from "@/lib/images";

import { ApiError } from "./client";

export const CATALOG_API_BASE =
  process.env.NEXT_PUBLIC_CATALOG_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "";

export function isCatalogBackendEnabled(): boolean {
  return Boolean(CATALOG_API_BASE);
}

export type BackendTreeNode = {
  name: string;
  slug: string;
  children: BackendTreeNode[];
  coverImageUrl?: string | null;
};

export const BackendTreeNodeSchema: z.ZodType<BackendTreeNode> = z.lazy(() =>
  z
    .object({
      name: z.string(),
      slug: z.string(),
      children: z.array(BackendTreeNodeSchema).default([]),
    })
    .passthrough(),
);

const WebSubcategoryRefSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

const WebCrossPlacementRefSchema = z.object({
  category: z.string(),
  categorySlug: z.string(),
  subcategoryName: z.string().optional(),
  subcategorySlug: z.string().optional(),
});

export const BackendProductSchema = z
  .object({
    sku: z.string(),
    slug: z.string(),
    name: z.string(),
    price: z.number(),
    discountPercent: z.number(),
    inStock: z.number(),
    imageUrls: z.array(z.string()),
    colors: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    category: z.string(),
    subcategory: z.string().optional(),
    subcategorySlug: z.string().optional(),
    webPrimarySubcategory: WebSubcategoryRefSchema.optional(),
    webSubcategorySlugs: z.array(z.string()).optional(),
    webCrossPlacement: WebCrossPlacementRefSchema.optional(),
    color: z.string().optional(),
    dimensionsLabel: z.string().optional(),
  })
  .passthrough();

export const BackendProductDetailSchema = BackendProductSchema.extend({
  description: z.string().optional(),
  specs: z.record(z.string(), z.string()).optional(),
  variants: z.array(z.unknown()).default([]),
  weightGrams: z.number().optional(),
}).passthrough();

export type BackendProduct = z.infer<typeof BackendProductSchema>;
export type BackendProductDetail = z.infer<typeof BackendProductDetailSchema>;

export type CategorySlugMaps = {
  /** leaf slug → top slug */
  topByLeaf: Map<string, string>;
  /** lowercased category name → top slug */
  topByName: Map<string, string>;
};

export function buildCategorySlugMaps(
  nodes: BackendTreeNode[],
): CategorySlugMaps {
  const topByLeaf = new Map<string, string>();
  const topByName = new Map<string, string>();

  for (const top of nodes) {
    topByName.set(top.name.trim().toLowerCase(), top.slug);
    topByLeaf.set(top.slug, top.slug);
    for (const child of top.children) {
      topByLeaf.set(child.slug, top.slug);
      topByName.set(child.name.trim().toLowerCase(), top.slug);
    }
  }

  return { topByLeaf, topByName };
}

function adaptTreeNode(
  node: BackendTreeNode,
  sortOrder: number,
  parentSlug?: string,
): Category {
  const coverUrl = resolveCatalogImageUrl(node.coverImageUrl);

  return CategorySchema.parse({
    id: node.slug,
    slug: node.slug,
    title: node.name,
    parentSlug,
    sortOrder,
    seo: { title: node.name, description: node.name },
    image: coverUrl ? { url: coverUrl, alt: node.name } : undefined,
  });
}

export function adaptTree(nodes: BackendTreeNode[]): Category[] {
  const result: Category[] = [];

  const walk = (items: BackendTreeNode[], parentSlug?: string) => {
    items.forEach((node, index) => {
      result.push(adaptTreeNode(node, index, parentSlug));
      if (node.children.length > 0) {
        walk(node.children, node.slug);
      }
    });
  };

  walk(nodes);
  return result;
}

function resolveCategorySlugs(
  b: BackendProduct | BackendProductDetail,
  maps?: CategorySlugMaps,
): string[] {
  const leaf = b.webPrimarySubcategory?.slug ?? b.subcategorySlug;
  const topFromLeaf =
    leaf && maps ? maps.topByLeaf.get(leaf) : undefined;
  const topFromName = maps
    ? maps.topByName.get(b.category.trim().toLowerCase())
    : undefined;
  const top =
    topFromLeaf ??
    topFromName ??
    b.webCrossPlacement?.categorySlug ??
    undefined;

  const ordered: string[] = [];
  const seen = new Set<string>();
  const add = (s: string | undefined) => {
    if (!s || seen.has(s)) return;
    seen.add(s);
    ordered.push(s);
  };

  add(top);
  add(leaf);
  for (const s of b.webSubcategorySlugs ?? []) {
    add(s);
    if (maps) add(maps.topByLeaf.get(s));
  }
  add(b.webCrossPlacement?.categorySlug);
  add(b.webCrossPlacement?.subcategorySlug);

  return ordered;
}

export function adaptProduct(
  b: BackendProduct | BackendProductDetail,
  maps?: CategorySlugMaps,
): Product {
  let categorySlugs = resolveCategorySlugs(b, maps);
  const detail = b as BackendProductDetail;
  const list = b.price;
  const d = b.discountPercent ?? 0;
  const sale =
    d > 0 ? Math.round(list * (1 - d / 100) * 100) / 100 : list;

  // Orphan sale («Без категории» вне публичного tree) → virtual Sale path.
  if (categorySlugs.length === 0 && d > 0) {
    categorySlugs = [SALE_CATEGORY_SLUG, SALE_CATEGORY_SLUG];
  }

  return ProductSchema.parse({
    id: b.sku,
    sku: b.sku,
    slug: b.slug,
    title: b.name,
    price: sale,
    oldPrice: d > 0 ? list : undefined,
    isOnSale: d > 0,
    giftGuide: Boolean(
      (b as { giftGuide?: boolean }).giftGuide ??
        (b as { is_gift_guide?: boolean }).is_gift_guide,
    ),
    newArrival: Boolean(
      (b as { newArrival?: boolean }).newArrival ??
        (b as { is_new_arrival?: boolean }).is_new_arrival ??
        (b as { isNewArrival?: boolean }).isNewArrival,
    ),
    newArrivalAt: (() => {
      const raw =
        (b as { newArrivalAt?: string | null }).newArrivalAt ??
        (b as { new_arrival_at?: string | null }).new_arrival_at;
      return raw ?? null;
    })(),
    inStock: b.inStock > 0,
    currency: "RUB",
    unit: "pcs",
    images: b.imageUrls
      .map((url) => resolveCatalogImageUrl(url))
      .filter((url): url is string => Boolean(url))
      .map((url) => ({ url, alt: b.name })),
    categorySlugs,
    description: detail.description ?? undefined,
    specs: (() => {
      const specs: Record<string, string> = Object.fromEntries(
        Object.entries(detail.specs ?? {}).filter(
          ([, value]) => typeof value === "string" && value.trim() !== "",
        ),
      );
      const hasSize = Object.keys(specs).some(
        (k) => k.toLowerCase() === "размер",
      );
      if (!hasSize) {
        const fromLabel = b.dimensionsLabel?.trim();
        const fromSizes = b.sizes?.find((s) => s.trim())?.trim();
        if (fromLabel) specs["Размер"] = fromLabel;
        else if (fromSizes) specs["Размер"] = fromSizes;
      }
      return Object.keys(specs).length > 0 ? specs : undefined;
    })(),
    attributes: {
      color: b.colors?.length
        ? b.colors
        : b.color
          ? [b.color]
          : undefined,
      material: detail.specs?.["Материал"],
      weight: detail.weightGrams
        ? { value: detail.weightGrams, unit: "g" }
        : undefined,
    },
    seo: {
      title: b.name,
      description: detail.description ?? b.name,
    },
  });
}

async function catalogFetch<T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const url = `${CATALOG_API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new ApiError(res.status, url);
  }

  const json: unknown = await res.json();
  const envelope = z
    .object({
      success: z.boolean(),
      data: z.unknown(),
    })
    .passthrough()
    .safeParse(json);

  const payload =
    envelope.success && envelope.data.data !== undefined
      ? envelope.data.data
      : json;

  return schema.parse(payload);
}

export async function fetchRawTree(): Promise<BackendTreeNode[]> {
  return catalogFetch(
    "/catalog/tree?subcategories=1",
    z.array(BackendTreeNodeSchema),
  );
}

export async function fetchCatalogTree(): Promise<Category[]> {
  const nodes = await fetchRawTree();
  return adaptTree(nodes);
}

export async function fetchCatalogProducts(): Promise<Product[]> {
  const [nodes, items] = await Promise.all([
    fetchRawTree(),
    catalogFetch(
      "/catalog/products?channel=web",
      z.array(BackendProductSchema),
    ),
  ]);
  const maps = buildCategorySlugMaps(nodes);
  return items.map((item) => adaptProduct(item, maps));
}

export async function fetchCatalogProductBySku(sku: string): Promise<Product> {
  const normalizedSku = sku.trim().toUpperCase();
  const [nodes, item] = await Promise.all([
    fetchRawTree(),
    catalogFetch(
      `/catalog/products/${encodeURIComponent(normalizedSku)}?channel=web`,
      BackendProductDetailSchema,
    ),
  ]);
  return adaptProduct(item, buildCategorySlugMaps(nodes));
}

/** Public PDP lookup by latin URL slug. */
export async function fetchCatalogProductBySlug(
  slug: string,
): Promise<Product> {
  const normalized = slug.trim();
  const [nodes, item] = await Promise.all([
    fetchRawTree(),
    catalogFetch(
      `/catalog/products/by-slug/${encodeURIComponent(normalized)}?channel=web`,
      BackendProductDetailSchema,
    ),
  ]);
  return adaptProduct(item, buildCategorySlugMaps(nodes));
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export type SearchSuggestProduct = {
  sku: string;
  name: string;
  slug: string;
  price: number;
  discountPercent: number;
  imageUrl: string | null;
  categorySlug: string;
  subcategorySlug: string;
};

export type SearchSuggestCategory = {
  name: string;
  categorySlug: string;
  subcategoryName?: string;
  subcategorySlug?: string;
};

export type SearchSuggestResult = {
  products: SearchSuggestProduct[];
  categories: SearchSuggestCategory[];
};

const SearchSuggestProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number(),
  discountPercent: z.number(),
  imageUrl: z.string().nullable(),
  categorySlug: z.string(),
  subcategorySlug: z.string(),
});

const SearchSuggestCategorySchema = z.object({
  name: z.string(),
  categorySlug: z.string(),
  subcategoryName: z.string().optional(),
  subcategorySlug: z.string().optional(),
});

const SearchSuggestResultSchema = z.object({
  products: z.array(SearchSuggestProductSchema),
  categories: z.array(SearchSuggestCategorySchema),
});

const CatalogSearchResponseSchema = z.object({
  items: z.array(BackendProductSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type CatalogSearchResponse = z.infer<typeof CatalogSearchResponseSchema>;

export async function fetchCatalogSearch(params: {
  q: string;
  page?: number;
  pageSize?: number;
}): Promise<CatalogSearchResponse> {
  const sp = new URLSearchParams({ q: params.q, channel: "web" });
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  return catalogFetch(
    `/catalog/search?${sp.toString()}`,
    CatalogSearchResponseSchema,
  );
}

export async function fetchCatalogSearchSuggest(
  q: string,
): Promise<SearchSuggestResult> {
  const sp = new URLSearchParams({ q, channel: "web" });
  return catalogFetch(
    `/catalog/search/suggest?${sp.toString()}`,
    SearchSuggestResultSchema,
  );
}
