import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** MSW worker для dev (browser). Подключение в приложении — Промпт 4. */
export const worker = setupWorker(...handlers);
