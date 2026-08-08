import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { apiUrl } from '../../core/api/api-url';
import { errorMessageFrom } from '../../core/api/api-error';
import type { Paginated } from '../../core/api/api.models';
import type {
  AppointmentSummary,
  DashboardData,
  DashboardMetrics,
  PatientSummary,
} from './dashboard.models';
import { demoDashboardData } from './demo-dashboard.data';

const OVERVIEW_LIMIT = 5;

/** Raw row shapes as returned by the legacy REST API. */
interface AppointmentRow {
  id: number;
  patient?: { name?: string } | null;
  doctor?: { display_name?: string } | null;
  starts_at?: string;
  procedure?: string;
  status?: string;
}

interface PatientRow {
  id: number;
  name?: string;
  first_name?: string;
  last_visit_at?: string | null;
  phone?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  load(): Observable<DashboardData> {
    return forkJoin({
      appointments: this.http.get<Paginated<AppointmentRow>>(apiUrl('api/appointments.json'), {
        params: { limit: OVERVIEW_LIMIT },
      }),
      patients: this.http.get<Paginated<PatientRow>>(apiUrl('api/patients.json'), {
        params: { limit: OVERVIEW_LIMIT },
      }),
    }).pipe(
      map(({ appointments, patients }) => this.toDashboardData(appointments, patients)),
      catchError((error: HttpErrorResponse) => {
        if (environment.allowDemoFallback) {
          return of(demoDashboardData());
        }
        return throwError(() => new Error(errorMessageFrom(error)));
      }),
    );
  }

  private toDashboardData(
    appointments: Paginated<AppointmentRow>,
    patients: Paginated<PatientRow>,
  ): DashboardData {
    const rows = appointments.rows ?? [];

    const metrics: DashboardMetrics = {
      appointmentsToday: appointments.count ?? rows.length,
      newPatientsThisMonth: patients.count ?? patients.rows?.length ?? 0,
      revenueThisMonth: 0,
      chairOccupancy: 0,
    };

    return {
      metrics,
      appointments: rows.map((row) => this.toAppointment(row)),
      patients: (patients.rows ?? []).map((row) => this.toPatient(row)),
      isDemoData: false,
    };
  }

  private toAppointment(row: AppointmentRow): AppointmentSummary {
    const status = row.status;
    return {
      id: row.id,
      patientName: row.patient?.name?.trim() || 'Unknown patient',
      doctorName: row.doctor?.display_name?.trim() || 'Unassigned',
      startsAt: row.starts_at ?? new Date().toISOString(),
      procedure: row.procedure?.trim() || 'Appointment',
      status: status === 'confirmed' || status === 'canceled' ? status : 'pending',
    };
  }

  private toPatient(row: PatientRow): PatientSummary {
    return {
      id: row.id,
      name: (row.name ?? row.first_name ?? '').trim() || 'Unnamed patient',
      lastVisit: row.last_visit_at ?? null,
      phone: row.phone ?? null,
    };
  }
}
