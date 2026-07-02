import { z, type ZodType } from "zod";

/**
 * Базовая обёртка fetch с runtime-валидацией Zod.
 *
 * База берётся из NEXT_PUBLIC_API_BASE. В dev без API_BASE всё резолвится из
 * моков; при заданном API_BASE — гибрид: fallback-каталог из фикстур (сервер),
 * CDEK/payments и пр. — реальный fetch на бэкенд. Контент (collections,
 * lookbooks, pages) — статичный модуль lib/content, без HTTP.
 */

/** Fallback-пути каталога без NEXT_PUBLIC_CATALOG_API_BASE (MSW-фикстуры). */
const MOCK_ONLY_PREFIXES = ["/categories", "/products"] as const;

function isMockOnlyPath(path: string): boolean {
  return MOCK_ONLY_PREFIXES.some(
    (prefix) =>
      path === prefix ||
      path.startsWith(`${prefix}/`) ||
      path.startsWith(`${prefix}?`),
  );
}

/**
 * Резолвит базовый URL API.
 * - Если задан NEXT_PUBLIC_API_BASE — используется как есть (реальный backend).
 * - Иначе на клиенте — относительный путь ("" → fetch к текущему origin,
 *   перехватывает browser-воркер MSW).
 * - На сервере fetch требует абсолютный URL → собираем localhost
 *   (server-side MSW в dev перехватывает по host-agnostic паттернам "*\/...").
 */
export function resolveApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE;
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") {
    return `http://localhost:${process.env.PORT ?? "3000"}`;
  }
  return "";
}

export const API_BASE = resolveApiBase();

/**
 * Серверные фетчи (Server Components) в dev резолвим из моков напрямую,
 * без HTTP: MSW не перехватывает fetch в RSC-рантайме Next.
 * При заданном NEXT_PUBLIC_API_BASE в dev fallback-каталог (/categories,
 * /products*) — resolveMock; остальные (/cdek/*, /payments/*) — реальный fetch.
 * На клиенте запросы идут по сети; browser-воркер MSW перехватывает контент,
 * onUnhandledRequest: "bypass" пропускает бэкенд-запросы.
 */
function shouldServerMock(path: string): boolean {
  if (typeof window !== "undefined") return false;
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_API_MOCKING !== "enabled"
  ) {
    return false;
  }
  if (!process.env.NEXT_PUBLIC_API_BASE) return true;
  return isMockOnlyPath(path);
}

/** Ошибка HTTP-слоя (не путать с ошибкой валидации Zod). */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string, message?: string) {
    super(message ?? `API request failed: ${status} ${url}`);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

/** Значение, сериализуемое в query-строку. */
type QueryValue = string | number | boolean | null | undefined;

/** Собирает query-строку, пропуская null/undefined. */
export function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const ApiEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().nullable(),
  error: z
    .object({
      message: z.string(),
      code: z.string().optional(),
      details: z.unknown().optional(),
    })
    .nullable(),
});

function buildFetchHeaders(init?: RequestInit): HeadersInit {
  return {
    Accept: "application/json",
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...init?.headers,
  };
}

async function resolveServerMock<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const { resolveMock } = await import("@/mocks/resolve");
  const data = await resolveMock(path, init);
  if (data === undefined) {
    throw new ApiError(404, path);
  }
  return schema.parse(data);
}

/**
 * Выполняет запрос и валидирует ответ схемой Zod.
 * @throws {ApiError} при не-2xx ответе.
 * @throws {z.ZodError} если тело ответа не соответствует контракту.
 */
export async function apiFetch<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  if (shouldServerMock(path)) {
    return resolveServerMock(path, schema, init);
  }

  const url = `${resolveApiBase()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: buildFetchHeaders(init),
  });

  if (!res.ok) {
    throw new ApiError(res.status, url);
  }

  const json: unknown = await res.json();
  return schema.parse(json);
}

/**
 * Fetch с разбором бэкенд-конверта { success, data, error }.
 * В mock-режиме (server) — чистый payload, как apiFetch.
 */
export async function apiEnvelopeFetch<T>(
  path: string,
  dataSchema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  if (shouldServerMock(path)) {
    return resolveServerMock(path, dataSchema, init);
  }

  const url = `${resolveApiBase()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: buildFetchHeaders(init),
  });

  const json: unknown = await res.json();
  const envelope = ApiEnvelopeSchema.safeParse(json);

  if (!res.ok) {
    const message =
      envelope.success && envelope.data.error?.message
        ? envelope.data.error.message
        : undefined;
    throw new ApiError(res.status, url, message);
  }

  if (!envelope.success) {
    throw new ApiError(res.status, url, "Invalid API envelope");
  }

  if (!envelope.data.success) {
    throw new ApiError(
      res.status,
      url,
      envelope.data.error?.message ?? "Request failed",
    );
  }

  return dataSchema.parse(envelope.data.data);
}
