import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const WIDTH = 100;
const HEIGHT = 28;

/**
 * The shape of a measure over the window, at stat-tile size.
 *
 * The viewBox is stretched to the tile's width, so the stroke is drawn with
 * `non-scaling-stroke` — otherwise the 2px line thins or fattens with the
 * container and stops matching every other line in the app.
 */
@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (points(); as path) {
      <svg
        class="h-7 w-full"
        [attr.viewBox]="viewBox"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path [attr.d]="path.area" [class]="fillClass()" opacity="0.12" />
        <path
          [attr.d]="path.line"
          [class]="strokeClass()"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    }
  `,
})
export class Sparkline {
  readonly values = input.required<readonly number[]>();
  readonly strokeClass = input('stroke-chart-1');
  readonly fillClass = input('fill-chart-1');

  protected readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;

  protected readonly points = computed(() => {
    const values = this.values();
    if (values.length < 2) {
      return null;
    }

    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const step = WIDTH / (values.length - 1);

    const coords = values.map((value, index) => {
      const x = index * step;
      const y = HEIGHT - ((value - min) / span) * HEIGHT;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    return {
      line: `M${coords.join('L')}`,
      area: `M0,${HEIGHT}L${coords.join('L')}L${WIDTH},${HEIGHT}Z`,
    };
  });
}
