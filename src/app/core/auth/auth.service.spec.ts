import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { apiUrl } from '../api/api-url';
import type { TokenResponse } from './auth.models';
import { AuthService } from './auth.service';

const TOKEN_RESPONSE: TokenResponse = {
  token: 'abc123',
  account: { display_name: 'Demo Clinic', email: 'demo@sistemizedental.com' },
};

function configure(): void {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
}

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    configure();
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('starts unauthenticated with empty storage', () => {
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.account()).toBeNull();
  });

  it('sends Basic credentials and stores the returned session', async () => {
    const pending = firstValueFrom(
      auth.login({ email: 'demo@sistemizedental.com', password: 'sis12345' }),
    );

    const request = http.expectOne(apiUrl('api/accounts/token.json'));
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(
      `Basic ${btoa('demo@sistemizedental.com:sis12345')}`,
    );

    request.flush(TOKEN_RESPONSE);
    await pending;

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.token()).toBe('abc123');
    expect(auth.displayName()).toBe('Demo Clinic');
    expect(localStorage.getItem('acc_token')).toBe('abc123');
  });

  it('surfaces a readable message when the API rejects the credentials', async () => {
    const pending = firstValueFrom(
      auth.login({ email: 'demo@sistemizedental.com', password: 'wrong' }),
    );

    http
      .expectOne(apiUrl('api/accounts/token.json'))
      .flush({ errors: 'Invalid credentials.' }, { status: 401, statusText: 'Unauthorized' });

    await expect(pending).rejects.toThrow('Invalid credentials.');
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('posts the account payload on sign-up', async () => {
    const pending = firstValueFrom(
      auth.signUp({
        clinicName: 'Bright Smile',
        displayName: 'Dr. Alex',
        email: 'alex@clinic.com',
        password: 'sup3rsecret',
      }),
    );

    const request = http.expectOne(apiUrl('api/accounts.json'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({
      account: { display_name: 'Bright Smile', email: 'alex@clinic.com' },
    });

    request.flush(TOKEN_RESPONSE);
    await pending;

    expect(auth.isAuthenticated()).toBe(true);
  });

  it('clears storage and state on logout', async () => {
    const pending = firstValueFrom(auth.login({ email: 'a@b.com', password: 'secret1' }));
    http.expectOne(apiUrl('api/accounts/token.json')).flush(TOKEN_RESPONSE);
    await pending;

    auth.logout();

    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('acc_token')).toBeNull();
    expect(localStorage.getItem('acc_data')).toBeNull();
  });
});

describe('AuthService with a persisted session', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('acc_token', 'stored-token');
    localStorage.setItem('acc_data', JSON.stringify({ display_name: 'Returning Clinic' }));
    configure();
  });

  afterEach(() => localStorage.clear());

  it('restores the session written by a previous visit', () => {
    const auth = TestBed.inject(AuthService);

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.token()).toBe('stored-token');
    expect(auth.displayName()).toBe('Returning Clinic');
  });

  it('discards a corrupted account blob instead of crashing', () => {
    localStorage.setItem('acc_data', '{not json');

    const auth = TestBed.inject(AuthService);

    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('acc_token')).toBeNull();
  });
});
