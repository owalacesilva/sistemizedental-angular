import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from './i18n.models';

/** Namespaced so it never collides with the legacy `acc_*` keys. */
const STORAGE_KEY = 'app_locale';

export function readStoredLocale(): AppLocale | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isAppLocale(stored) ? stored : null;
  } catch {
    // Private mode, or storage disabled — fall back to detection.
    return null;
  }
}

export function writeStoredLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Nothing to do: the choice simply will not survive a reload.
  }
}

/**
 * An explicit choice wins; otherwise a Portuguese-speaking browser gets pt-BR
 * and everyone else the default. Only the language subtag is considered, so
 * `pt`, `pt-BR` and `pt-PT` all land on Brazilian Portuguese.
 */
export function detectLocale(): AppLocale {
  const stored = readStoredLocale();
  if (stored) {
    return stored;
  }

  const preferred = typeof navigator === 'undefined' ? '' : (navigator.language ?? '');
  return preferred.toLowerCase().startsWith('pt') ? 'pt-BR' : DEFAULT_LOCALE;
}
