import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { AxisTick, ColumnPoint } from '../../insights.charts';

/**
 * Two series over time, side by side on **one** axis.
 *
 * Built from elements rather than SVG so the tick and category labels keep the
 * app's type rendering at any container width. Columns are capped well under
 * the band width — the leftover is deliberate air — and separated by a 2px gap
 * in the surface colour rather than by a stroke.
 */
@Component({
  selector: 'app-column-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="m-0">
      <div class="relative h-40 pl-10">
        <!-- Gridlines: solid hairlines, one step off the surface -->
        @for (tick of ticks(); track tick.label) {
          <div
            class="border-chart-grid absolute right-0 left-10 border-t"
            [style.bottom.%]="tick.offset"
          >
            <span
              class="absolute -left-10 w-9 -translate-y-1/2 text-right text-[10px] text-slate-400 tabular-nums"
            >
              {{ tick.label }}
            </span>
          </div>
        }

        <div class="relative flex h-full items-end gap-1.5">
          @for (point of points(); track point.label) {
            <div class="flex h-full min-w-0 flex-1 items-end justify-center gap-0.5">
              <div
                class="bg-chart-1 w-full max-w-3 rounded-t"
                [style.height.%]="height(point.primary)"
                [attr.title]="point.title"
              ></div>
              <div
                class="bg-chart-2 w-full max-w-3 rounded-t"
                [style.height.%]="height(point.secondary)"
                [attr.title]="point.title"
              ></div>
            </div>
          }
        </div>
      </div>

      <div class="mt-1.5 flex gap-1.5 pl-10">
        @for (point of points(); track point.label) {
          <span class="min-w-0 flex-1 truncate text-center text-[10px] text-slate-400">
            {{ point.label }}
          </span>
        }
      </div>

      <!-- Legend: identity never rests on colour alone -->
      <figcaption class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span class="flex items-center gap-1.5">
          <span class="bg-chart-1 h-2 w-2 rounded-full"></span>
          <span class="text-slate-600">{{ primaryLabel() }}</span>
          <span class="font-semibold text-slate-800 tabular-nums">{{ primaryTotal() }}</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="bg-chart-2 h-2 w-2 rounded-full"></span>
          <span class="text-slate-600">{{ secondaryLabel() }}</span>
          <span class="font-semibold text-slate-800 tabular-nums">{{ secondaryTotal() }}</span>
        </span>
      </figcaption>
    </figure>
  `,
})
export class ColumnChart {
  readonly points = input.required<readonly ColumnPoint[]>();
  readonly ticks = input.required<readonly AxisTick[]>();
  readonly max = input.required<number>();
  readonly primaryLabel = input.required<string>();
  readonly secondaryLabel = input.required<string>();
  readonly primaryTotal = input.required<string>();
  readonly secondaryTotal = input.required<string>();

  private readonly scale = computed(() => this.max() || 1);

  /** A non-zero value always keeps a sliver of ink, so "small" never reads as "none". */
  protected height(value: number): number {
    if (value <= 0) {
      return 0;
    }
    return Math.max(1.5, (value / this.scale()) * 100);
  }
}
