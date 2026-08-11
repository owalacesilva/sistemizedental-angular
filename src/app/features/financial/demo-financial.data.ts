import type {
  PayablesPage,
  PaymentMethodsList,
  StatementPage,
  StatementQuery,
  TransactionKind,
  TransactionRecord,
  TransactionSortColumn,
  TransactionsPage,
  TransactionsQuery,
} from './financial.models';
import { sumTransactions } from './financial.totals';

function isoDaysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

interface Entry {
  readonly dayOffset: number;
  readonly description: string;
  readonly kind: TransactionKind;
  readonly paymentMethod: string | null;
  readonly amount: number;
  readonly paid: boolean;
  readonly orderId: number | null;
}

/** Six weeks of movements, so every preset period has something to show. */
const ENTRIES: readonly Entry[] = [
  {
    dayOffset: 0,
    description: 'Routine cleaning — Marina Alves',
    kind: 'income',
    paymentMethod: 'Credit card',
    amount: 320,
    paid: true,
    orderId: 2401,
  },
  {
    dayOffset: 0,
    description: 'Whitening — Fernanda Rocha',
    kind: 'income',
    paymentMethod: 'Pix',
    amount: 890,
    paid: true,
    orderId: 2402,
  },
  {
    dayOffset: 0,
    description: 'Cash drawer withdrawal',
    kind: 'cashout',
    paymentMethod: 'Cash',
    amount: -400,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -1,
    description: 'Root canal — Rafael Costa',
    kind: 'income',
    paymentMethod: 'Credit card',
    amount: 1450,
    paid: true,
    orderId: 2398,
  },
  {
    dayOffset: -1,
    description: 'Orthodontic adjustment — Helena Souza',
    kind: 'income',
    paymentMethod: 'Debit card',
    amount: 240,
    paid: false,
    orderId: 2399,
  },
  {
    dayOffset: -2,
    description: 'Dental supplies — Dental Prime',
    kind: 'expense',
    paymentMethod: 'Bank slip',
    amount: -1280,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -2,
    description: 'Implant consultation — Tomás Ferreira',
    kind: 'income',
    paymentMethod: 'Pix',
    amount: 350,
    paid: true,
    orderId: 2394,
  },
  {
    dayOffset: -3,
    description: 'Crown fitting — Larissa Peixoto',
    kind: 'income',
    paymentMethod: 'Credit card',
    amount: 2100,
    paid: true,
    orderId: 2390,
  },
  {
    dayOffset: -4,
    description: 'Sterilisation service',
    kind: 'expense',
    paymentMethod: 'Bank transfer',
    amount: -540,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -5,
    description: 'Filling — Priscila Amaral',
    kind: 'income',
    paymentMethod: 'Cash',
    amount: 410,
    paid: true,
    orderId: 2385,
  },
  {
    dayOffset: -6,
    description: 'Cash drawer top-up',
    kind: 'supply',
    paymentMethod: 'Cash',
    amount: 500,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -7,
    description: 'Wisdom tooth surgery — André Pimentel',
    kind: 'income',
    paymentMethod: 'Credit card',
    amount: 3200,
    paid: true,
    orderId: 2380,
  },
  {
    dayOffset: -8,
    description: 'Gum treatment — Carla Antunes',
    kind: 'income',
    paymentMethod: 'Pix',
    amount: 760,
    paid: false,
    orderId: 2377,
  },
  {
    dayOffset: -9,
    description: 'Laboratory work — OrtoLab',
    kind: 'expense',
    paymentMethod: 'Bank slip',
    amount: -980,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -11,
    description: 'Check-up — Otávio Menezes',
    kind: 'income',
    paymentMethod: 'Debit card',
    amount: 180,
    paid: true,
    orderId: 2371,
  },
  {
    dayOffset: -13,
    description: 'Veneer fitting — Patrícia Nogueira',
    kind: 'income',
    paymentMethod: 'Credit card',
    amount: 4300,
    paid: true,
    orderId: 2366,
  },
  {
    dayOffset: -15,
    description: 'Cleaning crew',
    kind: 'expense',
    paymentMethod: 'Bank transfer',
    amount: -1200,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -18,
    description: 'Extraction — Diego Ramos',
    kind: 'income',
    paymentMethod: 'Pix',
    amount: 520,
    paid: true,
    orderId: 2358,
  },
  {
    dayOffset: -21,
    description: 'Denture adjustment — Bruno Tavares',
    kind: 'income',
    paymentMethod: 'Cash',
    amount: 300,
    paid: true,
    orderId: 2350,
  },
  {
    dayOffset: -24,
    description: 'Software subscription',
    kind: 'expense',
    paymentMethod: 'Credit card',
    amount: -390,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -27,
    description: 'Implant follow-up — Igor Salgado',
    kind: 'income',
    paymentMethod: 'Credit card',
    amount: 640,
    paid: true,
    orderId: 2341,
  },
  {
    dayOffset: -31,
    description: 'Rent',
    kind: 'expense',
    paymentMethod: 'Bank transfer',
    amount: -6500,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -33,
    description: 'Crown preparation — Beatriz Campos',
    kind: 'income',
    paymentMethod: 'Credit card',
    amount: 1850,
    paid: true,
    orderId: 2330,
  },
  {
    dayOffset: -38,
    description: 'Dental supplies — Dental Prime',
    kind: 'expense',
    paymentMethod: 'Bank slip',
    amount: -1440,
    paid: true,
    orderId: null,
  },
  {
    dayOffset: -41,
    description: 'Routine cleaning — Sofia Guimarães',
    kind: 'income',
    paymentMethod: 'Pix',
    amount: 320,
    paid: true,
    orderId: 2318,
  },
];

function toTransaction(entry: Entry, id: number): TransactionRecord {
  return {
    id,
    dueDate: isoDaysFromToday(entry.dayOffset),
    description: entry.description,
    kind: entry.kind,
    paymentMethod: entry.paymentMethod,
    amount: entry.amount,
    paid: entry.paid,
    orderId: entry.orderId,
    cashierId: entry.kind === 'income' || entry.kind === 'cashout' ? 7 : null,
  };
}

/** Filters, sums and pages the sample ledger the way the API would. */
export function demoStatement(query: StatementQuery): StatementPage {
  const all = ENTRIES.map(toTransaction).filter((row) => {
    if (row.dueDate < query.start || row.dueDate > query.end) {
      return false;
    }
    return query.paid === null || row.paid === query.paid;
  });

  const sorted = [...all].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const start = (Math.max(1, query.page) - 1) * query.pageSize;

  const income = sorted.filter((row) => row.amount > 0).reduce((sum, row) => sum + row.amount, 0);
  const expense = sorted.filter((row) => row.amount < 0).reduce((sum, row) => sum - row.amount, 0);
  const pending = sorted
    .filter((row) => !row.paid)
    .reduce((sum, row) => sum + Math.abs(row.amount), 0);

  return {
    rows: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    summary: { income, expense, balance: income - expense, pending },
    isDemoData: true,
  };
}

/** Orders the sample ledger the way the API's `order` parameter would. */
function compare(
  a: TransactionRecord,
  b: TransactionRecord,
  column: TransactionSortColumn,
): number {
  switch (column) {
    case 'total_amount':
      return a.amount - b.amount;
    case 'description':
      return a.description.localeCompare(b.description);
    case 'kind':
      return a.kind.localeCompare(b.kind);
    default:
      return a.dueDate.localeCompare(b.dueDate);
  }
}

/** Filters, sorts and pages the sample ledger the way the API would. */
export function demoTransactions(query: TransactionsQuery): TransactionsPage {
  const needle = query.search.trim().toLowerCase();

  const matched = ENTRIES.map(toTransaction).filter((row) => {
    if (row.dueDate < query.start || row.dueDate > query.end) {
      return false;
    }
    if (query.kind !== null && row.kind !== query.kind) {
      return false;
    }
    if (query.paid !== null && row.paid !== query.paid) {
      return false;
    }
    return !needle || row.description.toLowerCase().includes(needle);
  });

  const direction = query.direction === 'asc' ? 1 : -1;
  const sorted = [...matched].sort((a, b) => compare(a, b, query.sort) * direction);
  const start = (Math.max(1, query.page) - 1) * query.pageSize;
  const rows = sorted.slice(start, start + query.pageSize);

  return { rows, total: sorted.length, totals: sumTransactions(rows), isDemoData: true };
}

/** Sample bills to pay, deliberately including two overdue ones. */
export function demoPayables(): PayablesPage {
  const rows = [
    {
      id: 501,
      title: 'Rent — clinic unit 42',
      dueDate: isoDaysFromToday(4),
      cost: 6500,
      paid: false,
      category: 'Facilities',
      paymentMethod: 'Bank transfer',
      recurrences: 12,
    },
    {
      id: 502,
      title: 'Dental supplies — Dental Prime',
      dueDate: isoDaysFromToday(9),
      cost: 1280,
      paid: false,
      category: 'Supplies',
      paymentMethod: 'Bank slip',
      recurrences: 1,
    },
    {
      id: 503,
      title: 'Energy bill',
      dueDate: isoDaysFromToday(-3),
      cost: 940,
      paid: false,
      category: 'Utilities',
      paymentMethod: 'Bank slip',
      recurrences: 12,
    },
    {
      id: 504,
      title: 'Laboratory work — OrtoLab',
      dueDate: isoDaysFromToday(-8),
      cost: 980,
      paid: false,
      category: 'Laboratory',
      paymentMethod: 'Bank transfer',
      recurrences: 1,
    },
    {
      id: 505,
      title: 'Practice management software',
      dueDate: isoDaysFromToday(14),
      cost: 390,
      paid: false,
      category: 'Software',
      paymentMethod: 'Credit card',
      recurrences: 12,
    },
    {
      id: 506,
      title: 'Accounting services',
      dueDate: isoDaysFromToday(-14),
      cost: 1100,
      paid: true,
      category: 'Services',
      paymentMethod: 'Bank transfer',
      recurrences: 12,
    },
  ];

  const today = isoDaysFromToday(0);

  return {
    rows,
    total: rows.length,
    outstanding: rows.filter((row) => !row.paid).reduce((sum, row) => sum + row.cost, 0),
    overdue: rows.filter((row) => !row.paid && row.dueDate < today).length,
    isDemoData: true,
  };
}

/** Sample tender types, mirroring the legacy payment-method record. */
export function demoPaymentMethods(): PaymentMethodsList {
  return {
    isDemoData: true,
    rows: [
      {
        id: 1,
        title: 'Cash',
        fee: 0,
        hasInstallments: false,
        installmentsLimit: 1,
        releaseDeadline: 0,
        blocked: false,
      },
      {
        id: 2,
        title: 'Pix',
        fee: 0,
        hasInstallments: false,
        installmentsLimit: 1,
        releaseDeadline: 0,
        blocked: false,
      },
      {
        id: 3,
        title: 'Debit card',
        fee: 1.6,
        hasInstallments: false,
        installmentsLimit: 1,
        releaseDeadline: 1,
        blocked: false,
      },
      {
        id: 4,
        title: 'Credit card',
        fee: 3.4,
        hasInstallments: true,
        installmentsLimit: 12,
        releaseDeadline: 30,
        blocked: false,
      },
      {
        id: 5,
        title: 'Bank slip',
        fee: 1.2,
        hasInstallments: true,
        installmentsLimit: 6,
        releaseDeadline: 3,
        blocked: false,
      },
      {
        id: 6,
        title: 'Cheque',
        fee: 0,
        hasInstallments: true,
        installmentsLimit: 3,
        releaseDeadline: 15,
        blocked: true,
      },
    ],
  };
}
