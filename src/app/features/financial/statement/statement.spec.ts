import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { type Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { StatementPage, StatementQuery } from '../financial.models';
import { FinancialService } from '../financial.service';
import { Statement } from './statement';

const PAGE: StatementPage = {
  isDemoData: false,
  total: 2,
  summary: { income: 1210, expense: 400, balance: 810, pending: 240 },
  rows: [
    {
      id: 1,
      dueDate: '2026-08-07',
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
      dueDate: '2026-08-06',
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

async function render(service: Partial<FinancialService>): Promise<ComponentFixture<Statement>> {
  await TestBed.configureTestingModule({
    imports: [Statement],
    providers: [{ provide: FinancialService, useValue: service }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Statement);
  await fixture.whenStable();
  return fixture;
}

describe('Statement', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('totals the period', async () => {
    const fixture = await render({ loadStatement: () => of(PAGE) });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Revenue');
    expect(text).toContain('1,210.00');
    expect(text).toContain('810.00');
    expect(text).toContain('240.00');
  });

  it('lists movements with their type and settlement status', async () => {
    const fixture = await render({ loadStatement: () => of(PAGE) });
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Routine cleaning — Marina Alves');
    expect(text).toContain('Order #2401');
    expect(text).toContain('Expense');
    expect(text).toContain('Outstanding');
  });

  it('re-queries when the period changes', async () => {
    const loadStatement = vi.fn<(query: StatementQuery) => Observable<StatementPage>>(() =>
      of(PAGE),
    );
    const fixture = await render({ loadStatement });

    fixture.componentInstance['selectPeriod'](0);
    await fixture.whenStable();

    const [query] = loadStatement.mock.lastCall ?? [];
    expect(query?.start).toBe(query?.end);
  });

  it('re-queries when the settled filter changes', async () => {
    const loadStatement = vi.fn<(query: StatementQuery) => Observable<StatementPage>>(() =>
      of(PAGE),
    );
    const fixture = await render({ loadStatement });

    fixture.componentInstance['selectPaid'](false);
    await fixture.whenStable();

    expect(loadStatement).toHaveBeenCalledWith(expect.objectContaining({ paid: false, page: 1 }));
  });

  it('reports an empty period', async () => {
    const fixture = await render({
      loadStatement: () =>
        of({
          ...PAGE,
          rows: [],
          total: 0,
          summary: { income: 0, expense: 0, balance: 0, pending: 0 },
        }),
    });

    expect(fixture.nativeElement.textContent).toContain('No movements in this period');
  });

  it('surfaces a load failure', async () => {
    const fixture = await render({
      loadStatement: () => throwError(() => new Error('Service unavailable.')),
    });

    expect(fixture.nativeElement.textContent).toContain('Service unavailable.');
  });
});
