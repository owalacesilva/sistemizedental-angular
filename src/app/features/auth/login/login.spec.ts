import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiUrl } from '../../../core/api/api-url';
import { AuthService } from '../../../core/auth/auth.service';
import { Login } from './login';

const TOKEN_ENDPOINT = apiUrl('api/accounts/token.json');

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  function element<T extends HTMLElement>(selector: string): T {
    const found = fixture.nativeElement.querySelector(selector) as T | null;
    expect(found, `expected to find ${selector}`).not.toBeNull();
    return found as T;
  }

  function setValue(selector: string, value: string): void {
    const input = element<HTMLInputElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('renders the sign-in form', () => {
    expect(element('h1').textContent).toContain('Welcome back');
    expect(element('button[type="submit"]').textContent).toContain('Sign in');
  });

  it('does not call the API while the form is invalid', async () => {
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectNone(TOKEN_ENDPOINT);
    expect(fixture.nativeElement.textContent).toContain('Email is required.');
  });

  it('rejects a malformed email before hitting the network', async () => {
    setValue('#email', 'not-an-email');
    setValue('#password', 'sis12345');
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectNone(TOKEN_ENDPOINT);
    expect(fixture.nativeElement.textContent).toContain('Enter a valid email address.');
  });

  it('signs in and navigates to the dashboard', async () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    setValue('#email', 'demo@sistemizedental.com');
    setValue('#password', 'sis12345');
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectOne(TOKEN_ENDPOINT).flush({
      token: 'abc123',
      account: { display_name: 'Demo Clinic' },
    });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith('/dashboard');
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(true);
  });

  it('shows the API error message when sign-in fails', async () => {
    setValue('#email', 'demo@sistemizedental.com');
    setValue('#password', 'wrong-password');
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http
      .expectOne(TOKEN_ENDPOINT)
      .flush({ errors: 'Invalid credentials.' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Invalid credentials.');
    expect(element('button[type="submit"]').textContent).toContain('Sign in');
  });

  it('toggles password visibility', async () => {
    const password = element<HTMLInputElement>('#password');
    expect(password.type).toBe('password');

    element<HTMLButtonElement>('[aria-label="Show password"]').click();
    await fixture.whenStable();

    expect(element<HTMLInputElement>('#password').type).toBe('text');
  });
});
