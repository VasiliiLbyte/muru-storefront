"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { LogOut } from "lucide-react";

import { IconCabinet } from "@/components/icons";

import {
  LoginDialogGuest,
  GO_ACCOUNT_EVENT,
} from "@/components/account/login-dialog";
import { actionTriggerClass, actionTriggerStyle } from "@/components/layout/header-actions";
import { ensureAccessToken } from "@/lib/account/account-fetch";
import { logoutCustomer } from "@/lib/account/logout";
import { getAccessToken } from "@/lib/account/session";
import { cn } from "@/lib/utils";
import {
  customerFirstName,
  emptySessionCustomer,
  useCustomerSessionCustomer,
  useCustomerSessionStatus,
  useCustomerSessionStore,
} from "@/stores/customer-session-store";

const CLOSE_DELAY_MS = 200;

const MENU_ITEMS = [
  { href: "/account/", label: "Мой кабинет" },
  { href: "/account/personal/", label: "Личные данные" },
  { href: "/account/orders/", label: "Заказы" },
  { href: "/account/favorites/", label: "Избранные товары" },
] as const;

function AuthenticatedAccountMenu({
  firstName,
}: {
  firstName: string;
}) {
  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        openOnHover
        delay={0}
        closeDelay={CLOSE_DELAY_MS}
        render={
          <Link
            href="/account/"
            aria-label={`Личный кабинет, ${firstName}`}
            aria-haspopup="menu"
            className={actionTriggerClass}
            style={actionTriggerStyle}
          />
        }
      >
        <span className="relative inline-flex size-6 items-center justify-center">
          <IconCabinet className="size-5" />
        </span>
        <span className="hidden max-w-[5.5rem] truncate text-[12px] leading-none text-text-secondary lg:block">
          {firstName}
        </span>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-[75]"
        >
          <Menu.Popup
            className={cn(
              "min-w-[14rem] border border-border bg-background py-2 shadow-(--shadow-overlay) outline-none",
              "origin-top-right transition-[opacity,transform] duration-200 ease-in-out",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
              "motion-reduce:transition-none",
            )}
          >
            {MENU_ITEMS.map((item) => (
              <Menu.LinkItem
                key={item.href}
                href={item.href}
                closeOnClick
                className="flex w-full cursor-pointer px-4 py-2.5 text-left text-body text-text-secondary outline-none transition-colors hover:bg-surface hover:text-text-heading focus-visible:bg-surface focus-visible:text-text-heading data-highlighted:bg-surface data-highlighted:text-text-heading"
              >
                {item.label}
              </Menu.LinkItem>
            ))}
            <div className="my-1 border-t border-border" role="separator" />
            <Menu.Item
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-body text-text-secondary outline-none transition-colors hover:bg-surface hover:text-text-heading focus-visible:bg-surface focus-visible:text-text-heading data-highlighted:bg-surface data-highlighted:text-text-heading"
              onClick={() => void logoutCustomer()}
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              Выйти
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

/**
 * Header account control: guest → login modal; authenticated → name + hover menu.
 * Bootstraps session once when status is unknown.
 */
export function HeaderAccount({ compact = false }: { compact?: boolean }) {
  void compact;
  const router = useRouter();
  const status = useCustomerSessionStatus();
  const customer = useCustomerSessionCustomer();
  const setAuthenticated = useCustomerSessionStore((s) => s.setAuthenticated);
  const setGuest = useCustomerSessionStore((s) => s.setGuest);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (useCustomerSessionStore.getState().status !== "unknown") return;
      const ok = await ensureAccessToken();
      if (cancelled) return;
      if (!ok) {
        setGuest();
        return;
      }
      if (useCustomerSessionStore.getState().status === "unknown") {
        if (getAccessToken()) {
          setAuthenticated(emptySessionCustomer());
        } else {
          setGuest();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setAuthenticated, setGuest]);

  useEffect(() => {
    function onGoAccount() {
      router.push("/account/");
    }
    window.addEventListener(GO_ACCOUNT_EVENT, onGoAccount);
    return () => window.removeEventListener(GO_ACCOUNT_EVENT, onGoAccount);
  }, [router]);

  if (status === "authenticated") {
    const firstName = customerFirstName(customer);
    return <AuthenticatedAccountMenu firstName={firstName} />;
  }

  return <LoginDialogGuest />;
}
