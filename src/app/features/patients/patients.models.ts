/** Field the legacy API matches `search` against (its `type` parameter). */
export type PatientSearchField = 'first_name' | 'phone_number' | 'email';

export interface PatientRecord {
  readonly id: number;
  readonly name: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly neighborhood: string | null;
  readonly city: string | null;
  readonly state: string | null;
  /** ISO-8601 date, or null when not on file. */
  readonly birthDate: string | null;
  readonly lastVisit: string | null;
  readonly active: boolean;
}

export interface PatientsPage {
  readonly rows: readonly PatientRecord[];
  readonly total: number;
  /** True when the data came from the in-memory demo backend. */
  readonly isDemoData: boolean;
}

export interface PatientsQuery {
  readonly search: string;
  readonly field: PatientSearchField;
  /** 1-based. */
  readonly page: number;
  readonly pageSize: number;
}
