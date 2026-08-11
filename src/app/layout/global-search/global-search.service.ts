import { Injectable, inject } from '@angular/core';
import { type Observable, catchError, forkJoin, map, of } from 'rxjs';

import { DoctorsService } from '../../features/doctors/doctors.service';
import { PatientsService } from '../../features/patients/patients.service';
import type { PatientSearchField } from '../../features/patients/patients.models';

export type SearchGroup = 'pages' | 'patients' | 'doctors';

export interface SearchHit {
  /** Stable across re-queries so `@for` can track it. */
  readonly id: string;
  readonly group: SearchGroup;
  readonly title: string;
  readonly subtitle: string | null;
  readonly route: string;
  readonly queryParams?: Readonly<Record<string, string>>;
  /** Inline SVG path data (24×24 viewBox, stroke-based). */
  readonly icon: string;
}

const PATIENT_ICON =
  'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z';
const DOCTOR_ICON =
  'M11 6.253v13m0-13C9.832 5.477 8.246 5 6.5 5S3.168 5.477 2 6.253v13C3.168 18.477 4.754 18 6.5 18s3.332.477 4.5 1.253m0-13C12.168 5.477 13.754 5 15.5 5s3.332.477 4.5 1.253v13C18.832 18.477 17.246 18 15.5 18s-3.332.477-4.5 1.253';

const RESULT_LIMIT = 5;

/**
 * Picks the API's `type` parameter from the shape of what was typed, so an email
 * or a phone number finds its patient without the user first switching a
 * dropdown they cannot see from here.
 */
export function patientFieldFor(term: string): PatientSearchField {
  if (term.includes('@')) {
    return 'email';
  }

  const digits = term.replace(/\D/g, '');
  return digits.length >= 4 && digits.length / term.length > 0.5 ? 'phone_number' : 'first_name';
}

/**
 * The remote half of the command palette.
 *
 * Each source is caught independently: the roster failing should still let you
 * find a patient, and a palette that goes blank because one endpoint is down is
 * worse than a partial one.
 */
@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly patients = inject(PatientsService);
  private readonly doctors = inject(DoctorsService);

  lookup(term: string): Observable<readonly SearchHit[]> {
    const query = term.trim();

    return forkJoin({
      patients: this.patients
        .list({
          search: query,
          field: patientFieldFor(query),
          page: 1,
          pageSize: RESULT_LIMIT,
        })
        .pipe(
          map((page) => page.rows),
          catchError(() => of([])),
        ),
      doctors: this.doctors.list().pipe(
        map((list) => list.rows),
        catchError(() => of([])),
      ),
    }).pipe(
      map(({ patients, doctors }) => {
        const needle = query.toLowerCase();

        const patientHits: SearchHit[] = patients.map((patient) => ({
          id: `patient-${patient.id}`,
          group: 'patients',
          title: patient.name,
          subtitle: patient.phone ?? patient.email,
          route: '/patients',
          queryParams: { search: patient.name },
          icon: PATIENT_ICON,
        }));

        const doctorHits: SearchHit[] = doctors
          .filter((doctor) =>
            `${doctor.name} ${doctor.email ?? ''} ${doctor.phone ?? ''}`
              .toLowerCase()
              .includes(needle),
          )
          .slice(0, RESULT_LIMIT)
          .map((doctor) => ({
            id: `doctor-${doctor.id}`,
            group: 'doctors',
            title: doctor.name,
            subtitle: doctor.email ?? doctor.phone,
            route: '/doctors',
            icon: DOCTOR_ICON,
          }));

        return [...patientHits, ...doctorHits];
      }),
    );
  }
}
