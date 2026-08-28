import DOMPurify from "isomorphic-dompurify";

import { cn } from "@/lib/utils";

/**
 * Стилизованный рендер HTML-тела статической страницы (плейсхолдер из CMS).
 */
export function StaticProse({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safeHtml = DOMPurify.sanitize(html);

  return (
    <div
      className={cn(
        "max-w-3xl text-body text-text-secondary",
        "[&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-h2 [&_h2]:text-text-heading",
        "[&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-body [&_h3]:font-medium [&_h3]:text-text-heading",
        "[&_p]:mb-4 [&_p]:leading-relaxed",
        "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:leading-relaxed",
        "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:leading-relaxed",
        "[&_li]:mb-2",
        "[&_img]:h-auto [&_img]:max-w-full",
        "[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
