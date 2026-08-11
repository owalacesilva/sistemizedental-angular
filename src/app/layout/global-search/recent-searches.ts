/** Namespaced so it never collides with the legacy `acc_*` keys. */
const STORAGE_KEY = 'app_recent_searches';
const LIMIT = 5;

export function readRecentSearches(): readonly string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string').slice(0, LIMIT)
      : [];
  } catch {
    return [];
  }
}

/** Most recent first, de-duplicated case-insensitively. */
export function rememberSearch(term: string, current: readonly string[]): readonly string[] {
  const trimmed = term.trim();
  if (!trimmed) {
    return current;
  }

  const next = [
    trimmed,
    ...current.filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, LIMIT);

  write(next);
  return next;
}

export function clearRecentSearches(): readonly string[] {
  write([]);
  return [];
}

function write(entries: readonly string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // History is a convenience; losing it is not worth surfacing.
  }
}
