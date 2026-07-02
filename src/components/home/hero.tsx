import { HomeBanner } from "./home-banner";

/**
 * Hero «Лето в доме». Первый full-bleed баннер главной (единственный h1 на странице).
 */
export function Hero() {
  return (
    <HomeBanner
      as="h1"
      image="/placeholders/hero.svg"
      title="Лето в доме"
      subtitle="Натуральный декор для дома и предметы интерьера, которые создают атмосферу спокойствия и уюта."
      href="/catalog/"
      ctaLabel="Подробнее"
      priority
      overlay="card"
    />
  );
}
