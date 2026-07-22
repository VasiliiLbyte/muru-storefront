/** In-memory access token — never persist to localStorage. */

import { useCustomerSessionStore } from "@/stores/customer-session-store";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearSession(): void {
  accessToken = null;
  useCustomerSessionStore.getState().setGuest();
}
