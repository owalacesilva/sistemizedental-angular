import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { addDays, isToday, startOfDay, toIsoDate } from '../../../shared/format/dates';
import { Alert } from '../../../shared/ui/alert/alert';
import { Badge, type BadgeTone } from '../../../shared/ui/badge/badge';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { eachDay, minutesSinceMidnight, startOfWeek } from '../calendar.dates';
import type {
  CalendarView,
  ScheduleEvent,
  ScheduleQuery,
  ScheduleStatus,
} from '../calendar.models';
import { CalendarService } from '../calendar.service';

/** Visible window of the day, and the pixel height one hour occupies (`h-14`). */
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 20;
const HOUR_HEIGHT = 56;
const MIN_BLOCK_HEIGHT = 22;

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  created: 'Scheduled',
  confirmed: 'Confirmed',
  arrived: 'Arrived',
  finished: 'Finished',
  missed: 'No-show',
  canceled: 'Canceled',
};

const STATUS_BLOCKS: Record<ScheduleStatus, string> = {
  created: 'border-brand-400 bg-brand-50 text-brand-900',
  confirmed: 'border-emerald-400 bg-emerald-50 text-emerald-900',
  arrived: 'border-brand-600 bg-brand-100 text-brand-900',
  finished: 'border-slate-300 bg-slate-100 text-slate-600',
  missed: 'border-amber-400 bg-amber-50 text-amber-900',
  canceled: 'border-rose-300 bg-rose-50 text-rose-700',
};

const STATUS_TONES: Record<ScheduleStatus, BadgeTone> = {
  created: 'info',
  confirmed: 'success',
  arrived: 'info',
  finished: 'neutral',
  missed: 'warning',
  canceled: 'danger',
};

interface EventBlock {
  readonly event: ScheduleEvent;
  readonly top: number;
  readonly height: number;
  /** Horizontal slice, as percentages, so overlapping appointments sit side by side. */
  readonly left: number;
  readonly width: number;
}

interface DayColumn {
  readonly iso: string;
  readonly weekday: string;
  readonly dayNumber: string;
  readonly today: boolean;
  readonly blocks: readonly EventBlock[];
}

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Alert, Badge, Spinner],
  templateUrl: './calendar.html',
})
export class Calendar {
  private readonly calendar = inject(CalendarService);

  protected readonly hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, index) => DAY_START_HOUR + index,
  );

  protected readonly view = signal<CalendarView>('week');
  protected readonly anchor = signal(startOfDay(new Date()));
  protected readonly doctorId = signal<number | null>(null);

  protected readonly range = computed<ScheduleQuery>(() => {
    const anchor = this.anchor();

    if (this.view() === 'day') {
      const iso = toIsoDate(anchor);
      return { start: iso, end: iso };
    }

    const monday = startOfWeek(anchor);
    return { start: toIsoDate(monday), end: toIsoDate(addDays(monday, 6)) };
  });

  protected readonly schedule = rxResource({
    params: () => this.range(),
    stream: ({ params }) => this.calendar.load(params),
  });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() =>
    this.schedule.hasValue() ? this.schedule.value() : null,
  );

  protected readonly doctors = computed(() => this.loaded()?.doctors ?? []);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);

  protected readonly errorMessage = computed(() => {
    const error = this.schedule.error();
    return error instanceof Error ? error.message : error ? 'Could not load the agenda.' : null;
  });

  /** Doctor filtering is client-side: the whole window is already in memory. */
  protected readonly events = computed(() => {
    const events = this.loaded()?.events ?? [];
    const doctorId = this.doctorId();
    return doctorId === null ? events : events.filter((event) => event.doctorId === doctorId);
  });

  protected readonly days = computed<DayColumn[]>(() => {
    const { start, end } = this.range();
    const events = this.events();

    return eachDay(start, end).map((date) => {
      const iso = toIsoDate(date);

      return {
        iso,
        weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
        dayNumber: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        today: isToday(date),
        blocks: layOut(events.filter((event) => fallsOn(event.startsAt, iso))),
      };
    });
  });

  protected readonly rangeLabel = computed(() => {
    const { start, end } = this.range();

    if (this.view() === 'day') {
      return this.anchor().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    const first = new Date(`${start}T00:00:00`);
    const last = new Date(`${end}T00:00:00`);
    const sameMonth = first.getMonth() === last.getMonth();

    return `${first.toLocaleDateString(undefined, {
      day: 'numeric',
      ...(sameMonth ? {} : { month: 'short' }),
    })} – ${last.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  });

  protected readonly counts = computed(() => {
    const events = this.events();
    return {
      total: events.length,
      confirmed: events.filter((event) => event.status === 'confirmed').length,
      pending: events.filter((event) => event.status === 'created').length,
      canceled: events.filter((event) => event.status === 'canceled' || event.status === 'missed')
        .length,
    };
  });

  protected readonly gridHeight = HOUR_HEIGHT * (DAY_END_HOUR - DAY_START_HOUR);

  protected setView(view: CalendarView): void {
    this.view.set(view);
  }

  protected shift(direction: -1 | 1): void {
    this.anchor.update((date) => addDays(date, direction * (this.view() === 'day' ? 1 : 7)));
  }

  protected goToToday(): void {
    this.anchor.set(startOfDay(new Date()));
  }

  protected selectDoctor(value: string): void {
    this.doctorId.set(value ? Number(value) : null);
  }

  protected hourLabel(hour: number): string {
    return `${`${hour}`.padStart(2, '0')}:00`;
  }

  protected time(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  protected statusLabel(status: ScheduleStatus): string {
    return STATUS_LABELS[status];
  }

  protected blockClass(status: ScheduleStatus): string {
    return STATUS_BLOCKS[status];
  }

  protected statusTone(status: ScheduleStatus): BadgeTone {
    return STATUS_TONES[status];
  }

  protected reload(): void {
    this.schedule.reload();
  }
}

/** The timestamp is UTC; the column is a local calendar day. Compare in local time. */
function fallsOn(timestamp: string, dayIso: string): boolean {
  return toIsoDate(new Date(timestamp)) === dayIso;
}

/**
 * Positions a day's appointments. Overlapping ones are packed into lanes so none
 * hides another; the day's widest overlap sets the column count.
 */
function layOut(events: readonly ScheduleEvent[]): EventBlock[] {
  const sorted = [...events].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const laneEnds: number[] = [];

  const placed = sorted.map((event) => {
    const start = clamp(minutesSinceMidnight(event.startsAt));
    const end = Math.max(start + 15, clamp(minutesSinceMidnight(event.endsAt)));

    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
    }
    laneEnds[lane] = end;

    return { event, start, end, lane };
  });

  const lanes = Math.max(1, laneEnds.length);

  return placed.map(({ event, start, end, lane }) => ({
    event,
    top: ((start - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT,
    height: Math.max(MIN_BLOCK_HEIGHT, ((end - start) / 60) * HOUR_HEIGHT - 2),
    left: (lane / lanes) * 100,
    width: (1 / lanes) * 100,
  }));
}

function clamp(minutes: number): number {
  return Math.min(Math.max(minutes, DAY_START_HOUR * 60), DAY_END_HOUR * 60);
}
