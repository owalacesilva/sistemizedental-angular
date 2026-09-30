import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';

import { apiUrl } from '../../core/api/api-url';
import { type Paginated, pageQuery } from '../../core/api/api.models';
import { withDemoFallback } from '../../core/api/demo-fallback';
import { demoPatientById, demoPatientsPage } from './demo-patients.data';
import type { PatientRecord, PatientsPage, PatientsQuery } from './patients.models';

/** Raw row shape as returned by `GET api/patients.json`. */
interface PatientRow {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  email?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  birth_date?: string | null;
  last_visit_at?: string | null;
  blocked?: boolean;
  anamnesis?: {
    allergies?: string[] | null;
    medications?: string[] | null;
    conditions?: string[] | null;
    notes?: string | null;
    updated_at?: string | null;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private readonly http = inject(HttpClient);

  list(query: PatientsQuery): Observable<PatientsPage> {
    const { page, limit, offset, order } = pageQuery(query.page, query.pageSize, 'full_name-asc');

    return this.http
      .get<Paginated<PatientRow>>(apiUrl('api/patients.json'), {
        params: {
          page,
          limit,
          offset,
          order: order ?? '',
          type: query.field,
          search: query.search,
        },
      })
      .pipe(
        map((response) => this.toPage(response)),
        withDemoFallback(() => demoPatientsPage(query)),
      );
  }

  /** One patient; `null` when the API (or demo roster) has no such record. */
  get(id: number): Observable<PatientRecord | null> {
    return this.http.get<PatientRow | null>(apiUrl(`api/patients/${id}.json`)).pipe(
      map((row) => (row ? this.toPatient(row) : null)),
      withDemoFallback(() => demoPatientById(id)),
    );
  }

  private toPage(response: Paginated<PatientRow>): PatientsPage {
    const rows = response.rows ?? [];

    return {
      rows: rows.map((row) => this.toPatient(row)),
      total: response.count ?? rows.length,
      isDemoData: false,
    };
  }

  private toPatient(row: PatientRow): PatientRecord {
    const name =
      row.full_name?.trim() || [row.first_name, row.last_name].filter(Boolean).join(' ').trim();

    return {
      id: row.id,
      name: name || 'Unnamed patient',
      phone: row.phone_number?.trim() || null,
      email: row.email?.trim() || null,
      neighborhood: row.neighborhood?.trim() || null,
      city: row.city?.trim() || null,
      state: row.state?.trim() || null,
      birthDate: row.birth_date ?? null,
      lastVisit: row.last_visit_at ?? null,
      active: !row.blocked,
      anamnesis: row.anamnesis
        ? {
            allergies: row.anamnesis.allergies ?? [],
            medications: row.anamnesis.medications ?? [],
            conditions: row.anamnesis.conditions ?? [],
            notes: row.anamnesis.notes?.trim() || null,
            updatedAt: row.anamnesis.updated_at ?? null,
          }
        : null,
    };
  }
}
