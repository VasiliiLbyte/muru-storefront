import DOMPurify from "isomorphic-dompurify";

import { cn } from "@/lib/utils";

/**
 * Стилизованный рендер HTML-тела статической страницы (плейсхолдер из CMS).
 */
export function StaticProse({
  html,
  className,
  variant = "default",
}: {
  html: string;
  className?: string;
  variant?: "default" | "seo-footer";
}) {
  const safeHtml = DOMPurify.sanitize(html);

  return (
    <div
      className={cn(
        variant === "seo-footer"
          ? [
              "max-w-3xl text-[12px] leading-relaxed text-text-muted",
              "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-[14px] [&_h2]:font-medium [&_h2]:text-text-muted",
              "[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-[12px] [&_h3]:font-medium [&_h3]:text-text-muted",
              "[&_p]:mb-3 [&_p]:leading-relaxed",
              "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:leading-relaxed",
              "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:leading-relaxed",
              "[&_li]:mb-1",
              "[&_img]:h-auto [&_img]:max-w-full",
              "[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
            ]
          : [
              "max-w-3xl text-body text-text-secondary",
              "[&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-h2 [&_h2]:text-text-heading",
              "[&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-body [&_h3]:font-medium [&_h3]:text-text-heading",
              "[&_p]:mb-4 [&_p]:leading-relaxed",
              "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:leading-relaxed",
              "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:leading-relaxed",
              "[&_li]:mb-2",
              "[&_img]:h-auto [&_img]:max-w-full",
              "[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
            ],
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
