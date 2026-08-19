const STORAGE_KEY = "muru:recent-searches";
const MAX_RECENT = 5;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function addRecentSearch(q: string): void {
  const trimmed = q.trim();
  if (!trimmed) return;
  try {
    const current = getRecentSearches();
    const filtered = current.filter((v) => v.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Private browsing / SSR — ignore
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
