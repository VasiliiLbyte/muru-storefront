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
        "inline-flex shrink-0 items-center transition-opacity hover:opacity-80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <Image
        src="/brand/muru-logo.svg"
        alt="muru"
        width={165}
        height={32}
        className="h-8 w-auto"
      />
    </Link>
  );
}
