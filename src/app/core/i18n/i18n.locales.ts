import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

let registered = false;

/**
 * Teaches Angular's date/number/currency pipes how Brazilian Portuguese
 * formats things. `en-US` is compiled in, so only pt needs registering — the
 * `pt` data set *is* Brazilian Portuguese, we just file it under `pt-BR` too so
 * either tag resolves.
 */
export function registerAppLocales(): void {
  if (registered) {
    return;
  }

  registerLocaleData(localePt, 'pt-BR');
  registered = true;
}
