import type { Routes } from '@angular/router';

export const patientsRoutes: Routes = [
  {
    path: '',
    title: 'Patients · Sistemize Dental',
    loadComponent: () => import('./patients/patients').then((m) => m.Patients),
  },
];
