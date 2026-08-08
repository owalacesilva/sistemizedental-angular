import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, forkJoin, map } from 'rxjs';

import { apiUrl } from '../../core/api/api-url';
import type { Paginated } from '../../core/api/api.models';
import { withDemoFallback } from '../../core/api/demo-fallback';
import type {
  Schedule,
  ScheduleDoctor,
  ScheduleEvent,
  ScheduleQuery,
  ScheduleStatus,
} from './calendar.models';
import { demoSchedule } from './demo-calendar.data';

const STATUSES: readonly ScheduleStatus[] = [
  'created',
  'confirmed',
  'arrived',
  'finished',
  'missed',
  'canceled',
];

const DEFAULT_DURATION_MINUTES = 30;

/** Raw row shapes as returned by the legacy REST API. */
interface AppointmentRow {
  id: number;
  account_id?: number;
  /** Calendar day; the clock lives in `start_time` / `end_time`. */
  date_at?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  client?: { full_name?: string } | null;
  patient?: { full_name?: string } | null;
  account?: { id?: number; full_name?: string; display_name?: string } | null;
  service?: { title?: string } | null;
  procedure?: string;
}

interface AccountRow {
  id: number;
  full_name?: string;
  display_name?: string;
  blocked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);

  /** Loads every appointment in the window, plus the doctors to filter it by. */
  load(query: ScheduleQuery): Observable<Schedule> {
    return forkJoin({
      appointments: this.http.get<Paginated<AppointmentRow>>(apiUrl('api/appointments.json'), {
        params: { date_start: query.start, date_end: query.end },
      }),
      doctors: this.http.get<Paginated<AccountRow>>(apiUrl('api/accounts.json'), {
        params: { limit: 100 },
      }),
    }).pipe(
      map(({ appointments, doctors }) => this.toSchedule(appointments, doctors)),
      withDemoFallback(() => demoSchedule(query)),
    );
  }

  private toSchedule(
    appointments: Paginated<AppointmentRow>,
    doctors: Paginated<AccountRow>,
  ): Schedule {
    return {
      events: (appointments.rows ?? []).map((row) => this.toEvent(row)),
      doctors: (doctors.rows ?? []).map((row) => this.toDoctor(row)),
      isDemoData: false,
    };
  }

  private toEvent(row: AppointmentRow): ScheduleEvent {
    const startsAt = combine(row.date_at, row.start_time, 9);
    const endsAt = combine(row.date_at, row.end_time, 10);

    return {
      id: row.id,
      patientName: row.client?.full_name?.trim() || row.patient?.full_name?.trim() || 'Reserved',
      doctorId: row.account?.id ?? row.account_id ?? 0,
      doctorName:
        row.account?.full_name?.trim() || row.account?.display_name?.trim() || 'Unassigned',
      procedure: row.service?.title?.trim() || row.procedure?.trim() || 'Appointment',
      status: toStatus(row.status),
      startsAt,
      endsAt:
        Date.parse(endsAt) > Date.parse(startsAt)
          ? endsAt
          : new Date(Date.parse(startsAt) + DEFAULT_DURATION_MINUTES * 60_000).toISOString(),
    };
  }

  private toDoctor(row: AccountRow): ScheduleDoctor {
    return {
      id: row.id,
      name: row.full_name?.trim() || row.display_name?.trim() || `Doctor #${row.id}`,
    };
  }
}

function toStatus(value: string | undefined): ScheduleStatus {
  return STATUSES.find((status) => status === value) ?? 'created';
}

/**
 * The API keeps the day and the clock in separate UTC fields; the clinic reads both
 * as wall-clock time. Rebuild one local timestamp out of their UTC components.
 */
function combine(
  dateAt: string | undefined,
  time: string | undefined,
  fallbackHour: number,
): string {
  const day = dateAt ? new Date(dateAt) : new Date();
  const base = Number.isNaN(day.getTime()) ? new Date() : day;

  const clock = time ? new Date(time) : null;
  const valid = clock && !Number.isNaN(clock.getTime()) ? clock : null;

  return new Date(
    base.getUTCFullYear(),
    base.getUTCMonth(),
    base.getUTCDate(),
    valid ? valid.getUTCHours() : fallbackHour,
    valid ? valid.getUTCMinutes() : 0,
  ).toISOString();
}
