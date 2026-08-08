import { environment } from '../../../environments/environment';

/**
 * Joins a relative API path onto `environment.apiUrl`, tolerating a missing or
 * duplicated slash on either side. Absolute URLs are returned untouched.
 */
export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = environment.apiUrl.endsWith('/') ? environment.apiUrl : `${environment.apiUrl}/`;
  return `${base}${path.replace(/^\//, '')}`;
}
