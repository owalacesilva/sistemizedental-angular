import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map, shareReplay, tap } from 'rxjs';

import { apiUrl } from '../../core/api/api-url';
import { withDemoFallback } from '../../core/api/demo-fallback';
import { demoSettings } from './demo-settings.data';
import type {
  ClinicAddress,
  ClinicProfile,
  ClinicSettings,
  PasswordChange,
} from './settings.models';

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

/** Raw shape returned by `GET api/accounts/me.json`. */
interface AccountMeRow {
  display_name?: string;
  email?: string;
  phone_number?: string;
  username?: string;
  short_about_me?: string;
  about_me?: string;
  timezone?: string;
  searchable?: boolean;
  postal_code?: string;
  street?: string;
  street_number?: string | number;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  /**
   * Both settings tabs read the same account record, so the request is shared and
   * replayed. Any successful write drops the cache.
   */
  private cached: Observable<ClinicSettings> | null = null;

  load(): Observable<ClinicSettings> {
    this.cached ??= this.http.get<AccountMeRow>(apiUrl('api/accounts/me.json')).pipe(
      map((row) => this.toSettings(row)),
      withDemoFallback(() => demoSettings()),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.cached;
  }

  saveProfile(profile: ClinicProfile): Observable<void> {
    return this.http
      .put<void>(apiUrl('api/accounts/me'), {
        display_name: profile.displayName,
        email: profile.email,
        phone_number: profile.phone,
        username: profile.username,
        short_about_me: profile.shortAbout,
        about_me: profile.about,
        timezone: profile.timezone,
        searchable: profile.searchable,
      })
      .pipe(
        withDemoFallback<void>(() => undefined),
        tap(() => this.invalidate()),
      );
  }

  saveAddress(address: ClinicAddress): Observable<void> {
    return this.http
      .put<void>(apiUrl('api/accounts/address'), {
        postal_code: address.postalCode,
        street: address.street,
        street_number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      })
      .pipe(
        withDemoFallback<void>(() => undefined),
        tap(() => this.invalidate()),
      );
  }

  changePassword(change: PasswordChange): Observable<void> {
    return this.http
      .put<void>(apiUrl('api/accounts/password'), {
        current_password: change.currentPassword,
        password: change.newPassword,
      })
      .pipe(withDemoFallback<void>(() => undefined));
  }

  /** Forces the next `load()` to hit the API again. */
  invalidate(): void {
    this.cached = null;
  }

  private toSettings(row: AccountMeRow): ClinicSettings {
    return {
      isDemoData: false,
      profile: {
        displayName: row.display_name ?? '',
        email: row.email ?? '',
        phone: row.phone_number ?? '',
        username: row.username ?? '',
        shortAbout: row.short_about_me ?? '',
        about: row.about_me ?? '',
        timezone: row.timezone || DEFAULT_TIMEZONE,
        searchable: row.searchable !== false,
      },
      address: {
        postalCode: row.postal_code ?? '',
        street: row.street ?? '',
        number: row.street_number != null ? `${row.street_number}` : '',
        complement: row.complement ?? '',
        neighborhood: row.neighborhood ?? '',
        city: row.city ?? '',
        state: row.state ?? '',
      },
    };
  }
}
