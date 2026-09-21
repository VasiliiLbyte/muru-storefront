import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Логотип MURU — вордмарк (`public/brand/muru-logo.svg`).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="MURU — на главную"
      className={cn(
        "inline-flex min-h-11 min-w-11 shrink-0 select-none items-center transition-opacity hover:opacity-80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      style={{ minHeight: 44, minWidth: 44 }}
    >
      <Image
        src="/brand/muru-logo.svg"
        alt="muru"
        width={206}
        height={40}
        sizes="206px"
        draggable={false}
        className="h-10 w-auto max-w-full select-none object-contain [-webkit-user-drag:none]"
      />
    </Link>
  );
}
