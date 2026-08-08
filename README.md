# Sistemize Dental

Practice management for modern dental clinics — rebuilt on **Angular 22** with standalone
components, Signals, zoneless change detection, and **Tailwind CSS v4**.

The previous AngularJS 1.x application is preserved under [`legacy/`](./legacy) while its
screens are ported. It is excluded from the build, lint, format, and Docker context.

## Requirements

- **Node 22+** (`.nvmrc` pins the major — `nvm use`)
- npm 10+
- Docker + Compose (optional, for the containerised workflows)

## Getting started

```bash
nvm use
npm install
npm start          # http://localhost:4200
```

The dev build points at `http://localhost:7000/` (the legacy API) and enables **demo
mode**: if the API is unreachable, an in-memory backend takes over so login, sign-up, and
the dashboard stay explorable. Sign in with `demo@sistemizedental.com` / `sis12345`, or
hit _Fill demo credentials_ on the login screen.

## Scripts

| Command               | What it does                                      |
| --------------------- | ------------------------------------------------- |
| `npm start`           | Dev server on :4200                               |
| `npm run build`       | Production build → `dist/sistemizedental/browser` |
| `npm test`            | Vitest, watch mode                                |
| `npm run test:ci`     | Single run with coverage                          |
| `npm run lint`        | ESLint (angular-eslint), TS + templates           |
| `npm run lint:fix`    | ESLint with autofix                               |
| `npm run format`      | Prettier (incl. Tailwind class sorting)           |
| `npm run docker:dev`  | Compose dev stack on :4200                        |
| `npm run docker:prod` | Production nginx image on :8080                   |

## Docker

```bash
docker compose up --build                      # dev server, hot reload, :4200
docker compose --profile prod up --build       # nginx production image, :8080
docker compose --profile ci run --rm ci        # lint + tests
```

The `Dockerfile` is multi-stage: `deps` → `development` | `build` → `production`. The
production stage serves the static bundle from `nginx:1.27-alpine` as an unprivileged
user, with SPA fallback, immutable caching on hashed assets, `no-store` on `index.html`,
gzip, security headers, and a `/healthz` probe. Final image ≈ 49 MB.

## Project structure

```
src/
├── app/
│   ├── core/                  app-wide singletons (no UI)
│   │   ├── api/               URL joining, error normalisation
│   │   └── auth/              service, guards, interceptor, storage, models
│   ├── shared/                reusable, feature-agnostic
│   │   ├── forms/             validators + validation messages
│   │   └── ui/                alert, avatar, field-error, logo, spinner
│   ├── layout/                authenticated shell (sidebar, topbar) + nav
│   ├── features/
│   │   ├── auth/              auth-layout, login, sign-up
│   │   ├── dashboard/         routes, service, models, page + stat-card
│   │   └── not-found/
│   ├── app.config.ts          providers (router, http, interceptors)
│   └── app.routes.ts          top-level routes
├── environments/              production / development + shared model
└── styles.css                 Tailwind import + brand design tokens
```

Feature-first, not type-first: a feature owns its routes, pages, components, models, and
data access, so it can be moved or deleted in one piece.

## Design tokens

The brand ramp in `src/styles.css` is built around the project palette:

| Token       | Hex       | Role                |
| ----------- | --------- | ------------------- |
| `brand-50`  | `#caf0f8` | Surfaces            |
| `brand-200` | `#90e0ef` | Borders, accents    |
| `brand-400` | `#00b4d8` | Accent, focus rings |
| `brand-600` | `#0077b6` | Primary actions     |
| `brand-900` | `#03045e` | Headings, sidebar   |

Intermediate steps (`100`, `300`, `500`, `700`, `800`, `950`) fill out the scale. Use the
tokens — never a raw hex in a template.

## Auth

`AuthService` talks to the legacy REST API:

- `GET api/accounts/token.json` with an `Authorization: Basic <base64>` header → login
- `POST api/accounts.json` → sign-up

The token is persisted under the legacy `acc_token` / `acc_data` localStorage keys, so
existing sessions carry over. `authInterceptor` attaches it to subsequent calls and signs
the user out on a 401. `authGuard` protects the shell; `guestGuard` keeps signed-in users
off the login and sign-up screens.

Demo fallback only engages when the API is _unreachable_ (status 0/502/503/504) and
`environment.allowDemoFallback` is on. A genuine rejection is always surfaced to the user.

## Quality gates

Husky runs:

- **pre-commit** — `lint-staged`: ESLint + Prettier on staged files
- **pre-push** — `npm run lint` and `npm run test:ci`

Bypass with `--no-verify` when you must.

## Deployment

Firebase Hosting is configured against `dist/sistemizedental/browser`:

```bash
npm run build
firebase deploy
```
