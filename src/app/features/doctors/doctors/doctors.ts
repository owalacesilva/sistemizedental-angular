import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { injectLocale, injectPlural, injectT } from '../../../core/i18n/translate';
import type { MessageKey } from '../../../core/i18n/messages.en';
import { paginate } from '../../../shared/collections/paginate';
import { Alert } from '../../../shared/ui/alert/alert';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { Badge } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FilterPanel } from '../../../shared/ui/filter-panel/filter-panel';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { DoctorFilter, DoctorRecord, Weekday } from '../doctors.models';
import { DoctorsService } from '../doctors.service';

const SEARCH_DEBOUNCE_MS = 200;
const DEFAULT_PAGE_SIZE = 12;
const PAGE_SIZES: readonly number[] = [12, 24, 48];

/** Sunday-first, so the index doubles as `Date.prototype.getDay()`. */
const WEEKDAYS: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

const FILTERS: readonly { readonly value: DoctorFilter; readonly labelKey: MessageKey }[] = [
  { value: 'all', labelKey: 'doctors.filter.all' },
  { value: 'active', labelKey: 'doctors.filter.active' },
  { value: 'blocked', labelKey: 'doctors.filter.blocked' },
];

@Component({
  selector: 'app-doctors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    PageHeader,
    Alert,
    Avatar,
    Badge,
    EmptyState,
    FilterPanel,
    Pagination,
    Spinner,
  ],
  templateUrl: './doctors.html',
})
export class Doctors {
  private readonly doctors = inject(DoctorsService);

  protected readonly t = injectT();
  protected readonly plural = injectPlural();
  protected readonly locale = injectLocale();

  protected readonly filters = FILTERS;
  protected readonly weekdays = WEEKDAYS;
  protected readonly pageSizes = PAGE_SIZES;

  protected readonly filter = signal<DoctorFilter>('all');
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);
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
    return error instanceof Error ? error.message : error ? this.t('doctors.error') : null;
  });

  /** The roster is small enough to filter in memory — no round trip per keystroke. */
  protected readonly matches = computed(() => {
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

  protected readonly total = computed(() => this.matches().length);

  /** Any change to the filter drops us back to the first page. */
  protected readonly page = linkedSignal<string, number>({
    source: () => `${this.filter()}:${this.search()}:${this.pageSize()}`,
    computation: () => 1,
  });

  private readonly slice = computed(() => paginate(this.matches(), this.page(), this.pageSize()));

  protected readonly rows = computed(() => this.slice().rows);

  protected readonly counts = computed(() => {
    const all = this.all();
    return {
      total: all.length,
      active: all.filter((doctor) => !doctor.blocked).length,
      blocked: all.filter((doctor) => doctor.blocked).length,
    };
  });

  protected readonly activeFilterCount = computed(
    () => (this.filter() === 'all' ? 0 : 1) + (this.search() ? 1 : 0),
  );

  protected setFilter(filter: DoctorFilter): void {
    this.filter.set(filter);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
  }

  protected resetFilters(): void {
    this.filter.set('all');
    this.searchControl.setValue('');
  }

  protected worksOn(doctor: DoctorRecord, day: number): boolean {
    return doctor.workingDays.includes(day as Weekday);
  }

  protected weekdayInitial(day: number): string {
    return this.t(`weekday.initial.${day}` as MessageKey);
  }

  protected weekdayTitle(doctor: DoctorRecord, day: number): string {
    const name = this.t(`weekday.${day}` as MessageKey);
    return this.worksOn(doctor, day)
      ? this.t('doctors.working', { day: name })
      : this.t('doctors.off', { day: name });
  }

  protected goToPage(page: number): void {
    this.page.set(page);
  }

  protected setPageSize(size: number): void {
    this.pageSize.set(size);
  }

  protected reload(): void {
    this.result.reload();
  }
}
