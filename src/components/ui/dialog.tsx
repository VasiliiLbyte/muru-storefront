"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Centered Dialog поверх @base-ui/react Dialog (как Sheet, но по центру).
 */
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function DialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-[70] bg-black/40 opacity-100 transition-opacity duration-300 ease-in-out",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "data-open:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showClose = true,
  backdropClassName,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> & {
  showClose?: boolean;
  backdropClassName?: string;
}) {
  return (
    <DialogPortal>
      <DialogBackdrop className={backdropClassName} />
      <DialogPrimitive.Popup
        className={cn(
          "fixed top-1/2 left-1/2 z-[71] flex max-h-[90vh] w-[min(100vw-1.5rem,68rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-background shadow-(--shadow-overlay) outline-none",
          "border border-border transition-[opacity,transform] duration-300 ease-in-out",
          "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            aria-label="Закрыть"
            className="absolute top-4 right-4 z-10 inline-flex size-9 items-center justify-center rounded-sm text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1 pr-10", className)} {...props} />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
