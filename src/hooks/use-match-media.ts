"use client";

import { useEffect, useState } from "react";

/**
 * matchMedia subscriber. SSR / first paint is always `false` (no window).
 */
export function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
export const HOTSPOT_SHEET_QUERY = "(pointer: coarse), (max-width: 767px)";

export function useFineHover(): boolean {
  return useMatchMedia(FINE_HOVER_QUERY);
}

export function useHotspotSheetMode(): boolean {
  return useMatchMedia(HOTSPOT_SHEET_QUERY);
}
