"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import {
  useAuthToast,
  useCustomerSessionStore,
} from "@/stores/customer-session-store";

const AUTO_DISMISS_MS = 4000;

/**
 * Login success toast (top-right). State lives in customer-session store
 * so it survives router.push after modal/page login.
 */
export function AuthSuccessToast() {
  const toast = useAuthToast();
  const clearAuthToast = useCustomerSessionStore((s) => s.clearAuthToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => {
      clearAuthToast();
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
  }, [toast, clearAuthToast]);

  if (!toast || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed top-4 right-4 z-[80] w-[min(100vw-2rem,22rem)] border border-border bg-background p-4 shadow-(--shadow-overlay) transition-[opacity,transform] duration-300 ease-in-out motion-reduce:transition-none"
    >
      <button
        type="button"
        aria-label="Закрыть"
        onClick={() => clearAuthToast()}
        className="absolute top-3 right-3 inline-flex size-8 items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      >
        <X className="size-4" />
      </button>
      <p className="pr-8 font-display text-lg text-text-heading">
        Вы успешно авторизовались
      </p>
      <p className="mt-1 text-small text-text-secondary">{toast.email}</p>
    </div>,
    document.body,
  );
}
