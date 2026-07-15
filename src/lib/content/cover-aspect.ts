/** Natural aspect ratio of a cover image (width / height). */
export function getCoverAspectRatio(cover: {
  width?: number;
  height?: number;
}): number {
  if (cover.width && cover.height && cover.height > 0) {
    return cover.width / cover.height;
  }
  return 21 / 9;
}
