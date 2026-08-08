import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';

import { apiUrl } from '../../core/api/api-url';
import type { Paginated } from '../../core/api/api.models';
import { withDemoFallback } from '../../core/api/demo-fallback';
import { demoDoctors } from './demo-doctors.data';
import type { DoctorRecord, DoctorsList, Weekday } from './doctors.models';

/** A clinic has a handful of doctors — fetch the roster in one page. */
const ROSTER_LIMIT = 100;

/** `works_*` flags on the legacy `working_hours` record, in `getDay()` order. */
const WORKING_DAY_FLAGS = [
  'works_sunday',
  'works_monday',
  'works_tuesday',
  'works_wednesday',
  'works_thursday',
  'works_friday',
  'works_saturday',
] as const;

/** Raw row shape as returned by `GET api/accounts.json`. */
interface AccountRow {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email?: string | null;
  phone_number?: string | null;
  birth_date?: string | null;
  blocked?: boolean;
  working_hours?: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private readonly http = inject(HttpClient);

  list(): Observable<DoctorsList> {
    return this.http
      .get<Paginated<AccountRow>>(apiUrl('api/accounts.json'), {
        params: { limit: ROSTER_LIMIT, order: 'full_name-asc' },
      })
      .pipe(
        map((response) => ({
          rows: (response.rows ?? []).map((row) => this.toDoctor(row)),
          isDemoData: false,
        })),
        withDemoFallback(() => demoDoctors()),
      );
  }

  private toDoctor(row: AccountRow): DoctorRecord {
    const name =
      row.full_name?.trim() ||
      [row.first_name, row.last_name].filter(Boolean).join(' ').trim() ||
      row.display_name?.trim();

    return {
      id: row.id,
      name: name || `Doctor #${row.id}`,
      email: row.email?.trim() || null,
      phone: row.phone_number?.trim() || null,
      birthDate: row.birth_date ?? null,
      blocked: row.blocked === true,
      workingDays: toWorkingDays(row.working_hours),
    };
  }
}

function toWorkingDays(hours: Record<string, unknown> | null | undefined): readonly Weekday[] {
  if (!hours) {
    return [];
  }

  return WORKING_DAY_FLAGS.flatMap((flag, day) => (hours[flag] ? [day as Weekday] : []));
}
