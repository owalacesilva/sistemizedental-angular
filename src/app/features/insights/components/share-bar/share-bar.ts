import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { ShareSegment } from '../../insights.charts';

/**
 * Part-to-whole as one horizontal bar plus a legend that carries every value.
 *
 * The legend is not decoration: two of the four slots sit below 3:1 against the
 * white card, so the written value is what makes the chart readable without
 * relying on the fill. It doubles as the table view.
 */
@Component({
  selector: 'app-share-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="m-0">
      <div class="flex h-3 w-full gap-0.5">
        @for (segment of segments(); track segment.key) {
          <div
            class="first:rounded-l last:rounded-r"
            [class]="segment.colorClass"
            [style.width.%]="segment.percent"
            [attr.title]="segment.label + ' · ' + segment.valueLabel + ' · ' + segment.percentLabel"
          ></div>
        }
      </div>

      <figcaption>
        <ul class="mt-3 space-y-1.5">
          @for (segment of segments(); track segment.key) {
            <li class="flex items-center gap-2 text-xs">
              <span class="h-2 w-2 shrink-0 rounded-full" [class]="segment.colorClass"></span>
              <span class="min-w-0 flex-1 truncate text-slate-600">{{ segment.label }}</span>
              <span class="shrink-0 font-semibold text-slate-800 tabular-nums">
                {{ segment.valueLabel }}
              </span>
              <span class="w-11 shrink-0 text-right text-slate-400 tabular-nums">
                {{ segment.percentLabel }}
              </span>
            </li>
          }
        </ul>
      </figcaption>
    </figure>
  `,
})
export class ShareBar {
  readonly segments = input.required<readonly ShareSegment[]>();
}
