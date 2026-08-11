import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

import {
  APP_LOCALES,
  type AppLocale,
  type MessageParams,
  type PluralFn,
  type TranslateFn,
} from './i18n.models';
import { registerAppLocales } from './i18n.locales';
import { detectLocale, writeStoredLocale } from './i18n.storage';
import { EN_US_MESSAGES, type MessageKey } from './messages.en';
import { PT_BR_MESSAGES } from './messages.pt';

const DICTIONARIES: Record<AppLocale, Record<MessageKey, string>> = {
  'en-US': EN_US_MESSAGES,
  'pt-BR': PT_BR_MESSAGES,
};

/**
 * Runtime translation, so switching language never reloads the app.
 *
 * `t()` and `plural()` read the `locale` signal, which is what makes them
 * reactive: called from a template they are tracked by that view's reactive
 * context, so changing the language marks the view dirty. A pure pipe could not
 * do this — Angular caches it on its arguments and the key never changes.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<AppLocale>(detectLocale());
  private readonly messages = computed(() => DICTIONARIES[this.current()]);

  readonly locale = this.current.asReadonly();
  readonly locales = APP_LOCALES;

  readonly t: TranslateFn = (key, params) => interpolate(this.messages()[key], params, key);

  readonly plural: PluralFn = (key, count, params) =>
    this.t(`${key}.${count === 1 ? 'one' : 'other'}` as MessageKey, { ...params, count });

  constructor() {
    registerAppLocales();

    // Keeps `<html lang>` honest for screen readers and browser translation.
    effect(() => {
      this.document.documentElement.lang = this.current();
    });
  }

  use(locale: AppLocale): void {
    if (locale === this.current()) {
      return;
    }

    writeStoredLocale(locale);
    this.current.set(locale);
  }

  /** Short label for the language switcher — `EN` / `PT`. */
  shortLabel(locale: AppLocale): string {
    return locale.slice(0, 2).toUpperCase();
  }
}

/** Fills `{placeholders}`; an unknown key renders as itself so gaps are visible. */
function interpolate(template: string | undefined, params: MessageParams | undefined, key: string) {
  if (!template) {
    return key;
  }
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : `${value}`;
  });
}
