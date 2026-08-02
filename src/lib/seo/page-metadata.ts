import type { Metadata } from "next";

import { absoluteUrl, isSiteNoindex, siteUrl } from "@/lib/site";

/** Default square brand mark for share previews when page has no ogImage. */
export const DEFAULT_OG_IMAGE_PATH = "/android-chrome-512x512.png";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  robots?: Metadata["robots"];
  /** Длинный title без суффикса template (главная). */
  titleAbsolute?: boolean;
};

/** Absolute URL for a static asset — no trailing slash. */
export function absoluteAssetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized.replace(/\/$/, "")}`;
}

function resolveOgImageUrl(ogImage: string | undefined): {
  url: string;
  hasExplicitImage: boolean;
} {
  if (!ogImage) {
    return {
      url: absoluteAssetUrl(DEFAULT_OG_IMAGE_PATH),
      hasExplicitImage: false,
    };
  }
  if (ogImage.startsWith("http://") || ogImage.startsWith("https://")) {
    return { url: ogImage, hasExplicitImage: true };
  }
  // Relative paths: assets without trailing slash; page paths via absoluteUrl.
  if (/\.(png|jpe?g|webp|gif|svg|ico)(\?.*)?$/i.test(ogImage)) {
    return { url: absoluteAssetUrl(ogImage), hasExplicitImage: true };
  }
  return { url: absoluteUrl(ogImage), hasExplicitImage: true };
}

/** Уникальные метаданные страницы: canonical, OG, Twitter. */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage,
  robots,
  titleAbsolute = false,
}: PageMetadataInput): Metadata {
  const pageTitle = title.replace(/ — MURU$/, "");
  const canonical = absoluteUrl(path);
  const { url: imageUrl, hasExplicitImage } = resolveOgImageUrl(ogImage);
  const ogTitle = title.includes("MURU") ? title : `${pageTitle} — MURU`;
  const resolvedRobots =
    robots ??
    (isSiteNoindex() ? { index: false, follow: false } : undefined);

  return {
    title: titleAbsolute ? { absolute: title } : pageTitle,
    description,
    alternates: { canonical },
    robots: resolvedRobots,
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      url: canonical,
      siteName: "MURU",
      locale: "ru_RU",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: hasExplicitImage ? "summary_large_image" : "summary",
      title: titleAbsolute ? title : pageTitle,
      description,
      images: [imageUrl],
    },
  };
}
