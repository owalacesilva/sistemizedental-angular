import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { financialRoutes } from './financial.routes';
import { FinancialService } from './financial.service';

const EMPTY_STATEMENT = {
  rows: [],
  total: 0,
  summary: { income: 0, expense: 0, balance: 0, pending: 0 },
  isDemoData: false,
};

/**
 * The section is a shell with lazy children, so the wiring — redirect, header,
 * child render — is only exercised by going through the router. The sub-navigation
 * itself now lives in the sidebar, so what the shell owes each child is the
 * eyebrow-plus-heading that says where you are.
 */
async function navigate(path: string): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(financialRoutes),
      {
        provide: FinancialService,
        useValue: {
          loadStatement: () => of(EMPTY_STATEMENT),
          loadTransactions: () =>
            of({
              rows: [],
              total: 0,
              totals: { inflow: 0, outflow: 0, net: 0, unsettled: 0 },
              isDemoData: false,
            }),
          loadPayables: () =>
            of({ rows: [], total: 0, outstanding: 0, overdue: 0, isDemoData: false }),
          loadPaymentMethods: () => of({ rows: [], isDemoData: false }),
        },
      },
    ],
  });

  const harness = await RouterTestingHarness.create(path);
  await harness.fixture.whenStable();
  return harness.fixture.nativeElement as HTMLElement;
}

describe('financialRoutes', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('lands on the statement and titles itself after it', async () => {
    const element = await navigate('/');

    expect(element.textContent).toContain('Financial');
    expect(element.textContent).toContain('No movements in this period');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Statement');
  });

  it('renders the ledger', async () => {
    const element = await navigate('/transactions');

    expect(element.textContent).toContain('No transactions match these filters');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Transactions');
  });

  it('renders the bills', async () => {
    const element = await navigate('/payables');

    expect(element.textContent).toContain('Nothing to pay');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Bills to pay');
  });

  it('renders the payment methods', async () => {
    const element = await navigate('/payment-methods');

    expect(element.textContent).toContain('No payment methods configured');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Payment methods');
  });
});
