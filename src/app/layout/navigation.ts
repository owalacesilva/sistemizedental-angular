import type { MessageKey } from '../core/i18n/messages.en';

/** A section's second level — rendered inside the sidebar, not as in-page tabs. */
export interface NavChild {
  readonly labelKey: MessageKey;
  readonly descriptionKey: MessageKey;
  /** Absolute route. */
  readonly route: string;
}

export interface NavItem {
  readonly labelKey: MessageKey;
  readonly descriptionKey: MessageKey;
  /** Absolute route. For a group, where clicking the parent lands you. */
  readonly route: string;
  /** Inline SVG path data (24×24 viewBox, stroke-based). */
  readonly icon: string;
  readonly children?: readonly NavChild[];
  /** Screens still to be ported from the legacy AngularJS app. */
  readonly comingSoon?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    labelKey: 'nav.dashboard',
    descriptionKey: 'nav.dashboard.description',
    route: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    labelKey: 'nav.insights',
    descriptionKey: 'nav.insights.description',
    route: '/insights',
    icon: 'M7 16V9m5 7V5m5 11v-4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
  },
  {
    labelKey: 'nav.calendar',
    descriptionKey: 'nav.calendar.description',
    route: '/calendar',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    labelKey: 'nav.patients',
    descriptionKey: 'nav.patients.description',
    route: '/patients',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    labelKey: 'nav.doctors',
    descriptionKey: 'nav.doctors.description',
    route: '/doctors',
    icon: 'M11 6.253v13m0-13C9.832 5.477 8.246 5 6.5 5S3.168 5.477 2 6.253v13C3.168 18.477 4.754 18 6.5 18s3.332.477 4.5 1.253m0-13C12.168 5.477 13.754 5 15.5 5s3.332.477 4.5 1.253v13C18.832 18.477 17.246 18 15.5 18s-3.332.477-4.5 1.253',
  },
  {
    labelKey: 'nav.financial',
    descriptionKey: 'nav.financial.description',
    route: '/financial',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    children: [
      {
        labelKey: 'nav.financial.statement',
        descriptionKey: 'nav.financial.statement.description',
        route: '/financial/statement',
      },
      {
        labelKey: 'nav.financial.transactions',
        descriptionKey: 'nav.financial.transactions.description',
        route: '/financial/transactions',
      },
      {
        labelKey: 'nav.financial.payables',
        descriptionKey: 'nav.financial.payables.description',
        route: '/financial/payables',
      },
      {
        labelKey: 'nav.financial.paymentMethods',
        descriptionKey: 'nav.financial.paymentMethods.description',
        route: '/financial/payment-methods',
      },
    ],
  },
  {
    labelKey: 'nav.settings',
    descriptionKey: 'nav.settings.description',
    route: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    children: [
      {
        labelKey: 'nav.settings.profile',
        descriptionKey: 'nav.settings.profile.description',
        route: '/settings/profile',
      },
      {
        labelKey: 'nav.settings.address',
        descriptionKey: 'nav.settings.address.description',
        route: '/settings/address',
      },
      {
        labelKey: 'nav.settings.security',
        descriptionKey: 'nav.settings.security.description',
        route: '/settings/security',
      },
    ],
  },
];

/** True when `url` is inside `route` — `/financial/statement` belongs to `/financial`. */
export function isUnderRoute(url: string, route: string): boolean {
  return url === route || url.startsWith(`${route}/`) || url.startsWith(`${route}?`);
}

/**
 * The sub-item a URL is currently on. Section shells use it to title themselves
 * now that the tab bar has moved into the sidebar.
 *
 * The full-path match is what runs in the app. The leaf fallback is for a section
 * mounted somewhere other than its usual place — which is exactly what the route
 * specs do when they exercise a feature's routes in isolation — so the shell does
 * not silently lose its heading depending on where it was mounted.
 */
export function findNavChild(url: string): NavChild | null {
  const path = url.split(/[?#]/)[0];
  const children = NAV_ITEMS.flatMap((item) => item.children ?? []);

  const exact = children.find((child) => isUnderRoute(path, child.route));
  if (exact) {
    return exact;
  }

  const leaf = path.split('/').filter(Boolean).at(-1);
  return leaf ? (children.find((child) => child.route.endsWith(`/${leaf}`)) ?? null) : null;
}
