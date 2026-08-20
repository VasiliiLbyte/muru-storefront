import { beforeEach, describe, expect, it } from "vitest";

import {
  customerFirstName,
  useCustomerSessionStore,
} from "./customer-session-store";

describe("customerFirstName", () => {
  it("prefers firstName over fullName token", () => {
    expect(
      customerFirstName({ firstName: "Иван", fullName: "Иванов Иван" }),
    ).toBe("Иван");
  });

  it("falls back to first word of fullName when firstName empty", () => {
    expect(customerFirstName({ firstName: "", fullName: "Анна Иванова" })).toBe(
      "Анна",
    );
    expect(
      customerFirstName({ firstName: "  ", fullName: "  Maria  Silva " }),
    ).toBe("Maria");
  });

  it("falls back to Кабинет when empty", () => {
    expect(customerFirstName(null)).toBe("Кабинет");
    expect(customerFirstName(undefined)).toBe("Кабинет");
    expect(customerFirstName({ firstName: "", fullName: "" })).toBe("Кабинет");
    expect(customerFirstName({ firstName: "   ", fullName: "   " })).toBe(
      "Кабинет",
    );
  });
});

describe("customer session store", () => {
  beforeEach(() => {
    useCustomerSessionStore.getState().reset();
  });

  it("transitions unknown → authenticated → guest", () => {
    expect(useCustomerSessionStore.getState().status).toBe("unknown");

    useCustomerSessionStore.getState().setAuthenticated({
      lastName: "Иванова",
      firstName: "Анна",
      middleName: "",
      fullName: "Иванова Анна",
      email: "anna@example.com",
    });
    expect(useCustomerSessionStore.getState().status).toBe("authenticated");
    expect(useCustomerSessionStore.getState().customer).toEqual({
      lastName: "Иванова",
      firstName: "Анна",
      middleName: "",
      fullName: "Иванова Анна",
      email: "anna@example.com",
      phone: null,
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

  it("supports phone-only session and toast", () => {
    useCustomerSessionStore.getState().setAuthenticated({
      lastName: "",
      firstName: "",
      middleName: "",
      fullName: "",
      email: "",
      phone: "+79001234567",
    });
    expect(useCustomerSessionStore.getState().customer).toEqual({
      lastName: "",
      firstName: "",
      middleName: "",
      fullName: "",
      email: "",
      phone: "+79001234567",
    });

    useCustomerSessionStore.getState().showAuthToastForCustomer({
      email: null,
      phone: "+79001234567",
    });
    expect(useCustomerSessionStore.getState().authToast).toEqual({
      email: null,
      phone: "+79001234567",
    });
  });
});
