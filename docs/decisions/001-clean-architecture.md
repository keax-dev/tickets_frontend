<div align="right">
  <a href="./001-clean-architecture.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./001-clean-architecture.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# ADR 001 - Pragmatic Clean Architecture

## Status

Accepted

## Decision

Use a pragmatic modular monolith with clear domain, application, and infrastructure boundaries per business module.

## Rationale

- The prompt explicitly requires a professional monolith, not microservices
- Ticket rules, SLA behavior, authorization, and audit are business-critical and should remain testable without framework coupling
- Module boundaries reduce accidental complexity in both code and tests

## Consequences

- More explicit mapping code
- Better isolation for domain and application tests
- Easier future extraction of adapters such as cloud file storage
