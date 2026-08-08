import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { LoginCredentials, Session, SignUpPayload } from './auth.models';

const NETWORK_LATENCY_MS = 450;

/**
 * In-memory stand-in for the accounts API, used only when
 * `environment.allowDemoFallback` is on and the real backend is unreachable.
 * It keeps the login and sign-up flows explorable without a running server.
 */
@Injectable({ providedIn: 'root' })
export class DemoAuthBackend {
  private readonly accounts = new Map<string, { password: string; displayName: string }>();

  constructor() {
    const demo = environment.demoCredentials;
    if (demo) {
      this.accounts.set(demo.email.toLowerCase(), { password: demo.password, displayName: 'Demo' });
    }
  }

  login({ email, password }: LoginCredentials): Observable<Session> {
    const account = this.accounts.get(email.toLowerCase());
    if (!account || account.password !== password) {
      return throwError(() => new Error('Invalid email or password.')).pipe(
        delay(NETWORK_LATENCY_MS),
      );
    }

    return of(this.session(email, account.displayName)).pipe(delay(NETWORK_LATENCY_MS));
  }

  signUp(payload: SignUpPayload): Observable<Session> {
    const email = payload.email.toLowerCase();
    if (this.accounts.has(email)) {
      return throwError(() => new Error('An account with this email already exists.')).pipe(
        delay(NETWORK_LATENCY_MS),
      );
    }

    this.accounts.set(email, { password: payload.password, displayName: payload.displayName });
    return of(this.session(payload.email, payload.displayName)).pipe(delay(NETWORK_LATENCY_MS));
  }

  private session(email: string, displayName: string): Session {
    return {
      token: `demo-${btoa(email).replace(/=/g, '')}`,
      account: {
        display_name: displayName,
        email,
        subscriptions: [{ status: 'trialing' }],
      },
    };
  }
}
