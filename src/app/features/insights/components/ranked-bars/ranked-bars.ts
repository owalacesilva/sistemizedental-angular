import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { RankedItem } from '../../insights.charts';

/**
 * Magnitude, high to low, in one hue.
 *
 * Deliberately *not* a value ramp: the categories have no natural order, and
 * shading each bar by its own length would burn the colour channel on
 * information the bar already carries. One series, one colour.
 */
@Component({
  selector: 'app-ranked-bars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="space-y-2.5">
      @for (item of items(); track item.key) {
        <li>
          <div class="flex items-baseline justify-between gap-2 text-xs">
            <span class="min-w-0 truncate text-slate-600">{{ item.label }}</span>
            <span class="shrink-0 font-semibold text-slate-800 tabular-nums">
              {{ item.valueLabel }}
            </span>
          </div>
          <div class="bg-chart-track mt-1 h-2 w-full rounded-sm">
            <div class="bg-chart-1 h-2 rounded-r" [style.width.%]="item.percent"></div>
          </div>
        </li>
      }
    </ul>
  `,
})
export class RankedBars {
  readonly items = input.required<readonly RankedItem[]>();
}
