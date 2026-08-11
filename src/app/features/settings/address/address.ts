import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { injectT } from '../../../core/i18n/translate';
import { Alert } from '../../../shared/ui/alert/alert';
import { FieldError } from '../../../shared/ui/field-error/field-error';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { SettingsService } from '../settings.service';

/** `12345-678`, with the hyphen optional. */
const POSTAL_CODE_PATTERN = /^\d{5}-?\d{3}$/;

const STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

@Component({
  selector: 'app-settings-address',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Alert, FieldError, Spinner],
  templateUrl: './address.html',
})
export class Address {
  private readonly fb = inject(FormBuilder);
  private readonly settings = inject(SettingsService);

  protected readonly t = injectT();

  protected readonly states = STATES;

  protected readonly form = this.fb.nonNullable.group({
    postalCode: ['', [Validators.required, Validators.pattern(POSTAL_CODE_PATTERN)]],
    street: ['', [Validators.required]],
    number: [''],
    complement: [''],
    neighborhood: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
  });

  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly resource = rxResource({ stream: () => this.settings.load() });

  /** `value()` throws while the resource is in an error state — gate every read. */
  private readonly loaded = computed(() =>
    this.resource.hasValue() ? this.resource.value() : null,
  );

  protected readonly isDemoData = computed(() => this.loaded()?.isDemoData ?? false);

  protected readonly loadError = computed(() => {
    const error = this.resource.error();
    return error instanceof Error ? error.message : error ? this.t('settings.address.error') : null;
  });

  constructor() {
    effect(() => {
      const settings = this.loaded();
      if (settings) {
        this.form.reset(settings.address);
      }
    });
  }

  protected submit(): void {
    if (this.saving()) {
      return;
    }

    this.errorMessage.set(null);
    this.saved.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.settings.saveAddress(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.form.markAsPristine();
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
