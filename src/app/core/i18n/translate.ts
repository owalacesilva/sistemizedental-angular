import { inject, type Signal } from '@angular/core';

import type { AppLocale, PluralFn, TranslateFn } from './i18n.models';
import { I18nService } from './i18n.service';

/**
 * The three hooks a component needs. Kept as free functions so a template reads
 * `t('patients.title')` rather than `i18n.t('patients.title')`.
 *
 * Usage: `protected readonly t = injectT();`
 */
export function injectT(): TranslateFn {
  return inject(I18nService).t;
}

/** Count-aware sibling of `injectT()`, for `<base>.one` / `<base>.other` keys. */
export function injectPlural(): PluralFn {
  return inject(I18nService).plural;
}

/**
 * The active locale, to hand to `date` / `currency` / `number` / `percent` as
 * their locale argument. Those pipes are pure and re-run when an argument
 * changes, so passing this keeps them live across a language switch — reading
 * `LOCALE_ID` alone would freeze them at the locale the app booted with.
 */
export function injectLocale(): Signal<AppLocale> {
  return inject(I18nService).locale;
}
