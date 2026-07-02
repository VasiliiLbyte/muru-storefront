/**
 * Типизированный API-клиент MURU.
 * Любой фетч проходит через эти методы и валидируется Zod на рантайме.
 */
export { API_BASE, ApiError, apiFetch, buildQuery } from "./client";
export * from "./endpoints";
