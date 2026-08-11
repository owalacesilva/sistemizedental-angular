import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { injectT } from '../../../core/i18n/translate';
import type { MessageKey } from '../../../core/i18n/messages.en';
import { LocaleSwitcher } from '../../../shared/ui/locale-switcher/locale-switcher';
import { Logo } from '../../../shared/ui/logo/logo';

const FEATURE_KEYS: readonly MessageKey[] = [
  'auth.brand.feature1',
  'auth.brand.feature2',
  'auth.brand.feature3',
  'auth.brand.feature4',
];

@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo, LocaleSwitcher],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  readonly heading = input.required<string>();
  readonly subheading = input.required<string>();

  protected readonly t = injectT();
  protected readonly year = new Date().getFullYear();
  protected readonly featureKeys = FEATURE_KEYS;
}
