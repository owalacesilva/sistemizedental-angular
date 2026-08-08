import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { Alert } from '../../../shared/ui/alert/alert';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { Badge } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { DoctorFilter, DoctorRecord, Weekday } from '../doctors.models';
import { DoctorsService } from '../doctors.service';

const SEARCH_DEBOUNCE_MS = 200;

/** Sunday-first, so the index doubles as `Date.prototype.getDay()`. */
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const FILTERS: readonly { readonly value: DoctorFilter; readonly label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
];

@Component({
  selector: 'app-doctors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ReactiveFormsModule, PageHeader, Alert, Avatar, Badge, EmptyState, Spinner],
  templateUrl: './doctors.html',
})
export class Doctors {
  private readonly doctors = inject(DoctorsService);

  protected readonly filters = FILTERS;
  protected readonly weekdays = WEEKDAY_INITIALS;

  protected readonly filter = signal<DoctorFilter>('all');
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  private readonly search = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      map((value) => value.trim().toLowerCase()),
      distinctUntilChanged(),
      startWith(''),
    ),
    { initialValue: '' },
  );

  protected readonly result = rxResource({ stream: () => this.doctors.list() });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly all = computed(() => this.loaded()?.rows ?? []);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);
  protected readonly hasSearch = computed(() => this.search().length > 0);

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? 'Could not load the team.' : null;
  });

  /** The roster is small enough to filter in memory — no round trip per keystroke. */
  protected readonly rows = computed(() => {
    const term = this.search();
    const filter = this.filter();

    return this.all().filter((doctor) => {
      if (filter === 'active' && doctor.blocked) {
        return false;
      }
      if (filter === 'blocked' && !doctor.blocked) {
        return false;
      }
      if (!term) {
        return true;
      }

      return `${doctor.name} ${doctor.email ?? ''} ${doctor.phone ?? ''}`
        .toLowerCase()
        .includes(term);
    });
  });

  protected readonly counts = computed(() => {
    const all = this.all();
    return {
      total: all.length,
      active: all.filter((doctor) => !doctor.blocked).length,
      blocked: all.filter((doctor) => doctor.blocked).length,
    };
  });

  protected setFilter(filter: DoctorFilter): void {
    this.filter.set(filter);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
  }

  protected worksOn(doctor: DoctorRecord, day: number): boolean {
    return doctor.workingDays.includes(day as Weekday);
  }

  protected weekdayName(day: number): string {
    return WEEKDAY_NAMES[day];
  }

  protected reload(): void {
    this.result.reload();
  }
}
