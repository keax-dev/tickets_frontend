<div align="right">
  <a href="./003-angular-state-management.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./003-angular-state-management.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# ADR 003 - Angular State Management

## Status

Accepted

## Decision

Use feature-local Signals stores and facades combined with RxJS for HTTP orchestration.

## Rationale

- Angular 21 provides first-class reactive primitives for local and derived UI state
- The prompt discourages introducing NgRx without proven need
- RxJS remains better suited for cancellation, debounce, refresh queues, and transport concerns

## Consequences

- Each feature owns its state boundary
- Shared cross-feature state stays minimal
- Mutations are exposed through explicit store methods
