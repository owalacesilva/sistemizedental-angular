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
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { relativeDay } from '../../../shared/format/dates';
import { Alert } from '../../../shared/ui/alert/alert';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { Badge } from '../../../shared/ui/badge/badge';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import type { PatientRecord, PatientSearchField, PatientsQuery } from '../patients.models';
import { PatientsService } from '../patients.service';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const SEARCH_FIELDS: readonly { readonly value: PatientSearchField; readonly label: string }[] = [
  { value: 'first_name', label: 'Name' },
  { value: 'phone_number', label: 'Phone' },
  { value: 'email', label: 'Email' },
];

@Component({
  selector: 'app-patients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    PageHeader,
    Alert,
    Avatar,
    Badge,
    EmptyState,
    Pagination,
    Spinner,
  ],
  templateUrl: './patients.html',
})
export class Patients {
  private readonly patients = inject(PatientsService);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly searchFields = SEARCH_FIELDS;
  protected readonly relativeDay = relativeDay;

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly field = signal<PatientSearchField>('first_name');

  /** Debounced so typing doesn't fire a request per keystroke. */
  private readonly search = toSignal(
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
    source: () => `${this.field()}:${this.search()}`,
    computation: () => 1,
  });

  private readonly query = computed<PatientsQuery>(() => ({
    search: this.search(),
    field: this.field(),
    page: this.page(),
    pageSize: PAGE_SIZE,
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
  protected readonly hasSearch = computed(() => this.search().length > 0);

  protected readonly errorMessage = computed(() => {
    const error = this.result.error();
    return error instanceof Error ? error.message : error ? 'Could not load patients.' : null;
  });

  protected selectField(value: string): void {
    this.field.set(value as PatientSearchField);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
  }

  protected region(patient: PatientRecord): string {
    const place = [patient.city, patient.state].filter(Boolean).join(' – ');
    return [patient.neighborhood, place].filter(Boolean).join(' · ') || '—';
  }

  protected goToPage(page: number): void {
    this.page.set(page);
  }

  protected reload(): void {
    this.result.reload();
  }
}
