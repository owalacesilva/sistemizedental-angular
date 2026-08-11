/**
 * View models the chart components render. The page formats every number before
 * it gets here, so the charts stay free of locale and currency concerns.
 */

/** Fixed slot order — a series keeps its colour when a filter removes its neighbours. */
export const CHART_SLOTS: readonly string[] = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
];

export interface ColumnPoint {
  readonly label: string;
  readonly primary: number;
  readonly secondary: number;
  /** Native tooltip: the exact figures the axis only approximates. */
  readonly title: string;
}

export interface AxisTick {
  readonly label: string;
  /** Distance from the baseline, 0–100. */
  readonly offset: number;
}

export interface ShareSegment {
  readonly key: string;
  readonly label: string;
  readonly percent: number;
  readonly valueLabel: string;
  readonly percentLabel: string;
  readonly colorClass: string;
}

export interface RankedItem {
  readonly key: string;
  readonly label: string;
  /** Width of the bar, 0–100. */
  readonly percent: number;
  readonly valueLabel: string;
}

export interface HeatCellView {
  readonly hour: number;
  readonly title: string;
  /** A step of the brand ramp — one hue, light to dark. */
  readonly colorClass: string;
}

export interface HeatRowView {
  readonly key: number;
  readonly label: string;
  readonly cells: readonly HeatCellView[];
}

/**
 * Sequential ramp for the heatmap: a single hue, light to dark, with an empty
 * cell falling back to a neutral so "nothing booked" never reads as "a little".
 */
export const HEAT_STEPS: readonly string[] = [
  'bg-brand-100',
  'bg-brand-300',
  'bg-brand-500',
  'bg-brand-700',
];

export const HEAT_EMPTY = 'bg-slate-100';
