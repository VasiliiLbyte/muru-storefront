import type { CdekCity } from "@/lib/schemas";

/** Имя города для DaData-фильтра `locations` — без ", Россия"/региона. */
export function cityNameForAddressSuggest(city: CdekCity): string {
  const short = (city.city || "").trim();
  if (short && !short.includes(",")) return short;
  const fromFull = (city.full_name || "").split(",")[0]?.trim() ?? "";
  return fromFull || short;
}
