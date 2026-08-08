import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  appName: 'Sistemize Dental',
  /** Same-origin API in production (matches the legacy `API_SERVER=/` build). */
  apiUrl: '/',
  /**
   * When the API is unreachable the app falls back to an in-memory demo backend
   * so the UI stays explorable. Disabled in production.
   */
  allowDemoFallback: false,
  demoCredentials: null,
};
