/**
 * Детерминированные хелперы для фикстур.
 * Данные стабильны между перезагрузками dev и прогонами тестов.
 */

/** Простой строковый хэш (FNV-1a) → uint32-сид. */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Детерминированный PRNG (mulberry32). Возвращает функцию [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Детерминированный ГСЧ из строкового ключа. */
export function rngFrom(key: string): () => number {
  return mulberry32(hashSeed(key));
}

/** Целое в диапазоне [min, max]. */
export function intBetween(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Выбор элемента из массива. */
export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

/** Выбор подмножества (1..max элементов) без дублей. */
export function pickSome<T>(
  rng: () => number,
  arr: readonly T[],
  max: number,
): T[] {
  const count = intBetween(rng, 1, Math.min(max, arr.length));
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0] as T);
  }
  return out;
}

/** Цена, кратная 50, в диапазоне. */
export function priceFor(rng: () => number, min = 500, max = 12000): number {
  const raw = intBetween(rng, min / 50, max / 50) * 50;
  return raw;
}
