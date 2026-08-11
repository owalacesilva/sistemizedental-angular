import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { injectT } from '../../core/i18n/translate';
import { Logo } from '../../shared/ui/logo/logo';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo],
  template: `
    <div class="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <app-logo />
      <p class="text-brand-400 mt-10 text-6xl font-bold tracking-tight">404</p>
      <h1 class="text-brand-900 mt-3 text-2xl font-semibold tracking-tight">
        {{ t('notFound.heading') }}
      </h1>
      <p class="mt-2 max-w-sm text-sm text-slate-500">{{ t('notFound.body') }}</p>
      <a
        class="bg-brand-600 hover:bg-brand-700 mt-8 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition"
        routerLink="/dashboard"
      >
        {{ t('notFound.back') }}
      </a>
    </div>
  `,
})
export class NotFound {
  protected readonly t = injectT();
}
