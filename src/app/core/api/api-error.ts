import { HttpErrorResponse } from '@angular/common/http';

import type { ApiErrorBody } from '../auth/auth.models';

const OFFLINE_MESSAGE = 'Could not reach the service. Check your connection and try again.';

/**
 * Normalises the API's `{ errors: string | string[] }` payload — plus the browser's
 * network failures — into a single human-readable sentence.
 */
export function errorMessageFrom(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error && error.message ? error.message : 'Something went wrong.';
  }

  if (error.status === 0) {
    return OFFLINE_MESSAGE;
  }

  const body = error.error as ApiErrorBody | string | null;

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  const errors = typeof body === 'object' && body !== null ? body.errors : undefined;
  if (Array.isArray(errors) && errors.length) {
    return errors.join(' ');
  }
  if (typeof errors === 'string' && errors.trim()) {
    return errors;
  }

  if (error.status === 401) {
    return 'Invalid email or password.';
  }

  return `Request failed (${error.status}). Please try again.`;
}
