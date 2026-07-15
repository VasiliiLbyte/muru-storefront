import Image from "next/image";
import Link from "next/link";

import type { Image as ImageData } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/**
 * Карточка-плитка для главной (категория / коллекция / лукбук):
 * изображение + заголовок + подпись. Вся карточка — ссылка.
 */
export function MediaCard({
  href,
  image,
  title,
  subtitle,
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  imageAspect = "aspect-[4/5]",
  priority = false,
  className,
}: {
  href: string;
  image?: ImageData;
  title: string;
  subtitle?: string;
  sizes?: string;
  imageAspect?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-3 focus-visible:outline-none",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden bg-surface", imageAspect)}>
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? title}
            fill
            sizes={sizes}
            priority={priority}
            placeholder={image.blurDataURL ? "blur" : undefined}
            blurDataURL={image.blurDataURL}
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-body text-text-heading transition-colors group-hover:text-brand">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-small text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
    </Link>
  );
}
