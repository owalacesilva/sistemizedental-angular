import type { Routes } from '@angular/router';

import { Financial } from './financial/financial';

export const financialRoutes: Routes = [
  {
    path: '',
    component: Financial,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'statement' },
      {
        path: 'statement',
        title: 'Statement · Financial · Sistemize Dental',
        loadComponent: () => import('./statement/statement').then((m) => m.Statement),
      },
      {
        path: 'payables',
        title: 'Bills to pay · Financial · Sistemize Dental',
        loadComponent: () => import('./payables/payables').then((m) => m.Payables),
      },
      {
        path: 'payment-methods',
        title: 'Payment methods · Financial · Sistemize Dental',
        loadComponent: () =>
          import('./payment-methods/payment-methods').then((m) => m.PaymentMethods),
      },
    ],
  },
];
