/** `0` is Sunday, matching `Date.prototype.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DoctorFilter = 'all' | 'active' | 'blocked';

export interface DoctorRecord {
  readonly id: number;
  readonly name: string;
  readonly email: string | null;
  readonly phone: string | null;
  /** ISO-8601 date, or null when not on file. */
  readonly birthDate: string | null;
  /** Blocked doctors keep their history but take no new bookings. */
  readonly blocked: boolean;
  /** Days the doctor holds surgery hours, from the legacy `working_hours` record. */
  readonly workingDays: readonly Weekday[];
}

export interface DoctorsList {
  readonly rows: readonly DoctorRecord[];
  /** True when the data came from the in-memory demo backend. */
  readonly isDemoData: boolean;
}
