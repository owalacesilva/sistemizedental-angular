import type { Routes } from '@angular/router';

export const doctorsRoutes: Routes = [
  {
    path: '',
    title: 'Doctors · Sistemize Dental',
    loadComponent: () => import('./doctors/doctors').then((m) => m.Doctors),
  },
];
