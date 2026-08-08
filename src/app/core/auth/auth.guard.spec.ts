import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Router,
  UrlTree,
  type ActivatedRouteSnapshot,
  type CanActivateFn,
  type RouterStateSnapshot,
} from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { authGuard, guestGuard } from './auth.guard';

function runGuard(guard: CanActivateFn, injector: Injector, url: string): boolean | UrlTree {
  const state = { url } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  return runInInjectionContext(injector, () => guard(route, state)) as boolean | UrlTree;
}

/**
 * Seeds a persisted session. `AuthService` reads storage when it is first
 * constructed, and the guards construct it lazily — so seeding before the guard
 * runs is enough to make the user look signed in.
 */
function seedSession(): void {
  localStorage.setItem('acc_token', 'token');
  localStorage.setItem('acc_data', JSON.stringify({ display_name: 'Clinic' }));
}

describe('auth guards', () => {
  let injector: Injector;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    injector = TestBed.inject(Injector);
    router = TestBed.inject(Router);
  });

  describe('authGuard', () => {
    it('redirects an anonymous visitor to /login, preserving the target', () => {
      const result = runGuard(authGuard, injector, '/dashboard');

      expect(result).toBeInstanceOf(UrlTree);
      expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fdashboard');
    });

    it('lets an authenticated user through', () => {
      seedSession();

      expect(runGuard(authGuard, injector, '/dashboard')).toBe(true);
    });
  });

  describe('guestGuard', () => {
    it('allows an anonymous visitor to reach the login screen', () => {
      expect(runGuard(guestGuard, injector, '/login')).toBe(true);
    });

    it('bounces an authenticated user to the dashboard', () => {
      seedSession();

      const result = runGuard(guestGuard, injector, '/login');

      expect(result).toBeInstanceOf(UrlTree);
      expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
    });
  });
});
