import { Injectable } from '@angular/core';

import type { Session } from './auth.models';

/** Keys kept identical to the legacy AngularJS app so existing sessions survive. */
const TOKEN_KEY = 'acc_token';
const ACCOUNT_KEY = 'acc_data';

/**
 * Thin wrapper over `localStorage` that never throws — private-browsing modes and
 * SSR/test environments can make storage unavailable or quota-limited.
 */
@Injectable({ providedIn: 'root' })
export class AuthStorage {
  read(): Session | null {
    const token = this.get(TOKEN_KEY);
    const rawAccount = this.get(ACCOUNT_KEY);
    if (!token || !rawAccount) {
      return null;
    }

    try {
      return { token, account: JSON.parse(rawAccount) };
    } catch {
      this.clear();
      return null;
    }
  }

  write(session: Session): void {
    this.set(TOKEN_KEY, session.token);
    this.set(ACCOUNT_KEY, JSON.stringify(session.account));
  }

  clear(): void {
    this.remove(TOKEN_KEY);
    this.remove(ACCOUNT_KEY);
    // Legacy per-session scratch data.
    try {
      sessionStorage.removeItem('account_id_selected');
      sessionStorage.removeItem('account_list_cached');
    } catch {
      /* storage unavailable — nothing to clean up */
    }
  }

  private get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable or full — session simply won't persist */
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  }
}
