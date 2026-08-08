export type AppointmentStatus = 'confirmed' | 'pending' | 'canceled';

export interface AppointmentSummary {
  readonly id: number;
  readonly patientName: string;
  readonly doctorName: string;
  /** ISO-8601 start timestamp. */
  readonly startsAt: string;
  readonly procedure: string;
  readonly status: AppointmentStatus;
}

export interface PatientSummary {
  readonly id: number;
  readonly name: string;
  /** ISO-8601 date of the most recent visit, or null for a brand new patient. */
  readonly lastVisit: string | null;
  readonly phone: string | null;
}

export interface DashboardMetrics {
  readonly appointmentsToday: number;
  readonly newPatientsThisMonth: number;
  readonly revenueThisMonth: number;
  /** Share of booked chair time, 0–1. */
  readonly chairOccupancy: number;
}

export interface DashboardData {
  readonly metrics: DashboardMetrics;
  readonly appointments: readonly AppointmentSummary[];
  readonly patients: readonly PatientSummary[];
  /** True when the data came from the in-memory demo backend. */
  readonly isDemoData: boolean;
}

/** Envelope every legacy `*.query()` endpoint returns. */
export interface Paginated<T> {
  readonly rows: readonly T[];
  readonly count: number;
}
