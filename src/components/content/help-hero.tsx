import Image from "next/image";

import { glassPlaqueClass } from "@/components/ui/glass-plaque";
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
 * Full-bleed hero «Клиентам»: фото + glass-плашка (как на главной / company).
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
        "relative isolate flex w-full flex-col overflow-hidden bg-background lg:block lg:aspect-[21/9] lg:min-h-[320px] lg:items-center lg:justify-center lg:bg-surface",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 bg-surface lg:absolute lg:inset-0 lg:aspect-auto">
        <Image
          src={image.url}
          alt={image.alt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          {...staticBlurProps()}
        />
      </div>
      <div
        className={cn(
          "relative z-10 w-full px-4 py-8 text-center sm:px-8 lg:absolute lg:mx-4 lg:max-w-xl lg:px-12 lg:py-12",
          glassPlaqueClass,
        )}
      >
        <h1 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.2] font-normal tracking-[0.08em] text-text-heading uppercase">
          {title}
        </h1>
        <p className="mt-4 text-body text-text-secondary">{intro}</p>
      </div>
    </section>
  );
}
