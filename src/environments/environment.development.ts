import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  appName: 'Sistemize Dental',
  /** Legacy dev backend (see legacy/webpack-dev.config.js). */
  apiUrl: 'http://localhost:7000/',
  allowDemoFallback: true,
  demoCredentials: {
    email: 'demo@sistemizedental.com',
    password: 'sis12345',
  },
};
