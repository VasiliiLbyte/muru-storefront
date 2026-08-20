import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { mergeLocalFavoritesToAccount } from "@/lib/account/merge-favorites";
import { safeNextPath } from "@/lib/account/safe-next";
import { setAccessToken } from "@/lib/account/session";
import type { AuthTokens } from "@/lib/schemas/account";
import { useAccountFavoritesStore } from "@/stores/account-favorites-store";
import {
  emptySessionCustomer,
  useCustomerSessionStore,
} from "@/stores/customer-session-store";

export type CompleteLoginSuccessOptions = {
  variant: "page" | "modal";
  onSuccess?: () => void;
  router?: AppRouterInstance;
  nextPath?: string | null;
  /** Used when tokens.customer is missing (email login fallback). */
  fallbackEmail?: string;
};

/** Shared post-login: access token, session store, favorites merge, redirect/close. */
export async function completeLoginSuccess(
  tokens: AuthTokens,
  options: CompleteLoginSuccessOptions,
): Promise<void> {
  setAccessToken(tokens.accessToken);
  const store = useCustomerSessionStore.getState();
  const customer = tokens.customer;

  if (customer) {
    store.setAuthenticated({
      lastName: customer.lastName ?? "",
      firstName: customer.firstName ?? "",
      middleName: customer.middleName ?? "",
      fullName: customer.fullName,
      email: customer.email ?? "",
      phone: customer.phone ?? null,
    });
    store.showAuthToastForCustomer({
      email: customer.email,
      phone: customer.phone,
    });
  } else {
    const email = options.fallbackEmail ?? "";
    store.setAuthenticated(emptySessionCustomer(email));
    store.showAuthToast(email);
  }

  try {
    await mergeLocalFavoritesToAccount();
  } catch {
    // merge must never block login
  }

  try {
    await useAccountFavoritesStore.getState().hydrate({ force: true });
  } catch {
    // hydrate must never block login
  }

  if (options.variant === "modal") {
    options.onSuccess?.();
    return;
  }

  const next = safeNextPath(options.nextPath) ?? "/account/";
  options.router?.replace(next);
}
