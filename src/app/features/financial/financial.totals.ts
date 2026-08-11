import type { TransactionRecord, TransactionTotals } from './financial.models';

/**
 * Sums a set of movements. Lives apart from the service so the demo backend can
 * reuse it without the two importing each other.
 */
export function sumTransactions(rows: readonly TransactionRecord[]): TransactionTotals {
  const inflow = rows.filter((row) => row.amount > 0).reduce((sum, row) => sum + row.amount, 0);
  const outflow = rows.filter((row) => row.amount < 0).reduce((sum, row) => sum - row.amount, 0);
  const unsettled = rows
    .filter((row) => !row.paid)
    .reduce((sum, row) => sum + Math.abs(row.amount), 0);

  return { inflow, outflow, net: inflow - outflow, unsettled };
}
