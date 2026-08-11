import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { injectT } from '../../../core/i18n/translate';
import { findNavChild } from '../../../layout/navigation';
import { injectCurrentUrl } from '../../../shared/router/current-url';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

/**
 * Section shell. The tab bar that used to sit here has moved into the sidebar,
 * where it costs the content area nothing and stays visible from every other
 * screen — so all this has to do is say where you are.
 */
@Component({
  selector: 'app-financial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PageHeader],
  template: `
    <div class="app-page">
      <app-page-header
        [eyebrow]="t('financial.title')"
        [heading]="heading()"
        [description]="description()"
      />

      <router-outlet />
    </div>
  `,
})
export class Financial {
  private readonly url = injectCurrentUrl();

  protected readonly t = injectT();

  private readonly child = computed(() => findNavChild(this.url()));

  protected readonly heading = computed(() => {
    const child = this.child();
    return child ? this.t(child.labelKey) : this.t('financial.title');
  });

  protected readonly description = computed(() => {
    const child = this.child();
    return child ? this.t(child.descriptionKey) : this.t('financial.subtitle');
  });
}
