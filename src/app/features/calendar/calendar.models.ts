/** The statuses an appointment moves through in the legacy API. */
export type ScheduleStatus =
  'created' | 'confirmed' | 'arrived' | 'finished' | 'missed' | 'canceled';

export type CalendarView = 'day' | 'week';

export interface ScheduleDoctor {
  readonly id: number;
  readonly name: string;
}

export interface ScheduleEvent {
  readonly id: number;
  readonly patientName: string;
  readonly doctorId: number;
  readonly doctorName: string;
  readonly procedure: string;
  readonly status: ScheduleStatus;
  /** ISO-8601 local timestamps — the API sends the date and the clock separately. */
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface Schedule {
  readonly events: readonly ScheduleEvent[];
  readonly doctors: readonly ScheduleDoctor[];
  /** True when the data came from the in-memory demo backend. */
  readonly isDemoData: boolean;
}

/** Inclusive date window, both `YYYY-MM-DD`. */
export interface ScheduleQuery {
  readonly start: string;
  readonly end: string;
}
