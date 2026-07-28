"use client";

import { Suspense, useEffect, useState } from "react";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/components/account/login-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCustomerSessionStore } from "@/stores/customer-session-store";

export const OPEN_LOGIN_EVENT = "muru:open-login";
export const GO_ACCOUNT_EVENT = "muru:go-account";

/** Open login modal, or navigate to account when already authenticated. */
export function openLoginDialog() {
  if (typeof window === "undefined") return;
  if (useCustomerSessionStore.getState().status === "authenticated") {
    window.dispatchEvent(new CustomEvent(GO_ACCOUNT_EVENT));
    return;
  }
  window.dispatchEvent(new CustomEvent(OPEN_LOGIN_EVENT));
}

/**
 * Guest login control + centered dialog. Opens on `muru:open-login` and `?login=1`.
 */
export function LoginDialogGuest({ compact = false }: { compact?: boolean }) {
  void compact;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_LOGIN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LOGIN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") {
      setOpen(true);
      params.delete("login");
      const qs = params.toString();
      const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", next);
    }
  }, []);

  function handleSuccess() {
    setOpen(false);
    router.push("/account/");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="Войти"
        className="relative inline-flex flex-col items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:min-h-0 lg:min-w-[3.5rem] lg:w-auto lg:gap-1 lg:px-2"
        style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
      >
        <span className="relative inline-flex size-6 items-center justify-center">
          <User className="size-5" />
        </span>
        <span className="hidden text-[12px] leading-none text-text-secondary lg:block">
          Войти
        </span>
      </DialogTrigger>
      <DialogContent className="w-[min(100vw-1.5rem,28rem)] p-6 sm:p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="font-display text-h3 text-text-heading">
            Вход в личный кабинет
          </DialogTitle>
        </DialogHeader>
        <Suspense
          fallback={<p className="text-body text-text-muted">Загрузка…</p>}
        >
          <LoginForm
            variant="modal"
            onSuccess={handleSuccess}
            onDismiss={() => setOpen(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use LoginDialogGuest or HeaderAccount */
export function LoginDialog({ compact = false }: { compact?: boolean }) {
  return <LoginDialogGuest compact={compact} />;
}
