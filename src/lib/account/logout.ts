import { accountFetch } from "./account-fetch";
import { clearSession } from "./session";

/**
 * BFF logout (clear cookie) + local session clear + hard nav home.
 * Ignores upstream errors so the client always leaves the session.
 */
export async function logoutCustomer(): Promise<void> {
  try {
    await accountFetch("logout", { method: "POST", body: "{}" }, {
      skipAuth: true,
    });
  } catch {
    // clear local session anyway
  }
  clearSession();
  window.location.assign("/");
}
