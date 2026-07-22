import { clearSession, getAccessToken, setAccessToken } from "./session";

export class AccountApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Account API error ${status}`);
    this.name = "AccountApiError";
    this.status = status;
    this.body = body;
  }
}

export type AccountFetchOptions = {
  skipAuth?: boolean;
  retry?: boolean;
};

type Envelope = {
  success?: boolean;
  data?: unknown;
  error?: { message?: string; code?: string } | null;
};

/** In-flight refresh shared by parallel 401 handlers (rotate-on-use RT). */
let refreshInFlight: Promise<boolean> | null = null;

function accountUrl(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `/api/account/${normalized}`;
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function clearSessionIfNoAccess(): void {
  if (getAccessToken() == null) {
    clearSession();
  }
}

async function doRefreshAccessToken(): Promise<boolean> {
  const res = await fetch(accountUrl("refresh"), {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  const body = (await parseJson(res)) as Envelope | null;
  if (!res.ok) {
    clearSessionIfNoAccess();
    return false;
  }
  const data = body?.data as { accessToken?: string } | undefined;
  if (typeof data?.accessToken === "string") {
    setAccessToken(data.accessToken);
    return true;
  }
  clearSessionIfNoAccess();
  return false;
}

/**
 * Ensure an in-memory access token exists (refresh via BFF cookie if needed).
 * Single-flight: parallel callers share one POST /api/account/refresh.
 */
export async function ensureAccessToken(): Promise<boolean> {
  if (getAccessToken()) return true;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = doRefreshAccessToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** @internal test helper — reset single-flight state between vitest cases. */
export function __resetAccountFetchForTests(): void {
  refreshInFlight = null;
  clearSession();
}

/**
 * Same-origin fetch to /api/account/*. Attaches Bearer access token.
 * On 401: single-flight refresh via BFF cookie, then one retry.
 */
export async function accountFetch(
  path: string,
  init: RequestInit = {},
  options?: AccountFetchOptions,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!options?.skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(accountUrl(path), {
    ...init,
    headers,
    credentials: "same-origin",
  });

  if (res.status === 401 && options?.retry !== false && !options?.skipAuth) {
    const refreshed = await ensureAccessToken();
    if (refreshed) {
      return accountFetch(path, init, { ...options, retry: false });
    }
  }

  return res;
}

/** Convenience: JSON accountFetch with error throw. */
export async function accountFetchJson<T = unknown>(
  path: string,
  init?: RequestInit,
  options?: AccountFetchOptions,
): Promise<T> {
  const res = await accountFetch(path, init, options);
  const body = (await parseJson(res)) as Envelope | null;
  if (!res.ok) {
    throw new AccountApiError(
      res.status,
      body,
      body?.error?.message ?? `Account API error ${res.status}`,
    );
  }
  return (body?.data ?? body) as T;
}
