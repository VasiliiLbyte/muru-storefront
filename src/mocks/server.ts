import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** MSW server для тестов (Vitest, node). Подключение — Промпт 4 / 14. */
export const server = setupServer(...handlers);
