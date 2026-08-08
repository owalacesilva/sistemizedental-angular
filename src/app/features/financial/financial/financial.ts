import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { PageHeader } from '../../../shared/ui/page-header/page-header';

interface FinancialTab {
  readonly label: string;
  readonly route: string;
  /** Inline SVG path data (24×24 viewBox, stroke-based). */
  readonly icon: string;
}

const TABS: readonly FinancialTab[] = [
  {
    label: 'Statement',
    route: 'statement',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    label: 'Bills to pay',
    route: 'payables',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: 'Payment methods',
    route: 'payment-methods',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
];

/** Section shell: the tab bar is the navigation, each tab is its own lazy route. */
@Component({
  selector: 'app-financial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PageHeader],
  template: `
    <div class="mx-auto max-w-7xl space-y-6">
      <app-page-header
        heading="Financial"
        description="Cash movements, bills to pay and how the clinic takes money."
      />

      <nav class="app-card flex gap-1 overflow-x-auto p-1.5" aria-label="Financial sections">
        @for (tab of tabs; track tab.route) {
          <a
            class="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap text-slate-600 transition hover:bg-slate-50"
            [routerLink]="tab.route"
            routerLinkActive="bg-brand-600 text-white hover:bg-brand-600"
            #link="routerLinkActive"
            [attr.aria-current]="link.isActive ? 'page' : null"
          >
            <svg
              class="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="tab.icon" />
            </svg>
            {{ tab.label }}
          </a>
        }
      </nav>

      <router-outlet />
    </div>
  `,
})
export class Financial {
  protected readonly tabs = TABS;
}
