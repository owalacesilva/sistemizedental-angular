import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { injectT } from '../../../core/i18n/translate';
import { Alert } from '../../../shared/ui/alert/alert';
import { FieldError } from '../../../shared/ui/field-error/field-error';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { AuthLayout } from '../auth-layout/auth-layout';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, Alert, FieldError, Spinner],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly t = injectT();
  protected readonly demoCredentials = environment.demoCredentials;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true],
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly passwordVisible = signal(false);

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected fillDemoCredentials(): void {
    const demo = this.demoCredentials;
    if (demo) {
      this.form.patchValue({ email: demo.email, password: demo.password });
    }
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

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl(this.returnUrl());
      },
      error: (error: Error) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  /** Honours `?returnUrl=` set by the auth guard, defaulting to the dashboard. */
  private returnUrl(): string {
    const requested = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
    return typeof requested === 'string' && requested.startsWith('/') ? requested : '/dashboard';
  }
}
