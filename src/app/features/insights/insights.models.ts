export type InsightsPeriod = '30d' | '90d' | 'month' | 'lastMonth' | 'year';

/** A measure, the same measure one period earlier, and its shape over the window. */
export interface Kpi {
  readonly current: number;
  readonly previous: number;
  readonly series: readonly number[];
}

/** Short windows read better by week; long ones by calendar month. */
export type TrendGranularity = 'week' | 'month';

/** One column of the revenue/expenses chart. */
export interface TrendBucket {
  /** The bucket's first day, `YYYY-MM-DD`. Formatted for display by the page. */
  readonly startIso: string;
  readonly revenue: number;
  readonly expenses: number;
}

/** A slice of a part-to-whole chart, or a bar in a ranked one. */
export interface CategoryShare {
  readonly key: string;
  readonly label: string;
  readonly value: number;
}

/** One cell of the weekday × hour grid. */
export interface HourCell {
  readonly weekday: number;
  readonly hour: number;
  readonly count: number;
}

export interface InsightsData {
  readonly revenue: Kpi;
  readonly expenses: Kpi;
  readonly balance: Kpi;
  readonly appointments: Kpi;
  readonly averageTicket: Kpi;
  /** Share of appointments marked as a no-show, 0–1. */
  readonly noShowRate: Kpi;
  readonly trend: readonly TrendBucket[];
  readonly granularity: TrendGranularity;
  readonly outcomes: readonly CategoryShare[];
  readonly procedures: readonly CategoryShare[];
  readonly payments: readonly CategoryShare[];
  readonly hours: readonly HourCell[];
  readonly busiestHourCount: number;
  /** True when either source came from the in-memory demo backend. */
  readonly isDemoData: boolean;
}
