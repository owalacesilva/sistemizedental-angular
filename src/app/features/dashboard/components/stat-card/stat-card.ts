import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type TrendDirection = 'up' | 'down' | 'flat';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="app-card p-4">
      <div class="flex items-start justify-between gap-2">
        <p class="text-xs font-medium text-slate-500">{{ label() }}</p>
        <span
          class="bg-brand-50 text-brand-600 inline-flex h-7 w-7 items-center justify-center rounded-lg"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="icon()" />
          </svg>
        </span>
      </div>

      <p class="text-brand-900 mt-2 text-xl font-semibold tracking-tight">{{ value() ?? '—' }}</p>

      @if (caption(); as text) {
        <p class="mt-1.5 flex items-center gap-1.5 text-[11px]">
          <span class="font-semibold" [class]="trendClass()">{{ trendSymbol() }} {{ text }}</span>
          <span class="text-slate-400">{{ captionSuffix() }}</span>
        </p>
      }
    </article>
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  /** Pre-formatted value. Nullable so Angular's number pipes can be piped straight in. */
  readonly value = input.required<string | null>();
  readonly icon = input.required<string>();
  readonly caption = input<string | null>(null);
  readonly captionSuffix = input('vs. last month');
  readonly trend = input<TrendDirection>('flat');

  protected readonly trendClass = computed(() => {
    switch (this.trend()) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-rose-600';
      default:
        return 'text-slate-500';
    }
  });

  protected readonly trendSymbol = computed(() => {
    switch (this.trend()) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      default:
        return '■';
    }
  });
}
