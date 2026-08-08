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
    ],
  },
  {
    path: '**',
    title: 'Page not found · Sistemize Dental',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
