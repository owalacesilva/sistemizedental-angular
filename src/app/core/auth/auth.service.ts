import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { apiUrl } from '../api/api-url';
import { errorMessageFrom } from '../api/api-error';
import type { LoginCredentials, Session, SignUpPayload, TokenResponse } from './auth.models';
import { AuthStorage } from './auth.storage';
import { DemoAuthBackend } from './demo-auth.backend';

/** Status codes that mean "the API never answered", not "the API said no". */
const UNREACHABLE_STATUSES = new Set([0, 502, 503, 504]);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(AuthStorage);
  private readonly demo = inject(DemoAuthBackend);

  private readonly session = signal<Session | null>(this.storage.read());

  readonly account = computed(() => this.session()?.account ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly displayName = computed(() => this.account()?.display_name ?? '');

  login(credentials: LoginCredentials): Observable<Session> {
    const basic = btoa(`${credentials.email}:${credentials.password}`);

    return this.http
      .get<TokenResponse>(apiUrl('api/accounts/token.json'), {
        headers: new HttpHeaders({ Authorization: `Basic ${basic}` }),
      })
      .pipe(
        map(({ token, account }) => ({ token, account }) satisfies Session),
        catchError((error: HttpErrorResponse) =>
          this.recover(error, () => this.demo.login(credentials)),
        ),
        tap((session) => this.start(session)),
      );
  }

  signUp(payload: SignUpPayload): Observable<Session> {
    return this.http
      .post<TokenResponse>(apiUrl('api/accounts.json'), {
        account: {
          display_name: payload.clinicName,
          owner_name: payload.displayName,
          email: payload.email,
          password: payload.password,
        },
      })
      .pipe(
        map(({ token, account }) => ({ token, account }) satisfies Session),
        catchError((error: HttpErrorResponse) =>
          this.recover(error, () => this.demo.signUp(payload)),
        ),
        tap((session) => this.start(session)),
      );
  }

  logout(): void {
    this.storage.clear();
    this.session.set(null);
  }

  private start(session: Session): void {
    this.storage.write(session);
    this.session.set(session);
  }

  /**
   * Falls back to the in-memory backend when the API is unreachable and demo mode
   * is enabled. A real rejection (401, 422, …) is always surfaced to the caller.
   */
  private recover(
    error: HttpErrorResponse,
    fallback: () => Observable<Session>,
  ): Observable<Session> {
    const unreachable = UNREACHABLE_STATUSES.has(error.status);
    if (environment.allowDemoFallback && unreachable) {
      return fallback();
    }

    return throwError(() => new Error(errorMessageFrom(error)));
  }
}
