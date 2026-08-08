import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { matchesControl, mustAccept } from '../../../shared/forms/validators';
import { Alert } from '../../../shared/ui/alert/alert';
import { FieldError } from '../../../shared/ui/field-error/field-error';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { AuthLayout } from '../auth-layout/auth-layout';

/** Rules scored by the strength meter; all four are advisory except length. */
const STRENGTH_RULES = [
  { label: '8+ characters', test: (value: string) => value.length >= 8 },
  {
    label: 'Upper & lowercase',
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: 'A number', test: (value: string) => /\d/.test(value) },
  { label: 'A symbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'] as const;
const STRENGTH_BARS = [
  'bg-slate-200',
  'bg-rose-400',
  'bg-amber-400',
  'bg-brand-400',
  'bg-emerald-500',
] as const;

@Component({
  selector: 'app-sign-up',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, Alert, FieldError, Spinner],
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    clinicName: ['', [Validators.required, Validators.minLength(2)]],
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, matchesControl('password')]],
    acceptTerms: [false, [mustAccept]],
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly passwordVisible = signal(false);

  /** Mirrors the password control into a signal so the meter reacts to typing. */
  private readonly password = toSignal(this.form.controls.password.valueChanges, {
    initialValue: '',
  });

  protected readonly strengthChecks = computed(() => {
    const value = this.password();
    return STRENGTH_RULES.map(({ label, test }) => ({ label, passed: test(value) }));
  });

  protected readonly strengthScore = computed(
    () => this.strengthChecks().filter((check) => check.passed).length,
  );
  protected readonly strengthLabel = computed(() => STRENGTH_LABELS[this.strengthScore()]);
  protected readonly strengthBarClass = computed(() => STRENGTH_BARS[this.strengthScore()]);
  protected readonly strengthWidth = computed(() => `${(this.strengthScore() / 4) * 100}%`);

  constructor() {
    // `matchesControl` lives on the confirm field, so editing the password has to
    // ask that field to re-check itself.
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected submit(): void {
    if (this.submitting()) {
      return;
    }

    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { clinicName, displayName, email, password } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth.signUp({ clinicName, displayName, email, password }).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl('/dashboard');
      },
      error: (error: Error) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
