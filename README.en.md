<div align="right">
  <a href="./README.md">
    <img
      alt="Español"
      src="https://img.shields.io/badge/Idioma-Espa%C3%B1ol-0b7a4b?style=for-the-badge"
    />
  </a>
  <a href="./README.en.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
</div>

# Management Tickets Frontend

Angular SPA for the **Management Tickets** system. This repository contains the product frontend: authentication, dashboard, ticket workflow, notifications, profile, and administration modules with permission-aware navigation.

## Overview

- Angular 21 with standalone components and route-level lazy loading.
- Local state handled with **Signals** and async orchestration handled with **RxJS**.
- UI built with **PrimeNG**, **PrimeIcons**, and **Bootstrap 5**.
- Authentication based on in-memory access token and HttpOnly refresh cookie.
- Feature-oriented guards, interceptors, and stores.
- **Vitest** test suite organized by module.

## Functional scope

The frontend currently includes:

- Sign-in and automatic session restore.
- Light and dark theme toggle persisted in `localStorage`.
- Dashboard with operational summary and recent activity.
- Ticket list with filters, sorting, pagination, and detail navigation.
- Ticket creation.
- Ticket detail view with:
  - summary data,
  - comments,
  - history,
  - assignment or reassignment,
  - workflow actions such as start, request information, resolve, and close.
- Notifications with single and bulk mark-as-read actions.
- Authenticated user profile.
- User administration.
- Category administration.
- SLA policy administration.
- System pages for forbidden access and not found.

## Main stack

- Angular `21`
- TypeScript `5.9`
- RxJS `7.8`
- PrimeNG `21`
- Bootstrap `5.3`
- Vitest `4`
- Playwright `1.61`
- ESLint `10`
- Prettier `3`

## Architecture

The application is organized around lightweight layers and feature boundaries:

- `core`
  - authentication and authorization,
  - runtime configuration,
  - HTTP interceptors,
  - main layout,
  - global theme.
- `shared`
  - models,
  - constants,
  - reusable utilities.
- `features`
  - `auth`
  - `dashboard`
  - `tickets`
  - `notifications`
  - `profile`
  - `administration`
  - `system`

Patterns used in the codebase:

- **Standalone components** across the app.
- **Route-level lazy loading** for module isolation.
- **Signals-based stores** as feature facades.
- **RxJS** for HTTP, refresh flows, mutations, search, and synchronization.
- **Guards** for authenticated, guest, and permission-based routes.
- **Interceptors** for correlation id, uniform error normalization, and session refresh.
- **Zoneless change detection** configured in `app.config.ts`.

## Navigation and access control

Main routes:

- `/login`
- `/dashboard`
- `/tickets`
- `/tickets/new`
- `/tickets/:ticketId`
- `/notifications`
- `/profile`
- `/admin/users`
- `/admin/categories`
- `/admin/sla`
- `/forbidden`

Sidebar navigation is permission-driven instead of being hardcoded to role labels:

- `USER_READ` shows **Users**.
- Any permission among `CATEGORY_CREATE`, `CATEGORY_UPDATE`, or `CATEGORY_DISABLE` shows **Categories**.
- `SLA_READ` shows **SLA**.

Important note:

- The frontend only hides or shows options as a UX layer.
- The backend must remain the source of truth for authorization.

## Security and backend communication

- `authGuard`, `guestGuard`, and `permissionGuard` protect navigation.
- `authInterceptor` adds `Authorization: Bearer ...` and restores the session when possible.
- `correlationIdInterceptor` adds `X-Correlation-Id` to each request.
- `errorInterceptor` normalizes backend and network failures to the `ProblemDetails` contract.
- The frontend expects a backend exposed under `/api/v1`.

Contract notes:

- Mutable resources use `version` for optimistic locking.
- Ticket creation requires `Idempotency-Key` on the backend.
- Errors follow `ProblemDetails` with `code`, `correlationId`, `timestamp`, and `fieldErrors`.

## Environment configuration

Available files:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/environments/environment.production.ts`

Current main value:

```ts
apiBaseUrl: 'http://localhost:8080/api/v1';
```

If the backend runs on another host or port, update `apiBaseUrl` in the corresponding environment file.

## Project structure

```text
src/
  app/
    core/
    features/
      administration/
      auth/
      dashboard/
      notifications/
      profile/
      system/
      tickets/
    shared/
    tests/
  environments/
docs/
  decisions/
README.md
README.en.md
```

Common internal feature layout:

```text
feature/
  pages/
  components/
  services/
  stores/
  tests/
    units/
    integrations/
    e2e/
```

## Requirements

- Node.js version compatible with Angular 21.
- npm as package manager.
- The `Management Tickets` backend running and reachable from the frontend.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Make sure the backend is available at `http://localhost:8080/api/v1`.

3. Start the development server:

```bash
npm start
```

4. Open the app at:

```text
http://localhost:4200
```

## Available scripts

```bash
npm start
npm run build
npm run watch
npm test
npm run test:e2e
npm run test:e2e:headed
npm run validate
npm run format
npm run format:check
npm run lint
npm run typecheck
```

Quick description:

- `npm start`: runs the Angular dev server.
- `npm run build`: creates the production build.
- `npm run watch`: rebuilds continuously in development mode.
- `npm test`: runs the Vitest suite through the Angular builder.
- `npm run test:e2e`: runs end-to-end tests with Playwright on Chromium.
- `npm run test:e2e:headed`: runs e2e tests with a visible browser.
- `npm run validate`: runs format check, lint, typecheck, Vitest tests, and e2e tests.
- `npm run format`: applies Prettier formatting.
- `npm run format:check`: checks formatting.
- `npm run lint`: runs ESLint.
- `npm run typecheck`: validates TypeScript for the app, specs, and e2e tests.

## Quality and testing

Current quality strategy includes:

- linting with ESLint,
- formatting with Prettier,
- strict type checking,
- unit and integration testing with Vitest,
- end-to-end testing with Playwright.

Recommended commands:

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test -- --watch=false
npm run test:e2e
npm run validate
```

Test organization:

- `tests/units`: stores, guards, interceptors, and helpers.
- `tests/integrations`: components and pages with mocked dependencies.
- `tests/e2e`: real end-to-end scenarios organized by module.

Current e2e status:

- Playwright is already configured in this repository.
- The current suite covers e2e scenarios for authentication, authorization, tickets, and notifications.

## Repository documentation

Main documents:

- [Architecture](./docs/architecture.md)
- [API contract](./docs/api-contract.md)
- [Domain model](./docs/domain-model.md)
- [Testing strategy](./docs/testing-strategy.md)
- [Implementation plan](./docs/implementation-plan.md)
- [Implementation progress](./docs/implementation-progress.md)

Decision records:

- [001 - Clean architecture](./docs/decisions/001-clean-architecture.md)
- [002 - Authentication strategy](./docs/decisions/002-authentication-strategy.md)
- [003 - Angular state management](./docs/decisions/003-angular-state-management.md)
- [004 - Ticket workflow](./docs/decisions/004-ticket-workflow.md)

## Backend integration

This repository only contains the frontend. The full solution described in the documentation also includes a separate backend called `tickets-backend`, responsible for:

- business rules,
- authentication,
- persistence,
- notifications,
- dashboard,
- SLA,
- audit history.

## Current status

The project already includes:

- the main functional modules,
- permission-aware navigation,
- paginated list views,
- light and dark theme support,
- consistent error handling,
- a test suite organized by module,
- a real Playwright e2e base ready to execute,
- baseline technical documentation under `docs/`.

## Suggested next improvements

- Add automated coverage reporting in CI.
- Publish sample users and permission matrices for demo environments.
- Add screenshots or GIFs for the main flow.
