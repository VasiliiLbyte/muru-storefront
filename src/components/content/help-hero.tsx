import Image from "next/image";

import type { Image as ImageData } from "@/lib/schemas";
import { staticBlurProps } from "@/lib/images";
import { cn } from "@/lib/utils";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FALLBACK_INTRO =
  "Важная информация для клиентов: доставка, обслуживание, отзывы и подарочные сервисы.";

/**
 * Full-bleed hero «Клиентам»: фото + белый бокс с title и текстом.
 */
export function HelpHero({
  title,
  bodyHtml,
  image,
  className,
}: {
  title: string;
  bodyHtml: string;
  image: ImageData;
  className?: string;
}) {
  const plain = stripHtml(bodyHtml);
  const intro = plain || FALLBACK_INTRO;

  return (
    <section
      className={cn(
        "relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-surface aspect-[21/9]",
        className,
      )}
    >
      <Image
        src={image.url}
        alt={image.alt ?? ""}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        {...staticBlurProps()}
      />
      <div className="relative z-10 mx-4 w-full max-w-xl bg-background px-8 py-10 text-center sm:px-12 sm:py-12">
        <h1 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.2] font-normal tracking-[0.08em] text-text-heading uppercase">
          {title}
        </h1>
        <p className="mt-4 text-body text-text-secondary">{intro}</p>
      </div>
    </section>
  );
}
