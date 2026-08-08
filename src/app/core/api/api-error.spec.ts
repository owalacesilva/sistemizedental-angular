import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { errorMessageFrom } from './api-error';

function httpError(status: number, error: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}

describe('errorMessageFrom', () => {
  it('joins the array form of the API error payload', () => {
    const message = errorMessageFrom(httpError(422, { errors: ['Email is taken.', 'Try again.'] }));
    expect(message).toBe('Email is taken. Try again.');
  });

  it('passes through the string form of the payload', () => {
    expect(errorMessageFrom(httpError(422, { errors: 'Password too short.' }))).toBe(
      'Password too short.',
    );
  });

  it('reports a connection problem when the request never reached the server', () => {
    expect(errorMessageFrom(httpError(0, null))).toMatch(/could not reach/i);
  });

  it('falls back to a credentials message on 401 with no payload', () => {
    expect(errorMessageFrom(httpError(401, null))).toBe('Invalid email or password.');
  });

  it('includes the status code when nothing else is known', () => {
    expect(errorMessageFrom(httpError(500, null))).toContain('500');
  });

  it('handles plain Errors', () => {
    expect(errorMessageFrom(new Error('boom'))).toBe('boom');
  });
});
