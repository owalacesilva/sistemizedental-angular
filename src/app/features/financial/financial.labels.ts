import type { MessageKey } from '../../core/i18n/messages.en';
import type { BadgeTone } from '../../shared/ui/badge/badge';
import type { TransactionKind } from './financial.models';

/** Shared by the statement and the ledger, so a kind never reads two ways. */
export const KIND_LABEL_KEYS: Record<TransactionKind, MessageKey> = {
  income: 'transactions.kind.income',
  expense: 'transactions.kind.expense',
  cashout: 'transactions.kind.cashout',
  supply: 'transactions.kind.supply',
};

export const KIND_TONES: Record<TransactionKind, BadgeTone> = {
  income: 'success',
  expense: 'danger',
  cashout: 'warning',
  supply: 'info',
};
