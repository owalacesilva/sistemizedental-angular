import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { injectLocale, injectPlural, injectT } from '../../../core/i18n/translate';
import type { MessageKey } from '../../../core/i18n/messages.en';
import {
  addDays,
  addMonths,
  endOfMonth,
  startOfMonth,
  toIsoDate,
} from '../../../shared/format/dates';
import { injectMoney } from '../../../shared/format/money';
import { Alert } from '../../../shared/ui/alert/alert';
import { Badge, type BadgeTone } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FilterPanel } from '../../../shared/ui/filter-panel/filter-panel';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { KIND_LABEL_KEYS, KIND_TONES } from '../financial.labels';
import type {
  KindFilter,
  PaidFilter,
  SortDirection,
  TransactionKind,
  TransactionRecord,
  TransactionSortColumn,
  TransactionsQuery,
} from '../financial.models';
import { FinancialService } from '../financial.service';

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_WINDOW_DAYS = 29;
const SEARCH_DEBOUNCE_MS = 300;

interface DateWindow {
  readonly start: string;
  readonly end: string;
}

/** Presets mirror the legacy period dropdown, next month included. */
const PERIODS: readonly { readonly labelKey: MessageKey; readonly range: () => DateWindow }[] = [
  { labelKey: 'transactions.period.today', range: () => sameDay(new Date()) },
  { labelKey: 'transactions.period.yesterday', range: () => sameDay(addDays(new Date(), -1)) },
  { labelKey: 'transactions.period.7d', range: () => lastDays(6) },
  { labelKey: 'transactions.period.30d', range: () => lastDays(DEFAULT_WINDOW_DAYS) },
  { labelKey: 'transactions.period.month', range: () => wholeMonth(0) },
  { labelKey: 'transactions.period.lastMonth', range: () => wholeMonth(-1) },
  { labelKey: 'transactions.period.nextMonth', range: () => wholeMonth(1) },
];

const KIND_OPTIONS: readonly { readonly value: KindFilter; readonly labelKey: MessageKey }[] = [
  { value: null, labelKey: 'transactions.kind.all' },
  { value: 'income', labelKey: 'transactions.kind.income' },
  { value: 'expense', labelKey: 'transactions.kind.expense' },
  { value: 'cashout', labelKey: 'transactions.kind.cashout' },
  { value: 'supply', labelKey: 'transactions.kind.supply' },
];

const PAID_OPTIONS: readonly { readonly value: PaidFilter; readonly labelKey: MessageKey }[] = [
  { value: null, labelKey: 'transactions.settlement.all' },
  { value: true, labelKey: 'transactions.settlement.settled' },
  { value: false, labelKey: 'transactions.settlement.outstanding' },
];

interface Column {
  readonly key: TransactionSortColumn | null;
  readonly labelKey: MessageKey;
  readonly numeric?: boolean;
}

const COLUMNS: readonly Column[] = [
  { key: 'due_date', labelKey: 'transactions.column.dueDate' },
  { key: 'description', labelKey: 'transactions.column.description' },
  { key: 'kind', labelKey: 'transactions.column.kind' },
  { key: null, labelKey: 'transactions.column.paymentMethod' },
  { key: 'total_amount', labelKey: 'transactions.column.amount', numeric: true },
  { key: null, labelKey: 'transactions.column.status' },
];

/**
 * The full ledger.
 *
 * Where the statement answers "how did this period go", this answers "find me
 * that movement": an explicit window, every filter the legacy screen had, and
 * sortable columns. Seven controls is more than a toolbar can carry, so they
 * live in a panel that folds away once they are set.
 */
@Component({
  selector: 'app-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    Alert,
    Badge,
    EmptyState,
    FilterPanel,
    Pagination,
    Spinner,
  ],
  templateUrl: './transactions.html',
})
export class Transactions {
  private readonly financial = inject(FinancialService);

  protected readonly t = injectT();
  protected readonly plural = injectPlural();
  protected readonly locale = injectLocale();
  protected readonly money = injectMoney();

  protected readonly periods = PERIODS;
  protected readonly kindOptions = KIND_OPTIONS;
  protected readonly paidOptions = PAID_OPTIONS;
  protected readonly columns = COLUMNS;

  private readonly defaultWindow = lastDays(DEFAULT_WINDOW_DAYS);

  protected readonly start = signal(this.defaultWindow.start);
  protected readonly end = signal(this.defaultWindow.end);
  protected readonly kind = signal<KindFilter>(null);
  protected readonly paid = signal<PaidFilter>(null);
  protected readonly sort = signal<TransactionSortColumn>('due_date');
  protected readonly direction = signal<SortDirection>('desc');
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  /** Debounced so typing doesn't fire a request per keystroke. */
  private readonly search = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      map((value) => value.trim()),
      distinctUntilChanged(),
      startWith(''),
    ),
    { initialValue: '' },
  );

  /** Any change to a filter, the sort or the page size drops us back to page 1. */
  protected readonly page = linkedSignal<string, number>({
    source: () =>
      [
        this.start(),
        this.end(),
        this.kind(),
        this.paid(),
        this.search(),
        this.sort(),
        this.direction(),
        this.pageSize(),
      ].join('|'),
    computation: () => 1,
  });

  private readonly query = computed<TransactionsQuery>(() => ({
    start: this.start(),
    end: this.end(),
    kind: this.kind(),
    paid: this.paid(),
    search: this.search(),
    sort: this.sort(),
    direction: this.direction(),
    page: this.page(),
    pageSize: this.pageSize(),
  }));

  protected readonly result = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.financial.loadTransactions(params),
  });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly rows = computed(() => this.loaded()?.rows ?? []);
  protected readonly total = computed(() => this.loaded()?.total ?? 0);
  protected readonly totals = computed(() => this.loaded()?.totals ?? null);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? this.t('transactions.error') : null;
  });

  /** Drives the badge on the folded filter panel — a hidden filter is never a silent one. */
  protected readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.start() !== this.defaultWindow.start || this.end() !== this.defaultWindow.end) {
      count += 1;
    }
    if (this.kind() !== null) {
      count += 1;
    }
    if (this.paid() !== null) {
      count += 1;
    }
    if (this.search()) {
      count += 1;
    }
    return count;
  });

  protected setStart(value: string): void {
    if (!value) {
      return;
    }
    this.start.set(value);
    if (value > this.end()) {
      this.end.set(value);
    }
  }

  protected setEnd(value: string): void {
    if (!value) {
      return;
    }
    this.end.set(value);
    if (value < this.start()) {
      this.start.set(value);
    }
  }

  protected selectPeriod(index: number): void {
    const { start, end } = PERIODS[index].range();
    this.start.set(start);
    this.end.set(end);
  }

  protected selectKind(value: string): void {
    this.kind.set((value || null) as KindFilter);
  }

  protected selectPaid(value: PaidFilter): void {
    this.paid.set(value);
  }

  protected resetFilters(): void {
    this.start.set(this.defaultWindow.start);
    this.end.set(this.defaultWindow.end);
    this.kind.set(null);
    this.paid.set(null);
    this.searchControl.setValue('');
  }

  /** Clicking the sorted column reverses it; a new column starts descending. */
  protected sortBy(column: TransactionSortColumn): void {
    if (this.sort() === column) {
      this.direction.update((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    this.sort.set(column);
    this.direction.set('desc');
  }

  protected ariaSort(column: Column): 'ascending' | 'descending' | null {
    if (!column.key || this.sort() !== column.key) {
      return null;
    }
    return this.direction() === 'asc' ? 'ascending' : 'descending';
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

function sameDay(date: Date): DateWindow {
  const iso = toIsoDate(date);
  return { start: iso, end: iso };
}

function lastDays(days: number): DateWindow {
  const today = new Date();
  return { start: toIsoDate(addDays(today, -days)), end: toIsoDate(today) };
}

function wholeMonth(offset: number): DateWindow {
  const anchor = addMonths(new Date(), offset);
  return { start: toIsoDate(startOfMonth(anchor)), end: toIsoDate(endOfMonth(anchor)) };
}
