import { beforeEach, describe, expect, it } from "vitest";

import {
  customerFirstName,
  useCustomerSessionStore,
} from "./customer-session-store";

describe("customerFirstName", () => {
  it("returns first word of fullName", () => {
    expect(customerFirstName("Анна Иванова")).toBe("Анна");
    expect(customerFirstName("  Maria  Silva ")).toBe("Maria");
  });

  it("falls back to Кабинет when empty or whitespace", () => {
    expect(customerFirstName("")).toBe("Кабинет");
    expect(customerFirstName("   ")).toBe("Кабинет");
  });
});

describe("customer session store", () => {
  beforeEach(() => {
    useCustomerSessionStore.getState().reset();
  });

  it("transitions unknown → authenticated → guest", () => {
    expect(useCustomerSessionStore.getState().status).toBe("unknown");

    useCustomerSessionStore.getState().setAuthenticated({
      fullName: "Анна Иванова",
      email: "anna@example.com",
    });
    expect(useCustomerSessionStore.getState().status).toBe("authenticated");
    expect(useCustomerSessionStore.getState().customer).toEqual({
      fullName: "Анна Иванова",
      email: "anna@example.com",
    });

    useCustomerSessionStore.getState().setGuest();
    expect(useCustomerSessionStore.getState().status).toBe("guest");
    expect(useCustomerSessionStore.getState().customer).toBeNull();
  });

  it("sets and clears auth toast", () => {
    useCustomerSessionStore.getState().showAuthToast("a@b.c");
    expect(useCustomerSessionStore.getState().authToast).toEqual({
      email: "a@b.c",
    });
    useCustomerSessionStore.getState().clearAuthToast();
    expect(useCustomerSessionStore.getState().authToast).toBeNull();
  });
});
