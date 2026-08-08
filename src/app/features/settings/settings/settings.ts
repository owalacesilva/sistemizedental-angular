import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { PageHeader } from '../../../shared/ui/page-header/page-header';

interface SettingsTab {
  readonly label: string;
  readonly route: string;
  readonly description: string;
}

const TABS: readonly SettingsTab[] = [
  { label: 'Clinic profile', route: 'profile', description: 'Name, contact and public page' },
  { label: 'Address', route: 'address', description: 'Where patients find you' },
  { label: 'Security', route: 'security', description: 'Account password' },
];

/** Section shell: a side rail on wide screens, stacked tabs on narrow ones. */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PageHeader],
  template: `
    <div class="mx-auto max-w-5xl space-y-6">
      <app-page-header
        heading="Settings"
        description="How the clinic presents itself and who can sign in."
      />

      <div class="grid gap-6 lg:grid-cols-[15rem_1fr]">
        <nav class="app-card h-fit p-1.5" aria-label="Settings sections">
          @for (tab of tabs; track tab.route) {
            <a
              class="block rounded-lg px-3.5 py-2.5 transition hover:bg-slate-50"
              [routerLink]="tab.route"
              routerLinkActive="bg-brand-600 hover:bg-brand-600"
              #link="routerLinkActive"
              [attr.aria-current]="link.isActive ? 'page' : null"
            >
              <span
                class="block text-sm font-semibold"
                [class]="link.isActive ? 'text-white' : 'text-slate-700'"
              >
                {{ tab.label }}
              </span>
              <span
                class="block text-xs"
                [class]="link.isActive ? 'text-brand-100' : 'text-slate-400'"
              >
                {{ tab.description }}
              </span>
            </a>
          }
        </nav>

        <router-outlet />
      </div>
    </div>
  `,
})
export class Settings {
  protected readonly tabs = TABS;
}
