import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Attaches the stored account token to API calls and signs the user out on a 401.
 * Mirrors the legacy `HttpInterceptorFactory`: the raw token is sent as the
 * `Authorization` value, and requests that already carry one are left alone.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token();
  const authorized =
    token && !req.headers.has('Authorization')
      ? req.clone({ setHeaders: { Authorization: token } })
      : req;

  return next(authorized).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.isAuthenticated()) {
        auth.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
