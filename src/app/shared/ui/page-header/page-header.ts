import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Title block every routed page opens with. Projected content becomes the actions. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div class="min-w-0">
        @if (eyebrow(); as section) {
          <p class="text-brand-600 text-[11px] font-semibold tracking-wide uppercase">
            {{ section }}
          </p>
        }
        <h1 class="text-brand-900 text-xl font-semibold tracking-tight">{{ heading() }}</h1>
        @if (description(); as text) {
          <p class="mt-0.5 text-xs text-slate-500">{{ text }}</p>
        }
      </div>
      <div class="flex flex-wrap items-center gap-1.5"><ng-content /></div>
    </header>
  `,
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly description = input<string | null>(null);
  /** Section a sub-page belongs to, now that the sub-navigation sits in the sidebar. */
  readonly eyebrow = input<string | null>(null);
}
