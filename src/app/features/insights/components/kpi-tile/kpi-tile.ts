import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Sparkline } from '../sparkline/sparkline';

/**
 * Label, value, change against the previous period, and the shape that got
 * there. The arrow's colour reads direction × whether that direction is good —
 * expenses falling is green, revenue falling is not — and it always ships with
 * the signed number beside it, so colour is never the only cue.
 */
@Component({
  selector: 'app-kpi-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Sparkline],
  template: `
    <article class="app-card flex flex-col gap-1.5 px-3 py-2.5">
      <p class="text-[11px] font-medium text-slate-500">{{ label() }}</p>
      <p class="text-brand-900 text-lg leading-tight font-semibold tracking-tight">{{ value() }}</p>

      <div class="flex items-end justify-between gap-2">
        <p class="flex items-baseline gap-1 text-[11px]">
          @if (delta(); as change) {
            <span class="font-semibold" [class]="deltaClass()">{{ arrow() }} {{ change }}</span>
            <span class="text-slate-400">{{ comparedTo() }}</span>
          } @else {
            <span class="text-slate-400">{{ noComparison() }}</span>
          }
        </p>

        <div class="w-20 shrink-0">
          <app-sparkline
            [values]="series()"
            [strokeClass]="strokeClass()"
            [fillClass]="fillClass()"
          />
        </div>
      </div>
    </article>
  `,
})
export class KpiTile {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly series = input.required<readonly number[]>();
  /** Formatted change, or `null` when there is no earlier period to compare with. */
  readonly delta = input<string | null>(null);
  readonly direction = input<'up' | 'down' | 'flat'>('flat');
  /** False for measures where a fall is the good news — expenses, no-shows. */
  readonly upIsGood = input(true);
  readonly comparedTo = input.required<string>();
  readonly noComparison = input.required<string>();
  readonly strokeClass = input('stroke-chart-1');
  readonly fillClass = input('fill-chart-1');

  protected readonly arrow = computed(() => {
    switch (this.direction()) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      default:
        return '■';
    }
  });

  protected readonly deltaClass = computed(() => {
    const direction = this.direction();
    if (direction === 'flat') {
      return 'text-slate-500';
    }

    const good = direction === 'up' ? this.upIsGood() : !this.upIsGood();
    return good ? 'text-emerald-600' : 'text-rose-600';
  });
}
