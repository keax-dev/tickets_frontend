# Management Tickets Architecture

## System Overview

Management Tickets is implemented as a modular monolith:

- `tickets-backend`: REST API, business rules, persistence, authentication, scheduled processes
- `tickets-frontend`: Angular SPA with role-aware navigation and feature-based state

## Backend Architecture

The backend follows pragmatic Clean Architecture by business module:

- `identity`
- `category`
- `sla`
- `ticket`
- `notification`
- `dashboard`
- `shared`
- `bootstrap`

Each module uses:

- `domain`
  - Entities, value objects, domain services, policies, repository contracts
- `application`
  - Commands, queries, DTOs, input ports, output ports, use cases
- `infrastructure`
  - Web adapters, persistence adapters, security adapters, file adapters, configuration

Dependency direction:

- `domain` depends on nothing external
- `application` depends on `domain`
- `infrastructure` depends on `application` and `domain`
- `bootstrap` wires the application

## Frontend Architecture

The frontend uses standalone Angular with lazy-loaded features and route-level boundaries:

- `core`
  - Authentication
  - Authorization
  - Configuration
  - Error handling
  - HTTP interceptors
  - Layout
- `shared`
  - Reusable components
  - UI models
  - Validators
  - Utilities
- `features`
  - `auth`
  - `dashboard`
  - `tickets`
  - `notifications`
  - `profile`
  - `administration`

Feature state is implemented with Signals-based stores/facades. RxJS remains the transport and async orchestration layer for HTTP, search, refresh coordination, and cancellation.

## Security Model

- Short-lived access token in memory
- Rotating refresh token stored in HttpOnly cookie
- Permission checks enforced in backend use cases and endpoints
- Route and component restrictions in frontend as a UX layer only
- Optimistic locking for mutable resources
- Idempotency keys for ticket creation

## Persistence Strategy

- MySQL as primary runtime database
- Flyway for schema and local seed setup
- JPA entities isolated in infrastructure
- Explicit mappers between persistence, domain, and API DTOs

## Observability

- Structured logging with correlation id
- Spring Boot Actuator with restricted exposure
- Health endpoints for local and container environments

## Planned Integrations

- Local file storage via a dedicated output port
- OpenAPI for API discoverability
- Docker Compose for local orchestration
