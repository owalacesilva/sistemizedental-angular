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
  models), `api/` (URL joining, error normalisation, the `Paginated` envelope and
  `pageQuery` helper, demo fallback), `i18n/` (locales, dictionaries, translation
  service). Injectable, no UI.
- `src/app/shared/` — reusable, feature-agnostic pieces: `ui/` (presentational
  components), `forms/` (validators, validation messages), `format/` (date helpers),
  `collections/` (in-memory paging), `router/` (the current URL as a signal).
- `src/app/layout/` — the authenticated app shell: `sidebar/`, `topbar/`,
  `global-search/`, the `LayoutStore` holding chrome state, and the navigation
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

## Density

Spacing lives in the `@layer components` block of `src/styles.css`, not in the
templates: `.app-page`, `.app-card`, `.app-card-header`, `.app-table` (which styles its
own `th`/`td`), `.app-input`, `.app-label`, `.app-btn` + `.app-btn-primary` /
`.app-btn-quiet` / `.app-btn-icon`, `.app-segment` + `.app-chip`, and the
`.app-nav-*` sidebar classes. Reach for these before writing a utility string —
retuning the app's density should be a change to that one block.

## i18n

Runtime translation for **pt-BR and en-US only**, so switching language never reloads
the app. `core/i18n/messages.en.ts` is the reference dictionary and its keys are the
`MessageKey` union; `messages.pt.ts` is typed as a complete map of it, so an untranslated
message is a build error.

- `protected readonly t = injectT();` then `{{ t('patients.title') }}`.
- Counts go through `injectPlural()` and a `<base>.one` / `<base>.other` key pair.
- Placeholders are `{name}`, filled from the second argument.
- `t()` reads the locale signal, which is what makes a template re-render on a language
  switch. A pure pipe cannot: Angular caches it on its arguments and the key never
  changes.
- **Date, currency, number and percent pipes must be passed `locale()`** — from
  `injectLocale()` — as their locale argument. `LOCALE_ID` is seeded from the persisted
  choice at bootstrap and cannot change afterwards, so a pipe without it freezes at the
  language the app booted with.
- The same applies to `toLocaleDateString` / `toLocaleTimeString` calls in components.
- Visit labels come from `injectRelativeDay()`; validation messages take the translate
  function as an argument (`firstValidationMessage`).

## Auth

`AuthService` calls the legacy REST API: `GET api/accounts/token.json` with a Basic
header for login, `POST api/accounts.json` for sign-up. The raw token is stored under the
legacy `acc_token` / `acc_data` localStorage keys and sent as the bare `Authorization`
value on later requests. A 401 clears the session and redirects to `/login`.

When `environment.allowDemoFallback` is true (development only) and the API is
_unreachable_ — status 0/502/503/504 — the in-memory `DemoAuthBackend` and
`demoDashboardData()` take over. A real rejection (401, 422, …) is always surfaced.

Preferences the app persists alongside the session, all namespaced `app_*`:
`app_locale`, `app_sidebar`, `app_filters:<panel>`, `app_recent_searches`.

## Demo data

Every feature service pipes its request through `withDemoFallback()`
(`core/api/demo-fallback.ts`), which substitutes that feature's `demo-*.data.ts` on an
unreachable API. Each page then surfaces an info alert when the data it rendered is
sample data, so demo content is never mistaken for the clinic's own. `DashboardService`
predates the helper and still falls back on _any_ error. `InsightsService` has no demo
file of its own — it derives everything from `FinancialService` and `CalendarService`,
and inherits their fallback.

## Navigation

`layout/navigation.ts` is the single source of truth for the menu, including each
section's children. Sub-navigation is rendered by the sidebar, **not** as in-page tabs:
the sidebar has room to spare, a tab strip costs the content area a row, and collapsing
is something the sidebar can do and a tab bar cannot. `Financial` and `Settings` are
therefore shells that only render a page header — `findNavChild()` tells them which
sub-page they are showing.

`LayoutStore` keeps the two sidebar states apart on purpose: `sidebarCollapsed` (desktop
icon rail, persisted) and `sidebarDrawerOpen` (mobile overlay, never persisted). One flag
cannot mean both without the desktop layout jumping on every resize.

## Charts

`features/insights/` renders every chart from elements and one inline SVG sparkline — no
charting dependency. Rules the panels follow, and that new ones should:

- Categorical series use `--color-chart-1..4` in that fixed order, never cycled. The
  order is validated for colour-vision separation against the white card surface; slots 3
  and 4 fall below 3:1 contrast, so any chart using them ships visible value labels.
- Magnitude uses one hue light→dark from the brand ramp (`HEAT_STEPS`), with a scale
  legend. Never a value ramp on nominal categories.
- One axis, always. Two measures of different scale means two charts.
- Thin marks, a 2px surface gap between fills, solid hairline gridlines, a legend
  whenever there are two or more series, and selective direct labels — never a number on
  every point.

## Ported screens

`dashboard`, `insights`, `calendar`, `patients`, `doctors`, `financial` and `settings`
are live. `financial` (statement / transactions / payables / payment-methods) and
`settings` (profile / address / security) are shells with lazy child routes; their route
wiring is covered by `*.routes.spec.ts`. Record forms ("New patient", "Add doctor",
"New bill", …) are still on the legacy side, so those buttons render disabled with a
title saying so.

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
