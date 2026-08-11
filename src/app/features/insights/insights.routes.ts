import type { Routes } from '@angular/router';

export const insightsRoutes: Routes = [
  {
    path: '',
    title: 'Insights · Sistemize Dental',
    loadComponent: () => import('./insights/insights').then((m) => m.Insights),
  },
];
