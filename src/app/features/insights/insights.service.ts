import { Injectable, inject } from '@angular/core';
import { type Observable, forkJoin, map } from 'rxjs';

import { addDays, addMonths, endOfMonth, startOfMonth, toIsoDate } from '../../shared/format/dates';
import { CalendarService } from '../calendar/calendar.service';
import type { ScheduleEvent } from '../calendar/calendar.models';
import { FinancialService } from '../financial/financial.service';
import type { TransactionRecord } from '../financial/financial.models';
import type {
  CategoryShare,
  HourCell,
  InsightsData,
  InsightsPeriod,
  Kpi,
  TrendGranularity,
} from './insights.models';

/** One request has to cover the window *and* the one before it, for the deltas. */
const TRANSACTION_LIMIT = 500;

/** Hours the agenda actually shows; the heatmap mirrors it. */
export const HEATMAP_START_HOUR = 7;
export const HEATMAP_END_HOUR = 20;

const TOP_PROCEDURES = 5;
const TOP_PAYMENT_METHODS = 4;
const DAYS_PER_WEEK = 7;
/** Past this many days a week-by-week chart grows too many columns to read. */
const MONTHLY_ABOVE_DAYS = 62;

interface DateWindow {
  readonly start: string;
  readonly end: string;
}

interface Bucket {
  readonly startIso: string;
  revenue: number;
  expenses: number;
  incomeCount: number;
  appointments: number;
  missed: number;
}

/**
 * Analytics, derived rather than fetched.
 *
 * The legacy API has no reporting endpoint, so this composes the two services
 * that already know how to talk to it — and inherits their demo fallback, which
 * is why there is no `demo-insights.data.ts`: sample transactions and a sample
 * agenda produce sample analytics for free.
 */
@Injectable({ providedIn: 'root' })
export class InsightsService {
  private readonly financial = inject(FinancialService);
  private readonly calendar = inject(CalendarService);

  load(period: InsightsPeriod): Observable<InsightsData> {
    const current = windowFor(period);
    const previous = previousWindowFor(period, current);
    const span: DateWindow = { start: previous.start, end: current.end };

    return forkJoin({
      transactions: this.financial.loadTransactions({
        ...span,
        kind: null,
        paid: null,
        search: '',
        sort: 'due_date',
        direction: 'asc',
        page: 1,
        pageSize: TRANSACTION_LIMIT,
      }),
      schedule: this.calendar.load(span),
    }).pipe(
      map(({ transactions, schedule }) =>
        derive({
          current,
          previous,
          rows: transactions.rows,
          events: schedule.events,
          isDemoData: transactions.isDemoData || schedule.isDemoData,
        }),
      ),
    );
  }
}

export function windowFor(period: InsightsPeriod): DateWindow {
  const today = new Date();

  switch (period) {
    case '90d':
      return { start: toIsoDate(addDays(today, -89)), end: toIsoDate(today) };
    case 'month':
      return { start: toIsoDate(startOfMonth(today)), end: toIsoDate(today) };
    case 'lastMonth': {
      const anchor = addMonths(today, -1);
      return { start: toIsoDate(startOfMonth(anchor)), end: toIsoDate(endOfMonth(anchor)) };
    }
    case 'year':
      return { start: toIsoDate(new Date(today.getFullYear(), 0, 1)), end: toIsoDate(today) };
    default:
      return { start: toIsoDate(addDays(today, -29)), end: toIsoDate(today) };
  }
}

/**
 * What "the period before" means depends on the period: a calendar month
 * compares to the calendar month before it, a rolling window to the equally
 * long window that precedes it.
 */
function previousWindowFor(period: InsightsPeriod, current: DateWindow): DateWindow {
  if (period === 'month' || period === 'lastMonth') {
    const anchor = addMonths(fromIso(current.start), -1);
    return { start: toIsoDate(startOfMonth(anchor)), end: toIsoDate(endOfMonth(anchor)) };
  }

  const start = fromIso(current.start);
  const days = daysBetween(start, fromIso(current.end)) + 1;

  return { start: toIsoDate(addDays(start, -days)), end: toIsoDate(addDays(start, -1)) };
}

interface DeriveInput {
  readonly current: DateWindow;
  readonly previous: DateWindow;
  readonly rows: readonly TransactionRecord[];
  readonly events: readonly ScheduleEvent[];
  readonly isDemoData: boolean;
}

function derive({ current, previous, rows, events, isDemoData }: DeriveInput): InsightsData {
  const currentRows = rows.filter((row) => within(row.dueDate, current));
  const previousRows = rows.filter((row) => within(row.dueDate, previous));

  const currentEvents = events.filter((event) => within(dayOf(event.startsAt), current));
  const previousEvents = events.filter((event) => within(dayOf(event.startsAt), previous));

  const granularity = granularityFor(current);
  const buckets = bucketize(current, granularity);
  fill(buckets, granularity, current, currentRows, currentEvents);

  const revenue = sumIncome(currentRows);
  const expenses = sumExpense(currentRows);
  const previousRevenue = sumIncome(previousRows);
  const previousExpenses = sumExpense(previousRows);

  return {
    revenue: kpi(revenue, previousRevenue, buckets.map(bucketRevenue)),
    expenses: kpi(expenses, previousExpenses, buckets.map(bucketExpenses)),
    balance: kpi(
      revenue - expenses,
      previousRevenue - previousExpenses,
      buckets.map((bucket) => bucket.revenue - bucket.expenses),
    ),
    appointments: kpi(currentEvents.length, previousEvents.length, buckets.map(bucketAppointments)),
    averageTicket: kpi(
      averageTicket(currentRows),
      averageTicket(previousRows),
      buckets.map((bucket) => (bucket.incomeCount ? bucket.revenue / bucket.incomeCount : 0)),
    ),
    noShowRate: kpi(
      noShowRate(currentEvents),
      noShowRate(previousEvents),
      buckets.map((bucket) => (bucket.appointments ? bucket.missed / bucket.appointments : 0)),
    ),
    granularity,
    trend: buckets.map((bucket) => ({
      startIso: bucket.startIso,
      revenue: bucket.revenue,
      expenses: bucket.expenses,
    })),
    outcomes: outcomesOf(currentEvents),
    procedures: proceduresOf(currentRows),
    payments: paymentsOf(currentRows),
    hours: hoursOf(currentEvents),
    busiestHourCount: busiest(hoursOf(currentEvents)),
    isDemoData,
  };
}

// ── Buckets ──────────────────────────────────────────────────────────────────

function granularityFor(window: DateWindow): TrendGranularity {
  const days = daysBetween(fromIso(window.start), fromIso(window.end)) + 1;
  return days > MONTHLY_ABOVE_DAYS ? 'month' : 'week';
}

function bucketize(window: DateWindow, granularity: TrendGranularity): Bucket[] {
  const start = fromIso(window.start);
  const end = fromIso(window.end);

  if (granularity === 'month') {
    const buckets: Bucket[] = [];
    for (let cursor = startOfMonth(start); cursor <= end; cursor = addMonths(cursor, 1)) {
      buckets.push(empty(toIsoDate(cursor)));
    }
    return buckets.length ? buckets : [empty(window.start)];
  }

  // Weeks are counted from the window's first day rather than a Monday, so the
  // first and last columns are never a stub of two days beside full ones.
  const weeks = Math.ceil((daysBetween(start, end) + 1) / DAYS_PER_WEEK);
  return Array.from({ length: Math.max(1, weeks) }, (_, index) =>
    empty(toIsoDate(addDays(start, index * DAYS_PER_WEEK))),
  );
}

function fill(
  buckets: Bucket[],
  granularity: TrendGranularity,
  window: DateWindow,
  rows: readonly TransactionRecord[],
  events: readonly ScheduleEvent[],
): void {
  const indexOf = bucketIndexer(buckets, granularity, window);

  for (const row of rows) {
    const bucket = buckets[indexOf(row.dueDate)];
    if (!bucket) {
      continue;
    }

    if (row.amount > 0) {
      bucket.revenue += row.amount;
      if (row.kind === 'income') {
        bucket.incomeCount += 1;
      }
    } else {
      bucket.expenses -= row.amount;
    }
  }

  for (const event of events) {
    const bucket = buckets[indexOf(dayOf(event.startsAt))];
    if (!bucket) {
      continue;
    }

    bucket.appointments += 1;
    if (event.status === 'missed') {
      bucket.missed += 1;
    }
  }
}

function bucketIndexer(
  buckets: readonly Bucket[],
  granularity: TrendGranularity,
  window: DateWindow,
): (iso: string) => number {
  if (granularity === 'month') {
    const months = buckets.map((bucket) => bucket.startIso.slice(0, 7));
    return (iso) => months.indexOf(iso.slice(0, 7));
  }

  const start = fromIso(window.start);
  return (iso) => Math.floor(daysBetween(start, fromIso(iso)) / DAYS_PER_WEEK);
}

function empty(startIso: string): Bucket {
  return { startIso, revenue: 0, expenses: 0, incomeCount: 0, appointments: 0, missed: 0 };
}

const bucketRevenue = (bucket: Bucket): number => bucket.revenue;
const bucketExpenses = (bucket: Bucket): number => bucket.expenses;
const bucketAppointments = (bucket: Bucket): number => bucket.appointments;

// ── Measures ─────────────────────────────────────────────────────────────────

function kpi(current: number, previous: number, series: readonly number[]): Kpi {
  return { current, previous, series };
}

function sumIncome(rows: readonly TransactionRecord[]): number {
  return rows.filter((row) => row.amount > 0).reduce((sum, row) => sum + row.amount, 0);
}

function sumExpense(rows: readonly TransactionRecord[]): number {
  return rows.filter((row) => row.amount < 0).reduce((sum, row) => sum - row.amount, 0);
}

function averageTicket(rows: readonly TransactionRecord[]): number {
  const billed = rows.filter((row) => row.kind === 'income' && row.amount > 0);
  return billed.length ? billed.reduce((sum, row) => sum + row.amount, 0) / billed.length : 0;
}

function noShowRate(events: readonly ScheduleEvent[]): number {
  return events.length
    ? events.filter((event) => event.status === 'missed').length / events.length
    : 0;
}

// ── Breakdowns ───────────────────────────────────────────────────────────────

/** Six statuses is more classes than a share bar can carry; four tells the story. */
function outcomesOf(events: readonly ScheduleEvent[]): readonly CategoryShare[] {
  const tally = { completed: 0, booked: 0, missed: 0, canceled: 0 };

  for (const event of events) {
    switch (event.status) {
      case 'finished':
      case 'arrived':
        tally.completed += 1;
        break;
      case 'missed':
        tally.missed += 1;
        break;
      case 'canceled':
        tally.canceled += 1;
        break;
      default:
        tally.booked += 1;
    }
  }

  return Object.entries(tally)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ key, label: '', value }));
}

/**
 * Revenue lines read "Crown fitting — Larissa Peixoto", so the treatment is
 * everything before the dash. A line without one keeps its whole description,
 * which is still a usable label.
 */
function proceduresOf(rows: readonly TransactionRecord[]): readonly CategoryShare[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    if (row.kind !== 'income' || row.amount <= 0) {
      continue;
    }

    const label = row.description.split('—')[0].trim() || row.description.trim();
    totals.set(label, (totals.get(label) ?? 0) + row.amount);
  }

  return rank(totals).slice(0, TOP_PROCEDURES);
}

function paymentsOf(rows: readonly TransactionRecord[]): readonly CategoryShare[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    if (row.amount <= 0 || !row.paid) {
      continue;
    }
    const label = row.paymentMethod ?? '';
    totals.set(label, (totals.get(label) ?? 0) + row.amount);
  }

  const ranked = rank(totals);
  if (ranked.length <= TOP_PAYMENT_METHODS) {
    return ranked;
  }

  // Never invent a colour for a ninth slice — the tail folds into one bucket.
  const tail = ranked.slice(TOP_PAYMENT_METHODS);
  return [
    ...ranked.slice(0, TOP_PAYMENT_METHODS),
    { key: 'other', label: '', value: tail.reduce((sum, share) => sum + share.value, 0) },
  ];
}

function rank(totals: ReadonlyMap<string, number>): CategoryShare[] {
  return [...totals.entries()]
    .map(([label, value]) => ({ key: label || 'unknown', label, value }))
    .sort((a, b) => b.value - a.value);
}

function hoursOf(events: readonly ScheduleEvent[]): readonly HourCell[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    const at = new Date(event.startsAt);
    const hour = at.getHours();

    if (hour < HEATMAP_START_HOUR || hour > HEATMAP_END_HOUR) {
      continue;
    }

    const key = `${at.getDay()}:${hour}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()].map(([key, count]) => {
    const [weekday, hour] = key.split(':').map(Number);
    return { weekday, hour, count };
  });
}

function busiest(cells: readonly HourCell[]): number {
  return cells.reduce((max, cell) => Math.max(max, cell.count), 0);
}

// ── Dates ────────────────────────────────────────────────────────────────────

function within(iso: string, window: DateWindow): boolean {
  return iso >= window.start && iso <= window.end;
}

/** The timestamp is UTC; the window is a local calendar range. */
function dayOf(timestamp: string): string {
  return toIsoDate(new Date(timestamp));
}

function fromIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}
