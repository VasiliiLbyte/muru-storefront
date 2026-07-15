import { z } from "zod";

import { ASSETS_BASE, resolveAssetUrl } from "@/lib/assets-base";
import { resolveCatalogImageUrl } from "@/lib/images";
import {
  CollectionSchema,
  HomeBannerSchema,
  LookbookSchema,
  StaticPageSchema,
  type Collection,
  type HomeBanner,
  type Hotspot,
  type Image,
  type Lookbook,
  type StaticPage,
} from "@/lib/schemas";

import { apiEnvelopeFetch } from "./client";

function resolveImage(image: Image | undefined): Image | undefined {
  if (!image) return undefined;
  return { ...image, url: resolveAssetUrl(image.url) };
}

function resolveCollection(dto: Collection): Collection {
  return {
    ...dto,
    heroImage: resolveImage(dto.heroImage),
  };
}

function resolveHotspot(h: Hotspot): Hotspot {
  return {
    ...h,
    product: {
      ...h.product,
      image: h.product.image
        ? (resolveCatalogImageUrl(h.product.image) ?? undefined)
        : undefined,
    },
  };
}

function resolveLookbook(dto: Lookbook): Lookbook {
  return {
    ...dto,
    cover: resolveImage(dto.cover),
    banner: resolveImage(dto.banner),
    images: dto.images.map((image) => resolveImage(image)!),
    hotspots: dto.hotspots?.map(resolveHotspot),
  };
}

function resolveBanner(dto: HomeBanner): HomeBanner {
  return {
    ...dto,
    image: resolveImage(dto.image),
  };
}

function resolvePage(dto: StaticPage): StaticPage {
  return {
    ...dto,
    body: dto.body.replace(
      /src="\/uploads\//g,
      `src="${ASSETS_BASE}/uploads/`,
    ),
  };
}

export function isContentBackendEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE);
}

export async function fetchContentCollections(): Promise<Collection[]> {
  const items = await apiEnvelopeFetch(
    "/content/collections",
    z.array(CollectionSchema),
  );
  return items.map(resolveCollection);
}

export async function fetchContentCollection(slug: string): Promise<Collection> {
  const item = await apiEnvelopeFetch(
    `/content/collections/${encodeURIComponent(slug)}`,
    CollectionSchema,
  );
  return resolveCollection(item);
}

export async function fetchContentLookbooks(): Promise<Lookbook[]> {
  const items = await apiEnvelopeFetch(
    "/content/lookbooks",
    z.array(LookbookSchema),
  );
  return items.map(resolveLookbook);
}

export async function fetchContentLookbook(slug: string): Promise<Lookbook> {
  const item = await apiEnvelopeFetch(
    `/content/lookbooks/${encodeURIComponent(slug)}`,
    LookbookSchema,
  );
  return resolveLookbook(item);
}

export async function fetchContentPage(slug: string): Promise<StaticPage> {
  const page = await apiEnvelopeFetch(
    `/content/pages/${encodeURIComponent(slug)}`,
    StaticPageSchema,
  );
  return resolvePage(page);
}

export async function fetchContentBanners(): Promise<HomeBanner[]> {
  const items = await apiEnvelopeFetch(
    "/content/banners",
    z.array(HomeBannerSchema),
  );
  return items.map(resolveBanner);
}
