import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { HEAT_EMPTY, HEAT_STEPS, type HeatRowView } from '../../insights.charts';

/**
 * Weekday × hour demand, as a sequential grid.
 *
 * One hue, light to dark — magnitude, not identity — with a 2px surface gap
 * doing the separating and a scale legend, without which a sequential fill is
 * unreadable. Each cell carries its exact count as a native tooltip.
 */
@Component({
  selector: 'app-heat-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="m-0">
      <div class="overflow-x-auto">
        <div class="grid min-w-[26rem] gap-0.5" [style.grid-template-columns]="columns()">
          <span></span>
          @for (hour of hours(); track hour) {
            <span class="text-center text-[9px] text-slate-400 tabular-nums">{{ hour }}</span>
          }

          @for (row of rows(); track row.key) {
            <span class="pr-1 text-right text-[10px] leading-4 text-slate-400">{{
              row.label
            }}</span>
            @for (cell of row.cells; track cell.hour) {
              <span
                class="h-4 rounded-[3px]"
                [class]="cell.colorClass"
                [attr.title]="cell.title"
              ></span>
            }
          }
        </div>
      </div>

      <figcaption class="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
        {{ lessLabel() }}
        <span class="h-2.5 w-4 rounded-[3px]" [class]="emptyStep"></span>
        @for (step of steps; track step) {
          <span class="h-2.5 w-4 rounded-[3px]" [class]="step"></span>
        }
        {{ moreLabel() }}
      </figcaption>
    </figure>
  `,
})
export class HeatGrid {
  readonly rows = input.required<readonly HeatRowView[]>();
  readonly hours = input.required<readonly number[]>();
  readonly lessLabel = input.required<string>();
  readonly moreLabel = input.required<string>();

  protected readonly steps = HEAT_STEPS;
  protected readonly emptyStep = HEAT_EMPTY;

  protected readonly columns = computed(
    () => `2.25rem repeat(${this.hours().length}, minmax(0, 1fr))`,
  );
}
