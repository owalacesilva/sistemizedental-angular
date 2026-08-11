import { formatDate, formatNumber, formatPercent } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { injectLocale, injectT } from '../../../core/i18n/translate';
import type { MessageKey } from '../../../core/i18n/messages.en';
import { injectMoney } from '../../../shared/format/money';
import { Alert } from '../../../shared/ui/alert/alert';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { ColumnChart } from '../components/column-chart/column-chart';
import { HeatGrid } from '../components/heat-grid/heat-grid';
import { KpiTile } from '../components/kpi-tile/kpi-tile';
import { RankedBars } from '../components/ranked-bars/ranked-bars';
import { ShareBar } from '../components/share-bar/share-bar';
import {
  CHART_SLOTS,
  HEAT_EMPTY,
  HEAT_STEPS,
  type AxisTick,
  type HeatRowView,
  type RankedItem,
  type ShareSegment,
} from '../insights.charts';
import type { CategoryShare, InsightsPeriod, Kpi } from '../insights.models';
import { HEATMAP_END_HOUR, HEATMAP_START_HOUR, InsightsService } from '../insights.service';

const PERIODS: readonly { readonly value: InsightsPeriod; readonly labelKey: MessageKey }[] = [
  { value: '30d', labelKey: 'insights.period.30d' },
  { value: '90d', labelKey: 'insights.period.90d' },
  { value: 'month', labelKey: 'insights.period.month' },
  { value: 'lastMonth', labelKey: 'insights.period.lastMonth' },
  { value: 'year', labelKey: 'insights.period.year' },
];

/** Monday-first: a clinic's week starts when the chairs do. */
const WEEK_ORDER: readonly number[] = [1, 2, 3, 4, 5, 6, 0];

const HOURS: readonly number[] = Array.from(
  { length: HEATMAP_END_HOUR - HEATMAP_START_HOUR + 1 },
  (_, index) => HEATMAP_START_HOUR + index,
);

const OUTCOME_LABELS: Record<string, MessageKey> = {
  completed: 'insights.outcome.completed',
  booked: 'insights.outcome.booked',
  missed: 'insights.outcome.missed',
  canceled: 'insights.outcome.canceled',
};

interface KpiView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly delta: string | null;
  readonly direction: 'up' | 'down' | 'flat';
  readonly upIsGood: boolean;
  readonly series: readonly number[];
}

@Component({
  selector: 'app-insights',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Alert, PageHeader, Spinner, KpiTile, ColumnChart, ShareBar, RankedBars, HeatGrid],
  templateUrl: './insights.html',
})
export class Insights {
  private readonly insights = inject(InsightsService);

  protected readonly t = injectT();
  protected readonly locale = injectLocale();
  private readonly currency = injectMoney();

  protected readonly periods = PERIODS;
  protected readonly hours = HOURS;
  protected readonly period = signal<InsightsPeriod>('30d');

  protected readonly result = rxResource({
    params: () => this.period(),
    stream: ({ params }) => this.insights.load(params),
  });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly data = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly isDemoData = computed(() => this.data()?.isDemoData ?? false);
  protected readonly hasData = computed(() => this.data() !== null);

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? this.t('insights.error') : null;
  });

  // ── Headline numbers ───────────────────────────────────────────────────────

  protected readonly kpis = computed<readonly KpiView[]>(() => {
    const data = this.data();
    if (!data) {
      return [];
    }

    return [
      this.tile('revenue', 'insights.kpi.revenue', data.revenue, (value) => this.money(value)),
      this.tile(
        'expenses',
        'insights.kpi.expenses',
        data.expenses,
        (value) => this.money(value),
        false,
      ),
      this.tile('balance', 'insights.kpi.balance', data.balance, (value) => this.money(value)),
      this.tile('appointments', 'insights.kpi.appointments', data.appointments, (value) =>
        this.count(value),
      ),
      this.tile('avgTicket', 'insights.kpi.avgTicket', data.averageTicket, (value) =>
        this.money(value),
      ),
      this.tile(
        'noShow',
        'insights.kpi.noShow',
        data.noShowRate,
        (value) => this.share(value),
        false,
      ),
    ];
  });

  // ── Revenue vs. expenses ───────────────────────────────────────────────────

  private readonly trendMax = computed(() => {
    const trend = this.data()?.trend ?? [];
    return trend.reduce((max, bucket) => Math.max(max, bucket.revenue, bucket.expenses), 0);
  });

  protected readonly trendPoints = computed(() => {
    const data = this.data();
    if (!data) {
      return [];
    }

    const pattern = data.granularity === 'month' ? 'LLL' : 'd MMM';

    return data.trend.map((bucket) => {
      const label = formatDate(bucket.startIso, pattern, this.locale());
      return {
        label,
        primary: bucket.revenue,
        secondary: bucket.expenses,
        title: `${label} · ${this.t('insights.trend.revenue')} ${this.money(bucket.revenue)} · ${this.t('insights.trend.expenses')} ${this.money(bucket.expenses)}`,
      };
    });
  });

  /** Three solid hairlines is enough scaffolding; the tooltips carry the rest. */
  protected readonly trendTicks = computed<readonly AxisTick[]>(() => {
    const max = this.trendMax();
    if (!max) {
      return [];
    }

    return [0, 0.5, 1].map((fraction) => ({
      label: this.compactMoney(max * fraction),
      offset: fraction * 100,
    }));
  });

  protected readonly trendTotals = computed(() => {
    const trend = this.data()?.trend ?? [];
    return {
      revenue: this.money(trend.reduce((sum, bucket) => sum + bucket.revenue, 0)),
      expenses: this.money(trend.reduce((sum, bucket) => sum + bucket.expenses, 0)),
    };
  });

  protected readonly trendMaxValue = this.trendMax;

  // ── Breakdowns ─────────────────────────────────────────────────────────────

  protected readonly outcomes = computed<readonly ShareSegment[]>(() =>
    this.toSegments(
      this.data()?.outcomes ?? [],
      (share) => this.t(OUTCOME_LABELS[share.key] ?? 'insights.other'),
      (value) => this.count(value),
    ),
  );

  protected readonly payments = computed<readonly ShareSegment[]>(() =>
    this.toSegments(
      this.data()?.payments ?? [],
      (share) =>
        share.key === 'other'
          ? this.t('insights.other')
          : share.label || this.t('insights.noPaymentMethod'),
      (value) => this.money(value),
    ),
  );

  protected readonly procedures = computed<readonly RankedItem[]>(() => {
    const rows = this.data()?.procedures ?? [];
    const max = rows.reduce((best, row) => Math.max(best, row.value), 0) || 1;

    return rows.map((row) => ({
      key: row.key,
      label: row.label,
      percent: (row.value / max) * 100,
      valueLabel: this.money(row.value),
    }));
  });

  // ── Busiest hours ──────────────────────────────────────────────────────────

  protected readonly heatRows = computed<readonly HeatRowView[]>(() => {
    const data = this.data();
    if (!data) {
      return [];
    }

    const max = data.busiestHourCount;
    const counts = new Map(data.hours.map((cell) => [`${cell.weekday}:${cell.hour}`, cell.count]));

    return WEEK_ORDER.map((weekday) => ({
      key: weekday,
      label: this.t(`weekday.short.${weekday}` as MessageKey),
      cells: HOURS.map((hour) => {
        const count = counts.get(`${weekday}:${hour}`) ?? 0;
        return {
          hour,
          colorClass: heatStep(count, max),
          title: this.t('insights.hours.cell', {
            weekday: this.t(`weekday.${weekday}` as MessageKey),
            hour: `${`${hour}`.padStart(2, '0')}:00`,
            count,
          }),
        };
      }),
    }));
  });

  protected readonly hasHours = computed(() => (this.data()?.busiestHourCount ?? 0) > 0);

  // ── Interaction ────────────────────────────────────────────────────────────

  protected selectPeriod(period: InsightsPeriod): void {
    this.period.set(period);
  }

  protected reload(): void {
    this.result.reload();
  }

  // ── Formatting ─────────────────────────────────────────────────────────────

  /** Whole reais: cents are noise at dashboard scale. */
  protected money(value: number): string {
    return this.currency(value, '1.0-0');
  }

  protected count(value: number): string {
    return formatNumber(Math.round(value), this.locale(), '1.0-0');
  }

  protected share(value: number): string {
    return formatPercent(value, this.locale(), '1.0-1');
  }

  /** Axis ticks earn their space only if they stay short: 12.5k, not 12,480. */
  private compactMoney(value: number): string {
    if (value >= 1000) {
      return `${formatNumber(value / 1000, this.locale(), '1.0-1')}k`;
    }
    return formatNumber(value, this.locale(), '1.0-0');
  }

  private tile(
    key: string,
    labelKey: MessageKey,
    kpi: Kpi,
    format: (value: number) => string,
    upIsGood = true,
  ): KpiView {
    const change = relativeChange(kpi.current, kpi.previous);

    return {
      key,
      label: this.t(labelKey),
      value: format(kpi.current),
      delta: change === null ? null : formatPercent(Math.abs(change), this.locale(), '1.0-0'),
      direction: change === null || change === 0 ? 'flat' : change > 0 ? 'up' : 'down',
      upIsGood,
      series: kpi.series,
    };
  }

  private toSegments(
    shares: readonly CategoryShare[],
    label: (share: CategoryShare) => string,
    format: (value: number) => string,
  ): readonly ShareSegment[] {
    const total = shares.reduce((sum, share) => sum + share.value, 0);
    if (!total) {
      return [];
    }

    return shares.map((share, index) => ({
      key: share.key,
      label: label(share),
      percent: (share.value / total) * 100,
      valueLabel: format(share.value),
      percentLabel: formatPercent(share.value / total, this.locale(), '1.0-0'),
      // Fixed slot order, never cycled: the fifth class would repeat a hue, and
      // the service already folds anything past the fourth into "Other".
      colorClass: CHART_SLOTS[index] ?? CHART_SLOTS[CHART_SLOTS.length - 1],
    }));
  }
}

/** `null` when there is no earlier figure to divide by — never a fake 100%. */
function relativeChange(current: number, previous: number): number | null {
  if (!previous) {
    return null;
  }
  return (current - previous) / Math.abs(previous);
}

function heatStep(count: number, max: number): string {
  if (!count || !max) {
    return HEAT_EMPTY;
  }

  const bucket = Math.ceil((count / max) * HEAT_STEPS.length) - 1;
  return HEAT_STEPS[Math.min(Math.max(bucket, 0), HEAT_STEPS.length - 1)];
}
