<div align="right">
  <a href="./002-authentication-strategy.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./002-authentication-strategy.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

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
