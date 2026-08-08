import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Title block every routed page opens with. Projected content becomes the actions. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-brand-900 text-2xl font-semibold tracking-tight">{{ heading() }}</h1>
        @if (description(); as text) {
          <p class="mt-1 text-sm text-slate-500">{{ text }}</p>
        }
      </div>
      <div class="flex flex-wrap items-center gap-2"><ng-content /></div>
    </header>
  `,
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly description = input<string | null>(null);
}
