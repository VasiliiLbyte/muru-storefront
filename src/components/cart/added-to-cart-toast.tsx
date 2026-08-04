"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAddedToast, useCartStore } from "@/stores/cart-store";

const AUTO_DISMISS_MS = 5000;

/**
 * Add-to-cart feedback toast (mobile under header / desktop top-right).
 * State lives in cart store (ephemeral, not persisted).
 */
export function AddedToCartToast() {
  const toast = useAddedToast();
  const clearAddedToast = useCartStore((s) => s.clearAddedToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }
    // Restart enter animation when toast payload changes (same or new SKU).
    setVisible(false);
    const enterId = window.requestAnimationFrame(() => setVisible(true));
    const dismissId = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => clearAddedToast(), 300);
    }, AUTO_DISMISS_MS);
    return () => {
      window.cancelAnimationFrame(enterId);
      window.clearTimeout(dismissId);
    };
  }, [toast, clearAddedToast]);

  if (!toast || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto fixed z-[80] flex items-center gap-3 border border-border bg-background p-3 shadow-(--shadow-overlay)",
        "inset-x-4 top-[calc(3.75rem+env(safe-area-inset-top,0px))]",
        "lg:inset-x-auto lg:top-4 lg:right-4 lg:w-[min(100vw-2rem,22rem)]",
        "transition-[opacity,transform] duration-300 ease-in-out motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0 lg:translate-y-0 lg:translate-x-2",
      )}
    >
      {toast.imageUrl ? (
        <div className="relative size-12 shrink-0 overflow-hidden bg-surface">
          <Image
            src={toast.imageUrl}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="size-12 shrink-0 bg-surface" aria-hidden />
      )}
      <div className="min-w-0 flex-1 pr-6">
        <p className="text-small font-medium text-text-heading">В корзине</p>
        <p className="truncate text-small text-text-secondary">{toast.title}</p>
      </div>
      <button
        type="button"
        aria-label="Закрыть"
        onClick={() => clearAddedToast()}
        className="absolute top-2 right-2 inline-flex size-8 items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      >
        <X className="size-4" />
      </button>
    </div>,
    document.body,
  );
}
