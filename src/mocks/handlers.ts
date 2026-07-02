import { http, HttpResponse, passthrough, type RequestHandler } from "msw";

import {
  categories,
  categoryBySlug,
  collectionBySlug,
  collections,
  lookbookBySlug,
  lookbooks,
  productBySku,
  productBySlug,
  staticPageBySlug,
} from "./fixtures";
import { listProducts } from "./resolve";

const notFound = () => new HttpResponse(null, { status: 404 });

const CATALOG_BASE = process.env.NEXT_PUBLIC_CATALOG_API_BASE;

export const handlers: RequestHandler[] = [
  http.get("*/catalog/products", () => passthrough()),
  http.get("*/catalog/products/:sku", () => passthrough()),
  ...(CATALOG_BASE
    ? [http.all(`${CATALOG_BASE}/*`, () => passthrough())]
    : []),
  // — Categories —
  http.get("*/categories", () => HttpResponse.json(categories)),
  http.get("*/categories/:slug", ({ params }) => {
    const category = categoryBySlug.get(String(params.slug));
    return category ? HttpResponse.json(category) : notFound();
  }),

  // — Products by SKU (before slug route) —
  http.get("*/products/by-sku/:sku", ({ params }) => {
    const product = productBySku.get(String(params.sku));
    return product ? HttpResponse.json(product) : notFound();
  }),

  // — Products listing —
  http.get("*/products", ({ request }) => {
    const sp = new URL(request.url).searchParams;
    return HttpResponse.json(listProducts(sp));
  }),
  http.get("*/products/:slug", ({ params }) => {
    const product = productBySlug.get(String(params.slug));
    return product ? HttpResponse.json(product) : notFound();
  }),

  // — Collections —
  http.get("*/collections", () => HttpResponse.json(collections)),
  http.get("*/collections/:slug", ({ params }) => {
    const collection = collectionBySlug.get(String(params.slug));
    return collection ? HttpResponse.json(collection) : notFound();
  }),

  // — Lookbooks —
  http.get("*/lookbooks", () => HttpResponse.json(lookbooks)),
  http.get("*/lookbooks/:slug", ({ params }) => {
    const lookbook = lookbookBySlug.get(String(params.slug));
    return lookbook ? HttpResponse.json(lookbook) : notFound();
  }),

  // — Static pages —
  http.get("*/pages/:slug", ({ params }) => {
    const page = staticPageBySlug.get(String(params.slug));
    return page ? HttpResponse.json(page) : notFound();
  }),

];
