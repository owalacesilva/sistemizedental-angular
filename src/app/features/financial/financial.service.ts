import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';

import { apiUrl } from '../../core/api/api-url';
import { type Paginated, pageQuery } from '../../core/api/api.models';
import { withDemoFallback } from '../../core/api/demo-fallback';
import {
  demoPayables,
  demoPaymentMethods,
  demoStatement,
  demoTransactions,
} from './demo-financial.data';
import type {
  PayableRecord,
  PayablesPage,
  PaymentMethodRecord,
  PaymentMethodsList,
  StatementPage,
  StatementQuery,
  TransactionKind,
  TransactionRecord,
  TransactionsPage,
  TransactionsQuery,
} from './financial.models';
import { sumTransactions } from './financial.totals';

const KINDS: readonly TransactionKind[] = ['income', 'expense', 'cashout', 'supply'];
const PAYABLES_LIMIT = 50;

/** Raw row shapes as returned by the legacy REST API. */
interface TransactionRow {
  id: number;
  due_date?: string;
  description?: string;
  kind?: string;
  total_amount?: number | string;
  paid?: boolean;
  order_id?: number | null;
  cashier_id?: number | null;
  payment_method?: { title?: string } | null;
}

interface AccountableRow {
  id: number;
  title?: string;
  due_date?: string;
  cost?: number | string;
  paid?: boolean;
  recurrences?: number | null;
  category?: { title?: string } | null;
  payment_method?: { title?: string } | null;
}

interface PaymentMethodRow {
  id: number;
  title?: string;
  fee?: number | string | null;
  has_installments?: boolean;
  installments_limit?: number | null;
  release_deadline?: number | null;
  blocked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private readonly http = inject(HttpClient);

  /** The ledger: every movement in the window, plus the totals that frame it. */
  loadStatement(query: StatementQuery): Observable<StatementPage> {
    const { page, limit, offset, order } = pageQuery(query.page, query.pageSize, 'due_date-desc');

    return this.http
      .get<Paginated<TransactionRow>>(apiUrl('api/transactions.json'), {
        params: {
          page,
          limit,
          offset,
          order: order ?? '',
          date_start: query.start,
          date_end: query.end,
          ...(query.paid === null ? {} : { paid: query.paid }),
        },
      })
      .pipe(
        map((response) => this.toStatement(response)),
        withDemoFallback(() => demoStatement(query)),
      );
  }

  /**
   * The same ledger as the statement, but driven by the filter set the legacy
   * transactions screen exposed: an explicit window, a movement kind, a
   * settlement state, a description match and a sortable column.
   */
  loadTransactions(query: TransactionsQuery): Observable<TransactionsPage> {
    const { page, limit, offset } = pageQuery(query.page, query.pageSize);

    return this.http
      .get<Paginated<TransactionRow>>(apiUrl('api/transactions.json'), {
        params: {
          page,
          limit,
          offset,
          order: `${query.sort}-${query.direction}`,
          date_start: query.start,
          date_end: query.end,
          ...(query.kind === null ? {} : { kind: query.kind }),
          ...(query.paid === null ? {} : { paid: query.paid }),
          ...(query.search ? { search: query.search } : {}),
        },
      })
      .pipe(
        map((response) => this.toTransactionsPage(response)),
        withDemoFallback(() => demoTransactions(query)),
      );
  }

  loadPayables(): Observable<PayablesPage> {
    return this.http
      .get<Paginated<AccountableRow>>(apiUrl('api/accountables.json'), {
        params: { limit: PAYABLES_LIMIT, order: 'due_date-asc' },
      })
      .pipe(
        map((response) => this.toPayables(response)),
        withDemoFallback(() => demoPayables()),
      );
  }

  loadPaymentMethods(): Observable<PaymentMethodsList> {
    return this.http
      .get<Paginated<PaymentMethodRow>>(apiUrl('api/payment_methods.json'), {
        params: { limit: PAYABLES_LIMIT, order: 'title-asc' },
      })
      .pipe(
        map((response) => ({
          rows: (response.rows ?? []).map((row) => this.toPaymentMethod(row)),
          isDemoData: false,
        })),
        withDemoFallback(() => demoPaymentMethods()),
      );
  }

  private toStatement(response: Paginated<TransactionRow>): StatementPage {
    const rows = (response.rows ?? []).map((row) => this.toTransaction(row));

    const income = rows.filter((row) => row.amount > 0).reduce((sum, row) => sum + row.amount, 0);
    const expense = rows.filter((row) => row.amount < 0).reduce((sum, row) => sum - row.amount, 0);
    const pending = rows
      .filter((row) => !row.paid)
      .reduce((sum, row) => sum + Math.abs(row.amount), 0);

    return {
      rows,
      total: response.count ?? rows.length,
      summary: { income, expense, balance: income - expense, pending },
      isDemoData: false,
    };
  }

  private toTransactionsPage(response: Paginated<TransactionRow>): TransactionsPage {
    const rows = (response.rows ?? []).map((row) => this.toTransaction(row));

    return {
      rows,
      total: response.count ?? rows.length,
      totals: sumTransactions(rows),
      isDemoData: false,
    };
  }

  private toTransaction(row: TransactionRow): TransactionRecord {
    return {
      id: row.id,
      dueDate: toIsoDate(row.due_date),
      description: row.description?.trim() || 'Movement',
      kind: KINDS.find((kind) => kind === row.kind) ?? 'income',
      paymentMethod: row.payment_method?.title?.trim() || null,
      amount: toNumber(row.total_amount),
      paid: row.paid === true,
      orderId: row.order_id ?? null,
      cashierId: row.cashier_id ?? null,
    };
  }

  private toPayables(response: Paginated<AccountableRow>): PayablesPage {
    const rows = (response.rows ?? []).map((row) => this.toPayable(row));
    const today = new Date().toISOString().slice(0, 10);

    return {
      rows,
      total: response.count ?? rows.length,
      outstanding: rows.filter((row) => !row.paid).reduce((sum, row) => sum + row.cost, 0),
      overdue: rows.filter((row) => !row.paid && row.dueDate < today).length,
      isDemoData: false,
    };
  }

  private toPayable(row: AccountableRow): PayableRecord {
    return {
      id: row.id,
      title: row.title?.trim() || 'Bill',
      dueDate: toIsoDate(row.due_date),
      cost: Math.abs(toNumber(row.cost)),
      paid: row.paid === true,
      category: row.category?.title?.trim() || null,
      paymentMethod: row.payment_method?.title?.trim() || null,
      recurrences: row.recurrences && row.recurrences > 0 ? row.recurrences : 1,
    };
  }

  private toPaymentMethod(row: PaymentMethodRow): PaymentMethodRecord {
    return {
      id: row.id,
      title: row.title?.trim() || `Method #${row.id}`,
      fee: toNumber(row.fee),
      hasInstallments: row.has_installments === true,
      installmentsLimit: row.installments_limit ?? 1,
      releaseDeadline: row.release_deadline ?? 0,
      blocked: row.blocked === true,
    };
  }
}

function toNumber(value: number | string | null | undefined): number {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

/** Keeps the `YYYY-MM-DD` the API sends, and tolerates a full timestamp. */
function toIsoDate(value: string | undefined): string {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}
