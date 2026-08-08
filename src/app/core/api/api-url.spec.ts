import { describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { apiUrl } from './api-url';

describe('apiUrl', () => {
  it('joins a relative path onto the configured base', () => {
    expect(apiUrl('api/accounts/token.json')).toBe(
      `${environment.apiUrl}api/accounts/token.json`.replace(/([^:])\/\//g, '$1/'),
    );
  });

  it('tolerates a leading slash on the path', () => {
    expect(apiUrl('/api/patients.json')).toBe(apiUrl('api/patients.json'));
  });

  it('leaves absolute URLs untouched', () => {
    expect(apiUrl('https://api.example.com/v1/ping')).toBe('https://api.example.com/v1/ping');
  });
});
