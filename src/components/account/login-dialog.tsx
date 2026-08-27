"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Phone, X } from "lucide-react";

import { IconCabinet } from "@/components/icons";
import {
  actionTriggerClass,
  actionTriggerStyle,
} from "@/components/layout/header-actions";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/components/account/login-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBottomSheetMode } from "@/hooks/use-match-media";
import { useCustomerSessionStore } from "@/stores/customer-session-store";

export const OPEN_LOGIN_EVENT = "muru:open-login";
export const GO_ACCOUNT_EVENT = "muru:go-account";

const TITLE = "Вход в личный кабинет";

/** Open login modal, or navigate to account when already authenticated. */
export function openLoginDialog() {
  if (typeof window === "undefined") return;
  if (useCustomerSessionStore.getState().status === "authenticated") {
    window.dispatchEvent(new CustomEvent(GO_ACCOUNT_EVENT));
    return;
  }
  window.dispatchEvent(new CustomEvent(OPEN_LOGIN_EVENT));
}

function LoginHeaderIcon() {
  return (
    <span
      aria-hidden
      className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-brand/10"
    >
      <Phone className="size-5 text-brand" />
    </span>
  );
}

/**
 * Guest login control + modal. Opens on `muru:open-login` and `?login=1`.
 * Bottom sheet on touch / narrow viewports, centered dialog otherwise.
 */
export function LoginDialogGuest({ compact = false }: { compact?: boolean }) {
  void compact;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isSheet = useBottomSheetMode();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

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

  const form = (
    <Suspense fallback={<p className="text-body text-text-muted">Загрузка…</p>}>
      <LoginForm
        variant="modal"
        onSuccess={handleSuccess}
        onDismiss={() => setOpen(false)}
      />
    </Suspense>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Войти"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={actionTriggerClass}
        style={actionTriggerStyle}
      >
        <span className="relative inline-flex size-6 items-center justify-center">
          <IconCabinet className="size-5" />
        </span>
      </button>

      {isSheet ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            showClose={false}
            finalFocus={triggerRef}
            className="max-h-[90dvh] gap-0 rounded-t-2xl border-0 px-6 pt-3 pb-6"
          >
            <SheetClose
              aria-label="Закрыть"
              className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-sm text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-5" />
            </SheetClose>
            <SheetHeader className="mb-6">
              <LoginHeaderIcon />
              <SheetTitle className="font-display text-h3 text-text-heading">
                {TITLE}
              </SheetTitle>
            </SheetHeader>
            <div className="pb-safe">{form}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            finalFocus={triggerRef}
            className="w-[min(100vw-1.5rem,26rem)] rounded-2xl p-8"
          >
            <DialogHeader className="mb-6">
              <LoginHeaderIcon />
              <DialogTitle className="font-display text-h3 text-text-heading">
                {TITLE}
              </DialogTitle>
            </DialogHeader>
            {form}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

/** @deprecated Use LoginDialogGuest or HeaderAccount */
export function LoginDialog({ compact = false }: { compact?: boolean }) {
  return <LoginDialogGuest compact={compact} />;
}
