import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { addDays, endOfMonth, startOfMonth, toIsoDate } from '../../../shared/format/dates';
import { Alert } from '../../../shared/ui/alert/alert';
import { Badge, type BadgeTone } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type {
  PaidFilter,
  StatementQuery,
  TransactionKind,
  TransactionRecord,
} from '../financial.models';
import { FinancialService } from '../financial.service';

const PAGE_SIZE = 10;

const KIND_LABELS: Record<TransactionKind, string> = {
  income: 'Revenue',
  expense: 'Expense',
  cashout: 'Cash-out',
  supply: 'Top-up',
};

const KIND_TONES: Record<TransactionKind, BadgeTone> = {
  income: 'success',
  expense: 'danger',
  cashout: 'warning',
  supply: 'info',
};

/** Presets mirror the legacy period picker. */
const PERIODS = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 6 },
  { label: 'Last 30 days', days: 29 },
  { label: 'This month', days: null },
  { label: 'Last month', days: null },
] as const;

const PAID_OPTIONS: readonly { readonly label: string; readonly value: PaidFilter }[] = [
  { label: 'All', value: null },
  { label: 'Settled', value: true },
  { label: 'Outstanding', value: false },
];

@Component({
  selector: 'app-statement',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, Alert, Badge, EmptyState, Pagination, Spinner],
  templateUrl: './statement.html',
})
export class Statement {
  private readonly financial = inject(FinancialService);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly periods = PERIODS;
  protected readonly paidOptions = PAID_OPTIONS;

  protected readonly periodIndex = signal(2);
  protected readonly paid = signal<PaidFilter>(null);

  private readonly window = computed(() => {
    const index = this.periodIndex();
    const today = new Date();

    if (PERIODS[index].label === 'This month') {
      return { start: toIsoDate(startOfMonth(today)), end: toIsoDate(endOfMonth(today)) };
    }

    if (PERIODS[index].label === 'Last month') {
      const inLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return {
        start: toIsoDate(startOfMonth(inLastMonth)),
        end: toIsoDate(endOfMonth(inLastMonth)),
      };
    }

    const days = PERIODS[index].days ?? 0;
    return { start: toIsoDate(addDays(today, -days)), end: toIsoDate(today) };
  });

  /** Changing a filter drops us back to the first page. */
  protected readonly page = linkedSignal<string, number>({
    source: () => `${this.periodIndex()}:${this.paid()}`,
    computation: () => 1,
  });

  private readonly query = computed<StatementQuery>(() => ({
    ...this.window(),
    paid: this.paid(),
    page: this.page(),
    pageSize: PAGE_SIZE,
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

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? 'Could not load the statement.' : null;
  });

  protected selectPeriod(index: number): void {
    this.periodIndex.set(index);
  }

  protected selectPaid(value: PaidFilter): void {
    this.paid.set(value);
  }

  protected kindLabel(kind: TransactionKind): string {
    return KIND_LABELS[kind];
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

  protected reload(): void {
    this.result.reload();
  }
}
