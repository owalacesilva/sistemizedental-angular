import { LOCALE_ID, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { registerAppLocales } from './i18n.locales';
import { detectLocale } from './i18n.storage';

/**
 * Seeds Angular's `LOCALE_ID` from the persisted choice so the very first render
 * already formats dates and money the right way. Later switches are handled by
 * `I18nService` — see `injectLocale()`.
 */
export function provideI18n(): EnvironmentProviders {
  registerAppLocales();

  return makeEnvironmentProviders([{ provide: LOCALE_ID, useFactory: detectLocale }]);
}
