import { cn } from "@/lib/utils";

export const fieldLabelClassName =
  "mb-1.5 block text-small font-medium text-text-heading";

export const fieldErrorClassName = "mt-1 text-small text-destructive";

export const fieldHintClassName = "mt-1 text-small text-text-muted";

export const formStackClassName = "flex max-w-md flex-col gap-4";

/** Modal / bottom-sheet forms stretch to the container width. */
export const modalFormStackClassName = "flex w-full max-w-none flex-col gap-4";

/**
 * ФИО inside max-w-md forms: stack on mobile; last|first on one row from sm;
 * middle always full width below (3 equal cols are too narrow and misalign).
 */
export const nameFieldsGridClassName =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end";

/** Middle name spans both columns under last+first. */
export const nameMiddleFieldClassName = "sm:col-span-2";

export function formStackFor(variant: "page" | "modal"): string {
  return variant === "modal" ? modalFormStackClassName : formStackClassName;
}

export function fieldInvalidProps(invalid: boolean) {
  return invalid
    ? ({ "aria-invalid": true as const } satisfies {
        "aria-invalid": true;
      })
    : {};
}

export function formCardClassName(...extra: Array<string | undefined>) {
  return cn("w-full max-w-lg", ...extra);
}
