import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/**
 * The current URL as a signal.
 *
 * `RouterLinkActive` covers link highlighting, but anything that has to *derive*
 * from the route — which sidebar group to unfold, which sub-page title to show —
 * needs the URL itself, and `Router.url` is a plain property that no signal
 * tracks.
 */
export function injectCurrentUrl(): Signal<string> {
  const router = inject(Router);

  return toSignal(
    router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => router.url),
    ),
    { initialValue: router.url },
  );
}
