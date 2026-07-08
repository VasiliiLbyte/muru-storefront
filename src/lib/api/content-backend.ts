import { z } from "zod";

import {
  CollectionSchema,
  HomeBannerSchema,
  LookbookSchema,
  StaticPageSchema,
  type Collection,
  type HomeBanner,
  type Lookbook,
  type StaticPage,
} from "@/lib/schemas";

import { apiEnvelopeFetch } from "./client";

export function isContentBackendEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE);
}

export function fetchContentCollections(): Promise<Collection[]> {
  return apiEnvelopeFetch(
    "/content/collections",
    z.array(CollectionSchema),
  );
}

export function fetchContentCollection(slug: string): Promise<Collection> {
  return apiEnvelopeFetch(
    `/content/collections/${encodeURIComponent(slug)}`,
    CollectionSchema,
  );
}

export function fetchContentLookbooks(): Promise<Lookbook[]> {
  return apiEnvelopeFetch("/content/lookbooks", z.array(LookbookSchema));
}

export function fetchContentLookbook(slug: string): Promise<Lookbook> {
  return apiEnvelopeFetch(
    `/content/lookbooks/${encodeURIComponent(slug)}`,
    LookbookSchema,
  );
}

export function fetchContentPage(slug: string): Promise<StaticPage> {
  return apiEnvelopeFetch(
    `/content/pages/${encodeURIComponent(slug)}`,
    StaticPageSchema,
  );
}

export function fetchContentBanners(): Promise<HomeBanner[]> {
  return apiEnvelopeFetch("/content/banners", z.array(HomeBannerSchema));
}
