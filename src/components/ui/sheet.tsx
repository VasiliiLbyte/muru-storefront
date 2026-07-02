"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Sheet (боковая панель) в стиле shadcn поверх @base-ui/react Dialog.
 * Используется для мобильного меню. Анимации сдержанные; глобальный
 * prefers-reduced-motion (globals.css) отключает переходы.
 */
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetTitle = SheetPrimitive.Title;
const SheetDescription = SheetPrimitive.Description;

function SheetBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Backdrop>) {
  return (
    <SheetPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-[60] bg-black/40 opacity-100 transition-opacity duration-300 ease-in-out",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "data-open:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

const sideClasses = {
  left: "inset-y-0 left-0 h-full w-[88vw] max-w-sm border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  right:
    "inset-y-0 right-0 h-full w-[88vw] max-w-sm border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
} as const;

function SheetContent({
  className,
  children,
  side = "left",
  showClose = true,
  backdropClassName,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Popup> & {
  side?: keyof typeof sideClasses;
  showClose?: boolean;
  backdropClassName?: string;
}) {
  return (
    <SheetPortal>
      <SheetBackdrop className={backdropClassName} />
      <SheetPrimitive.Popup
        className={cn(
          "fixed z-[61] flex flex-col gap-6 overflow-y-auto bg-surface p-6 shadow-(--shadow-overlay) outline-none",
          "border-border transition-transform duration-300 ease-in-out",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <SheetPrimitive.Close
            aria-label="Закрыть меню"
            className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-sm text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-5" />
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 pr-10", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetBackdrop,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
