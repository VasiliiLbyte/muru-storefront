/**
 * Custom next/image loader: maps requested widths to /img proxy presets (320/600/1200).
 * Non-proxy URLs pass through unchanged.
 */

export const IMG_PROXY_PRESETS = [320, 600, 1200] as const;
export type ImgProxyPreset = (typeof IMG_PROXY_PRESETS)[number];

const IMG_PROXY_URL_RE =
  /^(https?:\/\/[^/]+)?(\/img\/[^/]+\/)(\d+)\.(webp|avif|jpeg|jpg)$/i;

/** Smallest preset >= requestedWidth; caps at 1200. */
export function mapImgProxyWidth(requestedWidth: number): ImgProxyPreset {
  for (const preset of IMG_PROXY_PRESETS) {
    if (requestedWidth <= preset) return preset;
  }
  return 1200;
}

/** Rewrite /img/<fileId>/<w>.<ext> to nearest preset width as .webp, or passthrough. */
export function resolveImgProxyUrl(
  src: string,
  requestedWidth: number,
): string {
  const match = src.match(IMG_PROXY_URL_RE);
  if (!match) return src;

  const [, origin = "", pathPrefix] = match;
  const preset = mapImgProxyWidth(requestedWidth);
  return `${origin}${pathPrefix}${preset}.webp`;
}

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return resolveImgProxyUrl(src, width);
}
