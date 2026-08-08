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

import { Alert } from '../../../shared/ui/alert/alert';
import { FieldError } from '../../../shared/ui/field-error/field-error';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { SettingsService } from '../settings.service';

const ABOUT_MAX_LENGTH = 255;

/** The timezones a Brazilian clinic realistically runs on. */
const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (UTC−03:00)' },
  { value: 'America/Manaus', label: 'Manaus (UTC−04:00)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (UTC−05:00)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC−02:00)' },
] as const;

@Component({
  selector: 'app-settings-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Alert, FieldError, Spinner],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly settings = inject(SettingsService);

  protected readonly timezones = TIMEZONES;
  protected readonly aboutMaxLength = ABOUT_MAX_LENGTH;

  protected readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    shortAbout: ['', [Validators.maxLength(ABOUT_MAX_LENGTH)]],
    about: ['', [Validators.maxLength(ABOUT_MAX_LENGTH)]],
    timezone: [TIMEZONES[0].value as string, [Validators.required]],
    searchable: [true],
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
    return error instanceof Error ? error.message : error ? 'Could not load the clinic.' : null;
  });

  constructor() {
    // Fill the form once the account record lands, and again after an explicit reload.
    effect(() => {
      const settings = this.loaded();
      if (settings) {
        this.form.reset(settings.profile);
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

    this.settings.saveProfile(this.form.getRawValue()).subscribe({
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
