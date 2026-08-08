import type { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    title: 'Dashboard · Sistemize Dental',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
];
