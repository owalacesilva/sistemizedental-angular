export interface HighlightPart {
  readonly text: string;
  readonly match: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits `text` around every case-insensitive occurrence of `term`, so the
 * palette can show *why* a row matched instead of leaving the reader to spot it.
 */
export function highlight(text: string, term: string): readonly HighlightPart[] {
  const needle = term.trim();
  if (!needle) {
    return [{ text, match: false }];
  }

  const lowered = needle.toLowerCase();

  return text
    .split(new RegExp(`(${escapeRegExp(needle)})`, 'ig'))
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === lowered }));
}
