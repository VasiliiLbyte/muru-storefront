"use client";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

export type ContactMapProps = {
  className?: string;
  lat: number;
  lng: number;
  mapZoom: number;
  address: string;
};

export function ContactMap({
  className,
  lat,
  lng,
  mapZoom,
  address,
}: ContactMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !visible || mapRef.current) return;

    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
      }).setView([lat, lng], mapZoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Leaflet default marker paths break under bundlers — set inline icon.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      L.marker([lat, lng]).addTo(map);

      mapRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [visible, lat, lng, mapZoom]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        role="region"
        aria-label={`Карта: ${address}`}
        aria-busy={visible && !ready}
        className="h-[min(60vh,28rem)] w-full border border-border bg-surface"
      />
      <noscript>
        <p className="mt-2 text-small text-text-muted">{address}</p>
      </noscript>
    </div>
  );
}
