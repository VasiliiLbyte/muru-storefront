/** д.13 → д. 13; пом.27 → пом. 27 (идемпотентно). */
export function normalizeContactAddress(address: string): string {
  return address
    .replace(/д\.\s*(\d+)/gi, "д. $1")
    .replace(/пом\.\s*(\d+)/gi, "пом. $1")
    .replace(/\s+/g, " ")
    .trim();
}

const INDEX_RE = /^\d{5,6}$/;
// Ключевое слово улицы может стоять и не первым: «Пресненская наб. 12».
const STREET_RE =
  /(^|\s)(ул\.|улица|просп\.|проспект|пр-т|пер\.|переулок|наб\.|набережная|ш\.|шоссе|б-р|бульвар)(\s|$)/i;
const BUILDING_RE = /^(литера|лит\.|корп\.|корпус|стр\.|строение|пом\.|помещение|офис|оф\.)/i;

/**
 * Адрес по строкам, как в макете дизайнера (2026-09-10):
 * индекс / город / улица с домом / литера с помещением.
 * Части, которые не распознались, приклеиваются к предыдущей строке —
 * произвольный адрес из CMS не рассыпается.
 */
export function splitContactAddress(address: string): string[] {
  const parts = normalizeContactAddress(address)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const lines: string[] = [];
  let section: "index" | "city" | "street" | "building" | null = null;

  for (const part of parts) {
    const next = INDEX_RE.test(part)
      ? "index"
      : STREET_RE.test(part)
        ? "street"
        : BUILDING_RE.test(part)
          ? "building"
          : null;

    if (next && next !== section) {
      section = next;
      lines.push(part);
      continue;
    }

    // Город идёт после индекса и до улицы — отдельной строкой.
    if (section === "index") {
      section = "city";
      lines.push(part);
      continue;
    }

    if (lines.length === 0) {
      section = "city";
      lines.push(part);
      continue;
    }

    lines[lines.length - 1] = `${lines[lines.length - 1]}, ${part}`;
  }

  // Запятая в конце каждой строки, кроме последней.
  return lines.map((line, i) =>
    i === lines.length - 1 || line.endsWith(",") ? line : `${line},`,
  );
}
