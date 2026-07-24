<div align="right">
  <a href="./implementation-plan.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./implementation-plan.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# Management Tickets Implementation Plan

## Scope

This repository pair contains the frontend (`tickets-frontend`) and backend (`tickets-backend`) for a modular monolith ticket management system. The implementation prioritizes a vertical MVP that is functional, testable, and extensible without introducing premature distributed complexity.

## Current Inspection Summary

- Frontend:
  - Angular `21.2.x`
  - Strict TypeScript enabled
  - Standalone application already initialized
  - No functional domain code yet
- Backend:
  - Spring Boot `4.1.0`
  - Java `21`
  - Maven wrapper present
  - Only bootstrap class and default properties exist
- Tooling:
  - Node `24.18.0`
  - npm `11.18.0`
  - Java `21.0.11`

## Delivery Strategy

The work is split into phases that preserve a working application at each step.

1. Foundation
   - Create shared technical documentation
   - Prepare backend modular structure
   - Prepare frontend feature-oriented structure
   - Add required dependencies only
2. Backend Core
   - Security, JWT, refresh token rotation, authenticated user access
   - Flyway migrations
   - Users, roles, permissions, categories, SLA policies
   - Ticket aggregate, history, notifications, idempotency
3. Frontend Core
   - PrimeNG integration and design tokens
   - Auth shell, guards, interceptors, app layout
   - Shared API layer and feature stores
4. Vertical Ticket Flow
   - Login and session restore
   - Ticket list, ticket creation, ticket detail
   - Assignment, progress, comments, resolution, close
   - Notifications and dashboard summary
5. Quality and Delivery
   - Unit and integration tests
   - Docker and docker-compose
   - CI workflows
   - README and execution guidance

## First Vertical Slice

The initial functional slice implemented in code should cover:

- Login and authenticated session restore
- Category and SLA seed data
- Ticket creation with idempotency key
- Ticket listing with server-side filtering and pagination
- Ticket detail with comments and history
- Assignment and core status transitions
- Basic notification feed
- Dashboard summary

## Constraints

- Keep all technical identifiers in English
- Keep user-facing text in Spanish
- Keep comments in code in Spanish only when they add non-obvious context
- Avoid deprecated Angular or Spring APIs
- Do not use mock data in production code
- Do not return persistence entities from REST endpoints

## Verification Checklist

- Frontend builds with Angular 21
- Backend builds with Maven wrapper and Java 21
- MySQL profile and Flyway are configured
- Core endpoints are documented and secured
- Core routes render and enforce permissions
- Tests cover business-critical flows
