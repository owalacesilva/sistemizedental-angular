import { HttpErrorResponse } from '@angular/common/http';
import { type OperatorFunction, catchError, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { errorMessageFrom } from './api-error';

/** Status codes that mean "the API never answered", not "the API said no". */
const UNREACHABLE_STATUSES = new Set([0, 502, 503, 504]);

export function isUnreachable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && UNREACHABLE_STATUSES.has(error.status);
}

/**
 * Swaps in sample data when the API is unreachable and demo mode is on, so the
 * ported screens stay explorable without the legacy backend running.
 *
 * A real rejection (401, 422, 500, …) is always surfaced — the service said no,
 * and pretending otherwise would hide a genuine failure.
 */
export function withDemoFallback<T>(fallback: () => T): OperatorFunction<T, T> {
  return (source) =>
    source.pipe(
      catchError((error: unknown) => {
        if (environment.allowDemoFallback && isUnreachable(error)) {
          return of(fallback());
        }

        return throwError(() => new Error(errorMessageFrom(error)));
      }),
    );
}
