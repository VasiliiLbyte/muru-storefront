import { create } from "zustand";

export type CustomerSessionStatus = "unknown" | "guest" | "authenticated";

export type CustomerSessionCustomer = {
  lastName: string;
  firstName: string;
  middleName?: string | null;
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

/**
 * Header display name: prefer firstName, else first token of fullName, else «Кабинет».
 */
export function customerFirstName(
  customer:
    | { firstName?: string | null; fullName?: string | null }
    | null
    | undefined,
): string {
  const fromPart = customer?.firstName?.trim() ?? "";
  if (fromPart.length > 0) return fromPart;
  const fromFull = customer?.fullName?.trim().split(/\s+/)[0] ?? "";
  return fromFull.length > 0 ? fromFull : "Кабинет";
}

/** Empty name parts for bootstrap / fallback session. */
export function emptySessionCustomer(
  email = "",
  phone: string | null = null,
): CustomerSessionCustomer {
  return {
    lastName: "",
    firstName: "",
    middleName: "",
    fullName: "",
    email,
    phone,
  };
}

export const useCustomerSessionStore = create<CustomerSessionState>((set) => ({
  ...initialState,
  setAuthenticated: (customer) =>
    set({
      status: "authenticated",
      customer: {
        lastName: customer.lastName ?? "",
        firstName: customer.firstName ?? "",
        middleName: customer.middleName ?? "",
        fullName: customer.fullName ?? "",
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
