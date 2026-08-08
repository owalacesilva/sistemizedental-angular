# Sistemize Dental — Angular

Angular 22 application using standalone components, Signals, and zoneless change
detection. Styled with Tailwind CSS v4. Unit tests run on Vitest.

The previous AngularJS 1.x application lives under `legacy/` for reference while its
screens are ported. It is excluded from the build, lint, format, and Docker context —
do not import from it.

## Project Structure

Feature-first, not type-first. Code is grouped by what it does, so a feature can be
deleted or moved in one piece.

- `src/app/core/` — app-wide singletons: `auth/` (service, guards, interceptor, storage,
  models), `api/` (URL joining, error normalisation). Injectable, no UI.
- `src/app/shared/` — reusable, feature-agnostic pieces: `ui/` (presentational
  components), `forms/` (validators, validation messages).
- `src/app/layout/` — the authenticated app shell (sidebar, topbar) and its navigation
  definition.
- `src/app/features/<feature>/` — a routed feature. Holds its own `*.routes.ts`,
  page components, feature-local `components/`, models, and data services.
- `src/environments/` — `environment.ts` (production) and `environment.development.ts`,
  swapped by the `fileReplacements` entry in `angular.json`. Both satisfy
  `AppEnvironment` in `environment.model.ts`.
- `legacy/` — the AngularJS 1.x app. Read-only.

Each feature and shared directory exposes a barrel `index.ts`.

## Code Style

- Standalone components only; no NgModules.
- `ChangeDetectionStrategy.OnPush` on every component.
- Signals for state: `signal()`, `computed()`, `input()`, `rxResource()`.
- Strict TypeScript. `type`-only imports where the symbol is only a type.
- Prettier (100 cols, single quotes) with `prettier-plugin-tailwindcss` for class order.

## Conventions

- `inject()` over constructor injection.
- Typed reactive forms via `fb.nonNullable.group({...})`.
- File naming follows the Angular 2025 style guide for components (`login.ts`,
  `login.html`) and a dot suffix for everything else (`auth.service.ts`, `auth.guard.ts`,
  `dashboard.models.ts`).
- Services are suffixed `Service` and prefixed with their domain (`AuthService`).
- Route-level code splitting with `loadComponent` / `loadChildren`; `@defer` for
  below-the-fold blocks.
- Colours come from the `--color-brand-*` tokens in `src/styles.css` — never hardcode a
  hex value in a template.

### `AbstractControl` is not signal-backed

`control.touched` / `control.errors` are plain properties. A `computed()` reading them
latches onto its first value and never updates. Use the control's `events` observable as
the reactive trigger — see `shared/ui/field-error/field-error.ts`.

### Cross-field validation

Put the validator on the _control_, not the group (`matchesControl` in
`shared/forms/validators.ts`). A group validator has to call `setErrors()` on a child,
which Angular overwrites on the child's next revalidation. The sibling must then trigger
a revalidation — see the constructor of `features/auth/sign-up/sign-up.ts`.

## Auth

`AuthService` calls the legacy REST API: `GET api/accounts/token.json` with a Basic
header for login, `POST api/accounts.json` for sign-up. The raw token is stored under the
legacy `acc_token` / `acc_data` localStorage keys and sent as the bare `Authorization`
value on later requests. A 401 clears the session and redirects to `/login`.

When `environment.allowDemoFallback` is true (development only) and the API is
_unreachable_ — status 0/502/503/504 — the in-memory `DemoAuthBackend` and
`demoDashboardData()` take over. A real rejection (401, 422, …) is always surfaced.

## Commands

- `npm start` — dev server on :4200
- `npm run build` — production build to `dist/sistemizedental/browser`
- `npm test` — Vitest in watch mode
- `npm run test:ci` — single run with coverage
- `npm run lint` / `npm run lint:fix` — ESLint (angular-eslint)
- `npm run format` — Prettier
- `npm run docker:dev` — compose dev stack on :4200
- `npm run docker:prod` — nginx image on :8080

Node 22+ is required (`.nvmrc`). Husky runs lint-staged pre-commit and
`lint` + `test:ci` pre-push.
