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
