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

# ADR 002 - Estrategia de Autenticacion

## Estado

Aceptada

## Decision

Usar access JWTs de corta vida junto con refresh tokens rotatorios almacenados como cookies HttpOnly.

## Razon

- Coincide con el modelo de seguridad del prompt
- Mantiene el access token fuera del almacenamiento persistente del navegador
- Permite una restauracion controlada de la sesion al iniciar la aplicacion

## Consecuencias

- El frontend debe coordinar con cuidado el flujo de refresh y el retry de requests
- El backend debe persistir, hashear, rotar y revocar refresh tokens
- El logout debe invalidar el estado server-side del refresh token
