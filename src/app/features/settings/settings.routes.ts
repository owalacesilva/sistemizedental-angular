import type { Routes } from '@angular/router';

import { Settings } from './settings/settings';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: Settings,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'profile',
        title: 'Clinic profile · Settings · Sistemize Dental',
        loadComponent: () => import('./profile/profile').then((m) => m.Profile),
      },
      {
        path: 'address',
        title: 'Address · Settings · Sistemize Dental',
        loadComponent: () => import('./address/address').then((m) => m.Address),
      },
      {
        path: 'security',
        title: 'Security · Settings · Sistemize Dental',
        loadComponent: () => import('./security/security').then((m) => m.Security),
      },
    ],
  },
];
