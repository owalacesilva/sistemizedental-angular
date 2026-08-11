import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { injectLocale, injectT } from '../../../core/i18n/translate';
import type { MessageKey } from '../../../core/i18n/messages.en';
import { addDays, endOfMonth, startOfMonth, toIsoDate } from '../../../shared/format/dates';
import { injectMoney } from '../../../shared/format/money';
import { Alert } from '../../../shared/ui/alert/alert';
import { Badge, type BadgeTone } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FilterPanel } from '../../../shared/ui/filter-panel/filter-panel';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { KIND_LABEL_KEYS, KIND_TONES } from '../financial.labels';
import type {
  PaidFilter,
  StatementQuery,
  TransactionKind,
  TransactionRecord,
} from '../financial.models';
import { FinancialService } from '../financial.service';

const DEFAULT_PAGE_SIZE = 10;

/** Presets mirror the legacy period picker. */
const PERIODS: readonly { readonly labelKey: MessageKey; readonly days: number | null }[] = [
  { labelKey: 'statement.period.today', days: 0 },
  { labelKey: 'statement.period.7d', days: 6 },
  { labelKey: 'statement.period.30d', days: 29 },
  { labelKey: 'statement.period.month', days: null },
  { labelKey: 'statement.period.lastMonth', days: null },
];

const DEFAULT_PERIOD_INDEX = 2;

const PAID_OPTIONS: readonly { readonly labelKey: MessageKey; readonly value: PaidFilter }[] = [
  { labelKey: 'statement.paid.all', value: null },
  { labelKey: 'statement.paid.settled', value: true },
  { labelKey: 'statement.paid.outstanding', value: false },
];

@Component({
  selector: 'app-statement',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, Alert, Badge, EmptyState, FilterPanel, Pagination, Spinner],
  templateUrl: './statement.html',
})
export class Statement {
  private readonly financial = inject(FinancialService);

  protected readonly t = injectT();
  protected readonly locale = injectLocale();
  protected readonly money = injectMoney();

  protected readonly periods = PERIODS;
  protected readonly paidOptions = PAID_OPTIONS;

  protected readonly periodIndex = signal(DEFAULT_PERIOD_INDEX);
  protected readonly paid = signal<PaidFilter>(null);
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  private readonly window = computed(() => {
    const index = this.periodIndex();
    const today = new Date();
    const { labelKey, days } = PERIODS[index];

    if (labelKey === 'statement.period.month') {
      return { start: toIsoDate(startOfMonth(today)), end: toIsoDate(endOfMonth(today)) };
    }

    if (labelKey === 'statement.period.lastMonth') {
      const inLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return {
        start: toIsoDate(startOfMonth(inLastMonth)),
        end: toIsoDate(endOfMonth(inLastMonth)),
      };
    }

    return { start: toIsoDate(addDays(today, -(days ?? 0))), end: toIsoDate(today) };
  });

  /** Changing a filter drops us back to the first page. */
  protected readonly page = linkedSignal<string, number>({
    source: () => `${this.periodIndex()}:${this.paid()}:${this.pageSize()}`,
    computation: () => 1,
  });

  private readonly query = computed<StatementQuery>(() => ({
    ...this.window(),
    paid: this.paid(),
    page: this.page(),
    pageSize: this.pageSize(),
  }));

  protected readonly result = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.financial.loadStatement(params),
  });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly rows = computed(() => this.loaded()?.rows ?? []);
  protected readonly total = computed(() => this.loaded()?.total ?? 0);
  protected readonly summary = computed(() => this.loaded()?.summary ?? null);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);

  protected readonly periodLabel = computed(() => {
    const { start, end } = this.window();
    return start === end ? start : `${start} → ${end}`;
  });

  protected readonly activeFilterCount = computed(
    () => (this.periodIndex() === DEFAULT_PERIOD_INDEX ? 0 : 1) + (this.paid() === null ? 0 : 1),
  );

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? this.t('statement.error') : null;
  });

  protected selectPeriod(index: number): void {
    this.periodIndex.set(index);
  }

  protected selectPaid(value: PaidFilter): void {
    this.paid.set(value);
  }

  protected resetFilters(): void {
    this.periodIndex.set(DEFAULT_PERIOD_INDEX);
    this.paid.set(null);
  }

  protected kindLabel(kind: TransactionKind): string {
    return this.t(KIND_LABEL_KEYS[kind]);
  }

  protected kindTone(kind: TransactionKind): BadgeTone {
    return KIND_TONES[kind];
  }

  protected amountClass(row: TransactionRecord): string {
    return row.amount < 0 ? 'text-rose-600' : 'text-emerald-600';
  }

  protected goToPage(page: number): void {
    this.page.set(page);
  }

  protected setPageSize(size: number): void {
    this.pageSize.set(size);
  }

  protected reload(): void {
    this.result.reload();
  }
}
