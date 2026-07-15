# ADR 004 - Ticket Workflow

## Status

Accepted

## Decision

Model ticket transitions explicitly in the domain and reject invalid state changes through domain exceptions.

## Rationale

- The workflow contains strict role and state constraints
- Allowing ad-hoc status updates in controllers or UI code would create inconsistent behavior
- SLA pause/resume and audit history depend on reliable transition rules

## Consequences

- Controllers remain thin
- The frontend receives a stable action model from the API
- Version conflicts and invalid transitions can be reported consistently
