import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../../../core/i18n/i18n.service';
import type { AppLocale } from '../../../core/i18n/i18n.models';

/**
 * Two-language segmented control. With only pt-BR and en-US on offer a dropdown
 * would be a click too many — both options are always visible.
 */
@Component({
  selector: 'app-locale-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center rounded-lg border border-slate-200 bg-white p-0.5"
      role="group"
      [attr.aria-label]="t('locale.label')"
    >
      @for (option of locales; track option) {
        <button
          type="button"
          class="rounded-md px-1.5 py-0.5 text-[11px] font-semibold transition"
          [class]="
            locale() === option
              ? 'bg-brand-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          "
          [attr.aria-pressed]="locale() === option"
          [attr.title]="t(labelKey(option))"
          (click)="select(option)"
        >
          {{ i18n.shortLabel(option) }}
        </button>
      }
    </div>
  `,
})
export class LocaleSwitcher {
  protected readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.t;
  protected readonly locale = this.i18n.locale;
  protected readonly locales = this.i18n.locales;

  protected labelKey(locale: AppLocale): 'locale.en-US' | 'locale.pt-BR' {
    return locale === 'pt-BR' ? 'locale.pt-BR' : 'locale.en-US';
  }

  protected select(locale: AppLocale): void {
    this.i18n.use(locale);
  }
}
