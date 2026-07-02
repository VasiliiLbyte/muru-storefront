import { z } from "zod";

import {
  CategorySchema,
  ProductSchema,
  type Category,
  type Product,
} from "@/lib/schemas";

import { ApiError } from "./client";

export const CATALOG_API_BASE =
  process.env.NEXT_PUBLIC_CATALOG_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "";

export function isCatalogBackendEnabled(): boolean {
  return Boolean(CATALOG_API_BASE);
}

const slugify = (v: string) =>
  (v
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9а-яё-]/gi, "") || "bez-kategorii");

type BackendTreeNode = {
  name: string;
  slug: string;
  children: BackendTreeNode[];
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

export const BackendProductSchema = z
  .object({
    sku: z.string(),
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

function adaptTreeNode(
  node: BackendTreeNode,
  sortOrder: number,
  parentSlug?: string,
): Category {
  return CategorySchema.parse({
    id: node.slug,
    slug: node.slug,
    title: node.name,
    parentSlug,
    sortOrder,
    seo: { title: node.name, description: node.name },
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

export function adaptProduct(b: BackendProduct | BackendProductDetail): Product {
  const categorySlugs: string[] = [slugify(b.category)];
  if (b.subcategorySlug) categorySlugs.push(b.subcategorySlug);

  const detail = b as BackendProductDetail;

  return ProductSchema.parse({
    id: b.sku,
    sku: b.sku,
    slug: b.sku,
    title: b.name,
    price: b.price,
    oldPrice:
      b.discountPercent > 0
        ? Math.round(b.price / (1 - b.discountPercent / 100))
        : undefined,
    isOnSale: b.discountPercent > 0,
    inStock: b.inStock > 0,
    currency: "RUB",
    unit: "pcs",
    images: b.imageUrls.map((url) => ({ url, alt: b.name })),
    categorySlugs,
    description: detail.description ?? undefined,
    attributes: {
      color: b.colors?.length ? b.colors : undefined,
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

export async function fetchCatalogTree(): Promise<Category[]> {
  const nodes = await catalogFetch(
    "/catalog/tree?subcategories=1",
    z.array(BackendTreeNodeSchema),
  );
  return adaptTree(nodes);
}

export async function fetchCatalogProducts(): Promise<Product[]> {
  const items = await catalogFetch(
    "/catalog/products",
    z.array(BackendProductSchema),
  );
  return items.map(adaptProduct);
}

export async function fetchCatalogProductBySku(sku: string): Promise<Product> {
  const normalizedSku = sku.trim().toUpperCase();
  const item = await catalogFetch(
    `/catalog/products/${encodeURIComponent(normalizedSku)}`,
    BackendProductDetailSchema,
  );
  return adaptProduct(item);
}
