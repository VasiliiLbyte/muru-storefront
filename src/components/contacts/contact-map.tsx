import { cn } from "@/lib/utils";

export type ContactMapProps = {
  className?: string;
  lat: number;
  lng: number;
  mapZoom: number;
  address: string;
};

/** Яндекс.Карты iframe (без JS API-ключа). Порядок: lng,lat. */
export function ContactMap({
  className,
  lat,
  lng,
  mapZoom,
  address,
}: ContactMapProps) {
  const src = new URL("https://yandex.ru/map-widget/v1/");
  src.searchParams.set("ll", `${lng},${lat}`);
  src.searchParams.set("z", String(mapZoom));
  src.searchParams.set("pt", `${lng},${lat},pm2rdm`);
  src.searchParams.set("lang", "ru_RU");

  return (
    <div className={cn("relative", className)}>
      <iframe
        src={src.toString()}
        title={`Карта: ${address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allow="fullscreen"
        className="h-[min(60vh,28rem)] w-full border border-border bg-surface"
      />
      <noscript>
        <p className="mt-2 text-small text-text-muted">{address}</p>
      </noscript>
    </div>
  );
}
