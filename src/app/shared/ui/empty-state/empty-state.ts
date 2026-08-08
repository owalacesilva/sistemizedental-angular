import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Placeholder for a list that has nothing to show. Projected content is the call to action. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center px-6 py-14 text-center">
      <span
        class="bg-brand-50 text-brand-500 inline-flex h-12 w-12 items-center justify-center rounded-full"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="icon()" />
        </svg>
      </span>

      <p class="mt-4 text-sm font-semibold text-slate-700">{{ heading() }}</p>
      @if (description(); as text) {
        <p class="mt-1 max-w-sm text-sm text-slate-500">{{ text }}</p>
      }
      <div class="mt-5 empty:mt-0"><ng-content /></div>
    </div>
  `,
})
export class EmptyState {
  readonly heading = input.required<string>();
  readonly description = input<string | null>(null);
  /** Inline SVG path data (24×24 viewBox, stroke-based). */
  readonly icon = input(
    'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
  );
}
