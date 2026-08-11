export type TransactionKind = 'income' | 'expense' | 'cashout' | 'supply';

/** `null` means "either", matching the legacy `paid` filter. */
export type PaidFilter = boolean | null;

export interface TransactionRecord {
  readonly id: number;
  /** ISO-8601 date. */
  readonly dueDate: string;
  readonly description: string;
  readonly kind: TransactionKind;
  readonly paymentMethod: string | null;
  /** Signed, in BRL — expenses and cash-outs come through negative. */
  readonly amount: number;
  readonly paid: boolean;
  readonly orderId: number | null;
  readonly cashierId: number | null;
}

export interface StatementSummary {
  readonly income: number;
  readonly expense: number;
  readonly balance: number;
  /** Sum still awaiting payment. */
  readonly pending: number;
}

export interface StatementPage {
  readonly rows: readonly TransactionRecord[];
  readonly total: number;
  readonly summary: StatementSummary;
  /** True when the data came from the in-memory demo backend. */
  readonly isDemoData: boolean;
}

export interface StatementQuery {
  /** Inclusive window, both `YYYY-MM-DD`. */
  readonly start: string;
  readonly end: string;
  readonly paid: PaidFilter;
  /** 1-based. */
  readonly page: number;
  readonly pageSize: number;
}

/** Column the ledger is ordered by; the value is the API's own column name. */
export type TransactionSortColumn = 'due_date' | 'description' | 'kind' | 'total_amount';

export type SortDirection = 'asc' | 'desc';

/** `null` means "every kind". */
export type KindFilter = TransactionKind | null;

export interface TransactionsQuery {
  /** Inclusive window, both `YYYY-MM-DD`. */
  readonly start: string;
  readonly end: string;
  readonly kind: KindFilter;
  readonly paid: PaidFilter;
  /** Free text matched against the description. */
  readonly search: string;
  readonly sort: TransactionSortColumn;
  readonly direction: SortDirection;
  /** 1-based. */
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Sums for the rows on screen. The legacy endpoint returns a page and a count,
 * never a total over the whole filter, so these are honestly labelled as
 * page totals in the UI rather than passed off as the period's.
 */
export interface TransactionTotals {
  readonly inflow: number;
  readonly outflow: number;
  readonly net: number;
  readonly unsettled: number;
}

export interface TransactionsPage {
  readonly rows: readonly TransactionRecord[];
  readonly total: number;
  readonly totals: TransactionTotals;
  /** True when the data came from the in-memory demo backend. */
  readonly isDemoData: boolean;
}

export interface PayableRecord {
  readonly id: number;
  readonly title: string;
  readonly dueDate: string;
  readonly cost: number;
  readonly paid: boolean;
  readonly category: string | null;
  readonly paymentMethod: string | null;
  /** How many times the bill repeats; 1 for a one-off. */
  readonly recurrences: number;
}

export interface PayablesPage {
  readonly rows: readonly PayableRecord[];
  readonly total: number;
  readonly outstanding: number;
  readonly overdue: number;
  readonly isDemoData: boolean;
}

export interface PaymentMethodRecord {
  readonly id: number;
  readonly title: string;
  /** Percentage the operator keeps. */
  readonly fee: number;
  readonly hasInstallments: boolean;
  readonly installmentsLimit: number;
  /** Days until the money lands in the clinic's account. */
  readonly releaseDeadline: number;
  readonly blocked: boolean;
}

export interface PaymentMethodsList {
  readonly rows: readonly PaymentMethodRecord[];
  readonly isDemoData: boolean;
}
