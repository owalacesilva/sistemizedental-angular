import type { MessageKey } from './messages.en';

/** The two locales the app ships. Adding a third means adding a dictionary. */
export type AppLocale = 'en-US' | 'pt-BR';

export const APP_LOCALES: readonly AppLocale[] = ['en-US', 'pt-BR'];

export const DEFAULT_LOCALE: AppLocale = 'en-US';

/** Values interpolated into a message's `{placeholders}`. */
export type MessageParams = Readonly<Record<string, string | number>>;

/**
 * Plural messages are stored as two sibling keys — `<base>.one` and
 * `<base>.other` — which covers the one/other split both locales use for the
 * counts this app renders.
 *
 * The indirection through a type parameter is what makes the conditional
 * distribute over the key union; matching `MessageKey` directly would test the
 * whole union at once and collapse to `never`.
 */
type PluralBase<Key> = Key extends `${infer Base}.one` ? Base : never;

export type PluralKey = PluralBase<MessageKey>;

export type TranslateFn = (key: MessageKey, params?: MessageParams) => string;
export type PluralFn = (key: PluralKey, count: number, params?: MessageParams) => string;

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && APP_LOCALES.includes(value as AppLocale);
}
