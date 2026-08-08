export interface DemoCredentials {
  readonly email: string;
  readonly password: string;
}

export interface AppEnvironment {
  readonly production: boolean;
  readonly appName: string;
  /** Base URL of the REST API. Must end with a slash. */
  readonly apiUrl: string;
  /** Serve an in-memory backend when the real API cannot be reached. */
  readonly allowDemoFallback: boolean;
  /** Pre-filled credentials shown on the login screen, when demo mode is on. */
  readonly demoCredentials: DemoCredentials | null;
}
