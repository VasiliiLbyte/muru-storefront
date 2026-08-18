import { cn } from "@/lib/utils";

export const fieldLabelClassName =
  "mb-1.5 block text-small font-medium text-text-heading";

export const fieldErrorClassName = "mt-1 text-small text-destructive";

export const fieldHintClassName = "mt-1 text-small text-text-muted";

export const formStackClassName = "flex max-w-md flex-col gap-4";

/** Modal / bottom-sheet forms stretch to the container width. */
export const modalFormStackClassName = "flex w-full max-w-none flex-col gap-4";

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
