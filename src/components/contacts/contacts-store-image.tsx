import Image from "next/image";

import type { Image as ImageData } from "@/lib/schemas";
import { staticBlurProps } from "@/lib/images";

/**
 * Фото магазина на странице контактов (CMS heroImage).
 */
export function ContactsStoreImage({
  image,
}: {
  image?: ImageData | null;
}) {
  if (!image?.url) return null;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
      <Image
        src={image.url}
        alt={image.alt ?? ""}
        fill
        sizes="(min-width: 1024px) 22rem, 100vw"
        className="object-cover"
        {...staticBlurProps()}
      />
    </div>
  );
}
