# ADR 002 - Authentication Strategy

## Status

Accepted

## Decision

Use short-lived access JWTs plus rotating refresh tokens stored as HttpOnly cookies.

## Rationale

- Matches the prompt's security model
- Keeps the access token out of persistent browser storage
- Allows controlled session restoration on application startup

## Consequences

- Frontend must coordinate refresh flow and request retry carefully
- Backend must persist, hash, rotate, and revoke refresh tokens
- Logout must invalidate server-side refresh state
