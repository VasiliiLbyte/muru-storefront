/**
 * Next.js instrumentation: запускается один раз при старте сервера.
 *
 * Заметка по мокам: MSW НЕ перехватывает fetch в RSC-рантайме Next, поэтому
 * серверные фетчи (Server Components) в dev резолвятся из моков напрямую в
 * src/lib/api/client.ts (isServerMockEnabled). Браузерные фетчи перехватывает
 * browser-воркер (MSWProvider), тесты — node-сервер MSW (src/mocks/server.ts).
 * Здесь пока ничего не инициализируем (слот под телеметрию — Промпт 15).
 */
export function register() {}
