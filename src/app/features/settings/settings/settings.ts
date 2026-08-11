import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { injectT } from '../../../core/i18n/translate';
import { findNavChild } from '../../../layout/navigation';
import { injectCurrentUrl } from '../../../shared/router/current-url';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

/**
 * Section shell. The side rail that used to sit here has moved into the sidebar,
 * so the form gets the full width and the sub-navigation stays reachable from
 * anywhere in the app.
 */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PageHeader],
  template: `
    <div class="mx-auto w-full max-w-3xl space-y-4">
      <app-page-header
        [eyebrow]="t('settings.title')"
        [heading]="heading()"
        [description]="description()"
      />

      <router-outlet />
    </div>
  `,
})
export class Settings {
  private readonly url = injectCurrentUrl();

  protected readonly t = injectT();

  private readonly child = computed(() => findNavChild(this.url()));

  protected readonly heading = computed(() => {
    const child = this.child();
    return child ? this.t(child.labelKey) : this.t('settings.title');
  });

  protected readonly description = computed(() => {
    const child = this.child();
    return child ? this.t(child.descriptionKey) : this.t('settings.subtitle');
  });
}
