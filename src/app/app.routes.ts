import type { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Sign in · Sistemize Dental',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'sign-up',
    canActivate: [guestGuard],
    title: 'Create account · Sistemize Dental',
    loadComponent: () => import('./features/auth/sign-up/sign-up').then((m) => m.SignUp),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./features/calendar/calendar.routes').then((m) => m.calendarRoutes),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./features/patients/patients.routes').then((m) => m.patientsRoutes),
      },
      {
        path: 'doctors',
        loadChildren: () =>
          import('./features/doctors/doctors.routes').then((m) => m.doctorsRoutes),
      },
      {
        path: 'financial',
        loadChildren: () =>
          import('./features/financial/financial.routes').then((m) => m.financialRoutes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.settingsRoutes),
      },
    ],
  },
  {
    path: '**',
    title: 'Page not found · Sistemize Dental',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
