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
 * The section is a shell with lazy children, so the wiring — redirect, tab bar,
 * child render — is only exercised by going through the router.
 */
async function navigate(path: string): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(financialRoutes),
      {
        provide: FinancialService,
        useValue: {
          loadStatement: () => of(EMPTY_STATEMENT),
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

  it('lands on the statement and marks its tab current', async () => {
    const element = await navigate('/');

    expect(element.textContent).toContain('Financial');
    expect(element.textContent).toContain('No movements in this period');
    expect(element.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Statement');
  });

  it('renders the bills tab', async () => {
    const element = await navigate('/payables');

    expect(element.textContent).toContain('Nothing to pay');
    expect(element.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe(
      'Bills to pay',
    );
  });

  it('renders the payment methods tab', async () => {
    const element = await navigate('/payment-methods');

    expect(element.textContent).toContain('No payment methods configured');
    expect(element.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe(
      'Payment methods',
    );
  });
});
