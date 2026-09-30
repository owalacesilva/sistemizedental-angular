/** Field the legacy API matches `search` against (its `type` parameter). */
export type PatientSearchField = 'first_name' | 'phone_number' | 'email';

/** Medical history (anamnese) taken at the patient's first visit and kept up to date. */
export interface PatientAnamnesis {
  readonly allergies: readonly string[];
  readonly medications: readonly string[];
  readonly conditions: readonly string[];
  readonly notes: string | null;
  /** ISO-8601 date of the last review, or null when unknown. */
  readonly updatedAt: string | null;
}

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
  /** Only loaded by the detail endpoint; `null` when none is on file. */
  readonly anamnesis?: PatientAnamnesis | null;
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
