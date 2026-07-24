<div align="right">
  <a href="./architecture.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./architecture.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# Arquitectura de Management Tickets

## Vision General del Sistema

Management Tickets esta implementado como un monolito modular:

- `tickets-backend`: API REST, reglas de negocio, persistencia, autenticacion y procesos programados
- `tickets-frontend`: SPA Angular con navegacion sensible a roles y estado organizado por features

## Arquitectura del Backend

El backend sigue una Clean Architecture pragmatica por modulo de negocio:

- `identity`
- `category`
- `sla`
- `ticket`
- `notification`
- `dashboard`
- `shared`
- `bootstrap`

Cada modulo usa:

- `domain`
  - Entidades, value objects, servicios de dominio, politicas y contratos de repositorio
- `application`
  - Commands, queries, DTOs, input ports, output ports y casos de uso
- `infrastructure`
  - Adaptadores web, adaptadores de persistencia, adaptadores de seguridad, adaptadores de archivos y configuracion

Direccion de dependencias:

- `domain` no depende de nada externo
- `application` depende de `domain`
- `infrastructure` depende de `application` y `domain`
- `bootstrap` ensambla la aplicacion

## Arquitectura del Frontend

El frontend usa Angular standalone con features lazy-loaded y limites a nivel de rutas:

- `core`
  - Autenticacion
  - Autorizacion
  - Configuracion
  - Manejo de errores
  - HTTP interceptors
  - Layout
- `shared`
  - Componentes reutilizables
  - Modelos de UI
  - Validadores
  - Utilidades
- `features`
  - `auth`
  - `dashboard`
  - `tickets`
  - `notifications`
  - `profile`
  - `administration`

El estado por feature esta implementado con stores o facades basados en Signals. RxJS permanece como la capa de transporte y de orquestacion async para HTTP, busquedas, coordinacion de refresh y cancelacion.

## Modelo de Seguridad

- Access token de corta vida en memoria
- Refresh token rotatorio almacenado en cookie HttpOnly
- Validaciones de permisos aplicadas en casos de uso y endpoints del backend
- Restricciones de rutas y componentes en frontend solo como capa UX
- Optimistic locking para recursos mutables
- Idempotency keys para la creacion de tickets

## Estrategia de Persistencia

- MySQL como base de datos principal de runtime
- Flyway para esquema y seed local
- Entidades JPA aisladas en infraestructura
- Mappers explicitos entre persistencia, dominio y DTOs de API

## Observabilidad

- Logging estructurado con correlation id
- Spring Boot Actuator con exposicion restringida
- Endpoints de health para entornos locales y contenedores

## Integraciones Planificadas

- Almacenamiento local de archivos mediante un output port dedicado
- OpenAPI para descubrimiento del API
- Docker Compose para orquestacion local
