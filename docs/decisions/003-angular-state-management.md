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
