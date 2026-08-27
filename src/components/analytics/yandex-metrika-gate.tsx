import { Suspense } from "react";

import { YandexMetrika } from "./yandex-metrika";

/** Server wrapper: only mount Metrika when public env id is set. */
export function YandexMetrikaGate() {
  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim();
  if (!counterId) return null;

  return (
    <Suspense fallback={null}>
      <YandexMetrika counterId={counterId} />
    </Suspense>
  );
}
