import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { addDays, toIsoDate } from '../../shared/format/dates';
import { CalendarService } from '../calendar/calendar.service';
import type { Schedule, ScheduleEvent, ScheduleStatus } from '../calendar/calendar.models';
import { FinancialService } from '../financial/financial.service';
import type { TransactionKind, TransactionRecord } from '../financial/financial.models';
import { InsightsService } from './insights.service';

const TODAY = new Date();

function daysAgo(days: number): string {
  return toIsoDate(addDays(TODAY, -days));
}

let nextId = 1;

function movement(
  dayOffset: number,
  amount: number,
  overrides: Partial<TransactionRecord> = {},
): TransactionRecord {
  const kind: TransactionKind = amount > 0 ? 'income' : 'expense';
  return {
    id: nextId++,
    dueDate: daysAgo(dayOffset),
    description: 'Routine cleaning — Marina Alves',
    kind,
    paymentMethod: 'Pix',
    amount,
    paid: true,
    orderId: null,
    cashierId: null,
    ...overrides,
  };
}

function booking(dayOffset: number, hour: number, status: ScheduleStatus): ScheduleEvent {
  const at = addDays(TODAY, -dayOffset);
  at.setHours(hour, 0, 0, 0);

  return {
    id: nextId++,
    patientName: 'Marina Alves',
    doctorId: 11,
    doctorName: 'Dr. Alex Moreira',
    procedure: 'Routine cleaning',
    status,
    startsAt: at.toISOString(),
    endsAt: new Date(at.getTime() + 3_600_000).toISOString(),
  };
}

/** Inside the default 30-day window, and inside the 30 days before it. */
const ROWS: readonly TransactionRecord[] = [
  movement(1, 1000),
  movement(2, 500, {
    description: 'Crown fitting — Larissa Peixoto',
    paymentMethod: 'Credit card',
  }),
  movement(3, -400, { description: 'Rent', kind: 'expense', paymentMethod: 'Bank transfer' }),
  movement(3, 200, { paid: false }),
  movement(40, 600),
  movement(40, -100, { kind: 'expense' }),
];

const EVENTS: readonly ScheduleEvent[] = [
  booking(1, 9, 'finished'),
  booking(1, 9, 'confirmed'),
  booking(2, 14, 'missed'),
  booking(3, 14, 'canceled'),
  booking(40, 10, 'confirmed'),
];

function configure(rows = ROWS, events = EVENTS): InsightsService {
  const schedule: Schedule = { events, doctors: [], isDemoData: false };

  TestBed.configureTestingModule({
    providers: [
      {
        provide: FinancialService,
        useValue: {
          loadTransactions: () =>
            of({
              rows,
              total: rows.length,
              totals: { inflow: 0, outflow: 0, net: 0, unsettled: 0 },
              isDemoData: false,
            }),
        },
      },
      { provide: CalendarService, useValue: { load: () => of(schedule) } },
    ],
  });

  return TestBed.inject(InsightsService);
}

describe('InsightsService', () => {
  beforeEach(() => {
    nextId = 1;
    TestBed.resetTestingModule();
  });

  it('sums the window and the window before it, so the deltas mean something', async () => {
    const data = await firstValueFrom(configure().load('30d'));

    expect(data.revenue.current).toBe(1700);
    expect(data.revenue.previous).toBe(600);
    expect(data.expenses.current).toBe(400);
    expect(data.expenses.previous).toBe(100);
    expect(data.balance.current).toBe(1300);
  });

  it('counts only the appointments inside the window', async () => {
    const data = await firstValueFrom(configure().load('30d'));

    expect(data.appointments.current).toBe(4);
    expect(data.appointments.previous).toBe(1);
  });

  it('averages the ticket over billed revenue lines only', async () => {
    const data = await firstValueFrom(configure().load('30d'));

    // 1000 + 500 + 200 across three income lines.
    expect(data.averageTicket.current).toBeCloseTo(1700 / 3, 5);
  });

  it('reads the no-show rate off the bookings', async () => {
    const data = await firstValueFrom(configure().load('30d'));

    expect(data.noShowRate.current).toBeCloseTo(0.25, 5);
  });

  it('folds the six appointment statuses into four outcomes', async () => {
    const data = await firstValueFrom(configure().load('30d'));
    const byKey = Object.fromEntries(data.outcomes.map((share) => [share.key, share.value]));

    expect(byKey).toEqual({ completed: 1, booked: 1, missed: 1, canceled: 1 });
  });

  it('ranks procedures by the part of the description before the dash', async () => {
    const data = await firstValueFrom(configure().load('30d'));

    expect(data.procedures[0]).toMatchObject({ label: 'Routine cleaning', value: 1200 });
    expect(data.procedures[1]).toMatchObject({ label: 'Crown fitting', value: 500 });
  });

  it('splits settled revenue by tender, ignoring the unpaid line', async () => {
    const data = await firstValueFrom(configure().load('30d'));
    const byLabel = Object.fromEntries(data.payments.map((share) => [share.label, share.value]));

    expect(byLabel).toEqual({ Pix: 1000, 'Credit card': 500 });
  });

  it('buckets bookings by weekday and hour', async () => {
    const data = await firstValueFrom(configure().load('30d'));
    const nine = data.hours.filter((cell) => cell.hour === 9);

    expect(nine).toHaveLength(1);
    expect(nine[0].count).toBe(2);
    expect(data.busiestHourCount).toBe(2);
  });

  it('groups a short window by week and a long one by month', async () => {
    const service = configure();

    expect((await firstValueFrom(service.load('30d'))).granularity).toBe('week');
    expect((await firstValueFrom(service.load('90d'))).granularity).toBe('month');
  });

  it('gives every measure a series as long as the trend', async () => {
    const data = await firstValueFrom(configure().load('30d'));

    expect(data.revenue.series).toHaveLength(data.trend.length);
    expect(data.revenue.series.reduce((sum, value) => sum + value, 0)).toBe(1700);
  });

  it('reports zeroes rather than throwing on an empty clinic', async () => {
    const data = await firstValueFrom(configure([], []).load('30d'));

    expect(data.revenue.current).toBe(0);
    expect(data.averageTicket.current).toBe(0);
    expect(data.noShowRate.current).toBe(0);
    expect(data.outcomes).toEqual([]);
    expect(data.busiestHourCount).toBe(0);
  });

  it('inherits the demo flag from either source', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FinancialService,
          useValue: {
            loadTransactions: () =>
              of({
                rows: [],
                total: 0,
                totals: { inflow: 0, outflow: 0, net: 0, unsettled: 0 },
                isDemoData: false,
              }),
          },
        },
        {
          provide: CalendarService,
          useValue: { load: () => of({ events: [], doctors: [], isDemoData: true }) },
        },
      ],
    });

    const data = await firstValueFrom(TestBed.inject(InsightsService).load('30d'));
    expect(data.isDemoData).toBe(true);
  });
});
