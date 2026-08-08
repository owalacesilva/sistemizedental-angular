import type { Routes } from '@angular/router';

export const calendarRoutes: Routes = [
  {
    path: '',
    title: 'Calendar · Sistemize Dental',
    loadComponent: () => import('./calendar/calendar').then((m) => m.Calendar),
  },
];
