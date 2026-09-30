import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { injectLocale, injectPlural, injectT } from '../../../core/i18n/translate';
import type { MessageKey } from '../../../core/i18n/messages.en';
import { injectRelativeDay } from '../../../shared/format/relative-day';
import { Alert } from '../../../shared/ui/alert/alert';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { Badge } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FilterPanel } from '../../../shared/ui/filter-panel/filter-panel';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { PatientRecord, PatientSearchField, PatientsQuery } from '../patients.models';
import { PatientsService } from '../patients.service';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const SEARCH_FIELDS: readonly {
  readonly value: PatientSearchField;
  readonly labelKey: MessageKey;
}[] = [
  { value: 'first_name', labelKey: 'patients.field.name' },
  { value: 'phone_number', labelKey: 'patients.field.phone' },
  { value: 'email', labelKey: 'patients.field.email' },
];

@Component({
  selector: 'app-patients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    PageHeader,
    Alert,
    Avatar,
    Badge,
    EmptyState,
    FilterPanel,
    Pagination,
    Spinner,
  ],
  templateUrl: './patients.html',
})
export class Patients {
  private readonly patients = inject(PatientsService);

  /**
   * Bound from `?search=` by `withComponentInputBinding()`, so the command
   * palette can hand a term straight to this screen.
   */
  readonly search = input('');

  protected readonly t = injectT();
  protected readonly plural = injectPlural();
  protected readonly locale = injectLocale();
  protected readonly relativeDay = injectRelativeDay();

  protected readonly searchFields = SEARCH_FIELDS;
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly field = signal<PatientSearchField>('first_name');

  /** Debounced so typing doesn't fire a request per keystroke. */
  private readonly term = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      map((value) => value.trim()),
      distinctUntilChanged(),
      startWith(''),
    ),
    { initialValue: '' },
  );

  /** Any change to the filter drops us back to the first page. */
  protected readonly page = linkedSignal<string, number>({
    source: () => `${this.field()}:${this.term()}:${this.pageSize()}`,
    computation: () => 1,
  });

  private readonly query = computed<PatientsQuery>(() => ({
    search: this.term(),
    field: this.field(),
    page: this.page(),
    pageSize: this.pageSize(),
  }));

  protected readonly result = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.patients.list(params),
  });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() => (this.result.hasValue() ? this.result.value() : null));

  protected readonly rows = computed(() => this.loaded()?.rows ?? []);
  protected readonly total = computed(() => this.loaded()?.total ?? 0);
  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);
  protected readonly hasSearch = computed(() => this.term().length > 0);

  protected readonly activeFilterCount = computed(
    () => (this.term() ? 1 : 0) + (this.field() === 'first_name' ? 0 : 1),
  );

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? this.t('patients.error') : null;
  });

  constructor() {
    // Adopt an inbound `?search=` without fighting the user's later edits.
    effect(() => {
      const incoming = this.search();
      if (incoming && incoming !== this.searchControl.value) {
        this.searchControl.setValue(incoming);
      }
    });
  }

  protected selectField(value: string): void {
    this.field.set(value as PatientSearchField);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
  }

  protected resetFilters(): void {
    this.field.set('first_name');
    this.searchControl.setValue('');
  }

  protected region(patient: PatientRecord): string {
    const place = [patient.city, patient.state].filter(Boolean).join(' – ');
    return [patient.neighborhood, place].filter(Boolean).join(' · ') || '—';
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
