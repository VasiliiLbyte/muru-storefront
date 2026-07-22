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

type Envelope = {
  success?: boolean;
  data?: unknown;
  error?: { message?: string; code?: string } | null;
};

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

async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch(accountUrl("refresh"), {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  const body = (await parseJson(res)) as Envelope | null;
  if (!res.ok) {
    clearSession();
    return false;
  }
  const data = body?.data as { accessToken?: string } | undefined;
  if (typeof data?.accessToken === "string") {
    setAccessToken(data.accessToken);
    return true;
  }
  clearSession();
  return false;
}

/**
 * Same-origin fetch to /api/account/*. Attaches Bearer access token.
 * On 401: one refresh retry via BFF cookie, then fail and clear session.
 */
export async function accountFetch(
  path: string,
  init: RequestInit = {},
  options?: { skipAuth?: boolean; retry?: boolean },
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
    const refreshed = await refreshAccessToken();
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
): Promise<T> {
  const res = await accountFetch(path, init);
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
