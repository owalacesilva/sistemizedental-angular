import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { type Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toIsoDate } from '../../../shared/format/dates';
import type { TransactionsPage, TransactionsQuery } from '../financial.models';
import { FinancialService } from '../financial.service';
import { Transactions } from './transactions';

const TODAY = toIsoDate(new Date());

const PAGE: TransactionsPage = {
  isDemoData: false,
  total: 2,
  totals: { inflow: 320, outflow: 400, net: -80, unsettled: 400 },
  rows: [
    {
      id: 1,
      dueDate: TODAY,
      description: 'Routine cleaning — Marina Alves',
      kind: 'income',
      paymentMethod: 'Credit card',
      amount: 320,
      paid: true,
      orderId: 2401,
      cashierId: 7,
    },
    {
      id: 2,
      dueDate: TODAY,
      description: 'Dental supplies — Dental Prime',
      kind: 'expense',
      paymentMethod: 'Bank slip',
      amount: -400,
      paid: false,
      orderId: null,
      cashierId: null,
    },
  ],
};

async function render(service: Partial<FinancialService>): Promise<ComponentFixture<Transactions>> {
  await TestBed.configureTestingModule({
    imports: [Transactions],
    providers: [{ provide: FinancialService, useValue: service }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Transactions);
  await fixture.whenStable();
  return fixture;
}

type LoadTransactions = (query: TransactionsQuery) => Observable<TransactionsPage>;

function stub() {
  return { loadTransactions: vi.fn<LoadTransactions>(() => of(PAGE)) };
}

function lastQuery(service: ReturnType<typeof stub>): TransactionsQuery {
  return service.loadTransactions.mock.lastCall?.[0] as TransactionsQuery;
}

describe('Transactions', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('opens on the last thirty days, newest first', async () => {
    const service = stub();
    await render(service);

    const query = lastQuery(service);
    expect(query.end).toBe(TODAY);
    expect(query.sort).toBe('due_date');
    expect(query.direction).toBe('desc');
    expect(query.kind).toBeNull();
    expect(query.paid).toBeNull();
  });

  it('lists movements with their type, drawer and settlement', async () => {
    const fixture = await render(stub());
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Routine cleaning — Marina Alves');
    expect(text).toContain('Order #2401');
    expect(text).toContain('Drawer 7');
    expect(text).toContain('Expense');
    expect(text).toContain('Outstanding');
  });

  it('totals the rows on screen and says that is what they are', async () => {
    const fixture = await render(stub());
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('320.00');
    expect(text).toContain('400.00');
    expect(text).toContain('this page');
  });

  it('narrows to a single movement kind', async () => {
    const service = stub();
    const fixture = await render(service);

    fixture.componentInstance['selectKind']('expense');
    await fixture.whenStable();

    expect(lastQuery(service).kind).toBe('expense');
  });

  it('narrows to unsettled movements', async () => {
    const service = stub();
    const fixture = await render(service);

    fixture.componentInstance['selectPaid'](false);
    await fixture.whenStable();

    expect(lastQuery(service).paid).toBe(false);
  });

  it('reverses the sort when the same column is clicked twice', async () => {
    const service = stub();
    const fixture = await render(service);

    fixture.componentInstance['sortBy']('total_amount');
    await fixture.whenStable();
    expect(lastQuery(service)).toMatchObject({ sort: 'total_amount', direction: 'desc' });

    fixture.componentInstance['sortBy']('total_amount');
    await fixture.whenStable();
    expect(lastQuery(service)).toMatchObject({ sort: 'total_amount', direction: 'asc' });
  });

  it('keeps the start date from overtaking the end date', async () => {
    const service = stub();
    const fixture = await render(service);

    fixture.componentInstance['setStart']('2030-01-01');
    await fixture.whenStable();

    const query = lastQuery(service);
    expect(query.start).toBe('2030-01-01');
    expect(query.end).toBe('2030-01-01');
  });

  it('drops back to the first page whenever a filter changes', async () => {
    const service = stub();
    const fixture = await render(service);

    fixture.componentInstance['goToPage'](3);
    await fixture.whenStable();
    expect(lastQuery(service).page).toBe(3);

    fixture.componentInstance['selectPaid'](true);
    await fixture.whenStable();
    expect(lastQuery(service).page).toBe(1);
  });

  it('counts the filters that are away from their default', async () => {
    const fixture = await render(stub());
    expect(fixture.componentInstance['activeFilterCount']()).toBe(0);

    fixture.componentInstance['selectKind']('income');
    fixture.componentInstance['selectPaid'](true);
    await fixture.whenStable();

    expect(fixture.componentInstance['activeFilterCount']()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('2 filters on');
  });

  it('resets every filter at once', async () => {
    const service = stub();
    const fixture = await render(service);

    fixture.componentInstance['selectKind']('income');
    fixture.componentInstance['setStart']('2020-01-01');
    await fixture.whenStable();

    fixture.componentInstance['resetFilters']();
    await fixture.whenStable();

    expect(fixture.componentInstance['activeFilterCount']()).toBe(0);
    expect(lastQuery(service).kind).toBeNull();
  });

  it('offers a way out of a filter set with no matches', async () => {
    const fixture = await render({
      loadTransactions: () =>
        of({
          ...PAGE,
          rows: [],
          total: 0,
          totals: { inflow: 0, outflow: 0, net: 0, unsettled: 0 },
        }),
    });

    fixture.componentInstance['selectKind']('supply');
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No transactions match these filters');
    expect(text).toContain('Reset');
  });

  it('flags sample data when the demo backend answered', async () => {
    const fixture = await render({ loadTransactions: () => of({ ...PAGE, isDemoData: true }) });

    expect(fixture.nativeElement.textContent).toContain('Showing a sample ledger');
  });

  it('surfaces a load failure', async () => {
    const fixture = await render({
      loadTransactions: () => throwError(() => new Error('Service unavailable.')),
    });

    expect(fixture.nativeElement.textContent).toContain('Service unavailable.');
  });
});
