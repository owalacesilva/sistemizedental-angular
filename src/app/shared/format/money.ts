import { formatCurrency } from '@angular/common';

import type { AppLocale } from '../../core/i18n/i18n.models';
import { injectLocale } from '../../core/i18n/translate';

export type MoneyFn = (value: number, digitsInfo?: string) => string;

/**
 * The clinic bills in BRL whatever language the UI is in, so the symbol is
 * fixed and only the grouping and decimal marks follow the locale.
 *
 * The symbol carries its own trailing space in English and not in Portuguese:
 * pt-BR's currency pattern is `¤ #,##0.00` and already separates the two, while
 * en-US's is `¤#,##0.00` and does not. Passing one spaced symbol to both is what
 * produced `R$  12.000`.
 *
 * Usage: `protected readonly money = injectMoney();`
 */
export function injectMoney(): MoneyFn {
  const locale = injectLocale();

  return (value, digitsInfo = '1.2-2') =>
    formatCurrency(value, locale(), symbolFor(locale()), 'BRL', digitsInfo);
}

function symbolFor(locale: AppLocale): string {
  return locale === 'pt-BR' ? 'R$' : 'R$ ';
}
