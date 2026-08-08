import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/auth/auth.service';
import { matchesControl } from '../../../shared/forms/validators';
import { Alert } from '../../../shared/ui/alert/alert';
import { FieldError } from '../../../shared/ui/field-error/field-error';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { SettingsService } from '../settings.service';

const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: 'app-settings-security',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Alert, FieldError, Spinner],
  templateUrl: './security.html',
})
export class Security {
  private readonly fb = inject(FormBuilder);
  private readonly settings = inject(SettingsService);
  private readonly auth = inject(AuthService);

  protected readonly minLength = MIN_PASSWORD_LENGTH;
  protected readonly account = this.auth.account;

  protected readonly form = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
    confirmPassword: ['', [Validators.required, matchesControl('newPassword')]],
  });

  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    // `matchesControl` lives on the confirm field, so editing the new password has
    // to ask that field to re-check itself.
    this.form.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
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

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.saving.set(true);

    this.settings.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.form.reset();
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
