import type { ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

export type MuruIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

/** Brand SVG wrapper — color via Tailwind text-* on className (currentColor). */
export function MuruIcon({
  children,
  className,
  title,
  viewBox = "0 0 26 26",
  ...props
}: MuruIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={cn("size-5 shrink-0", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
