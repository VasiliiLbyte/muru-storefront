import { create } from "zustand";

export type CustomerSessionStatus = "unknown" | "guest" | "authenticated";

export type CustomerSessionCustomer = {
  fullName: string;
  email: string;
  phone?: string | null;
};

export type AuthToastPayload = {
  email?: string | null;
  phone?: string | null;
};

type CustomerSessionState = {
  status: CustomerSessionStatus;
  customer: CustomerSessionCustomer | null;
  authToast: AuthToastPayload | null;
  setAuthenticated: (customer: CustomerSessionCustomer) => void;
  setGuest: () => void;
  showAuthToast: (email: string) => void;
  showAuthToastForCustomer: (customer: AuthToastPayload) => void;
  clearAuthToast: () => void;
  /** Test helper — reset to initial unknown. */
  reset: () => void;
};

const initialState = {
  status: "unknown" as CustomerSessionStatus,
  customer: null as CustomerSessionCustomer | null,
  authToast: null as AuthToastPayload | null,
};

/** First whitespace-separated word; empty → «Кабинет». */
export function customerFirstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  return first.length > 0 ? first : "Кабинет";
}

export const useCustomerSessionStore = create<CustomerSessionState>((set) => ({
  ...initialState,
  setAuthenticated: (customer) =>
    set({
      status: "authenticated",
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone ?? null,
      },
    }),
  setGuest: () =>
    set({
      status: "guest",
      customer: null,
    }),
  showAuthToast: (email) => set({ authToast: { email } }),
  showAuthToastForCustomer: (customer) =>
    set({
      authToast: {
        email: customer.email?.trim() ? customer.email : null,
        phone: customer.phone?.trim() ? customer.phone : null,
      },
    }),
  clearAuthToast: () => set({ authToast: null }),
  reset: () => set({ ...initialState }),
}));

export function useCustomerSessionStatus(): CustomerSessionStatus {
  return useCustomerSessionStore((s) => s.status);
}

export function useCustomerSessionCustomer(): CustomerSessionCustomer | null {
  return useCustomerSessionStore((s) => s.customer);
}

export function useAuthToast(): AuthToastPayload | null {
  return useCustomerSessionStore((s) => s.authToast);
}
