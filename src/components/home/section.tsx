import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Секционный блок главной: заголовок H2 + подзаголовок + контент.
 * Спокойный вертикальный ритм (slow-living).
 */
export function SectionBlock({
  title,
  subtitle,
  href,
  linkLabel,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="mx-auto w-full max-w-[1564px] px-4 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-h2 text-text-heading">{title}</h2>
            {subtitle ? (
              <p className="text-body text-text-secondary">{subtitle}</p>
            ) : null}
          </div>
          {href && linkLabel ? (
            <Link
              href={href}
              className="text-caption font-medium tracking-wide text-text-secondary transition-colors hover:text-brand"
            >
              {linkLabel}
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
