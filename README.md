<div align="right">
  <a href="./README.md">
    <img
      alt="Español"
      src="https://img.shields.io/badge/Idioma-Espa%C3%B1ol-0b7a4b?style=for-the-badge"
    />
  </a>
  <a href="./README.en.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
</div>

# Management Tickets Frontend

SPA construida con Angular para el sistema **Management Tickets**. Este repositorio contiene el frontend del producto: autenticacion, panel principal, flujo de tickets, notificaciones, perfil y modulos de administracion con navegacion sensible a permisos.

## Resumen

- Angular 21 con componentes standalone y lazy loading por rutas.
- Estado local con **Signals** y orquestacion async con **RxJS**.
- UI con **PrimeNG**, **PrimeIcons** y **Bootstrap 5**.
- Autenticacion con access token en memoria y refresh token por cookie HttpOnly.
- Guards, interceptors y stores orientados a modulos.
- Suite de pruebas con **Vitest** organizada por feature.

## Alcance funcional

El frontend actualmente incluye:

- Inicio de sesion y restauracion automatica de sesion.
- Cambio de tema claro/oscuro con persistencia en `localStorage`.
- Dashboard con resumen operativo y actividad reciente.
- Listado de tickets con filtros, ordenamiento, paginacion y navegacion a detalle.
- Creacion de tickets.
- Vista de detalle de ticket con:
  - resumen del ticket,
  - comentarios,
  - historial,
  - asignacion o reasignacion,
  - transiciones del flujo como iniciar, solicitar informacion, resolver y cerrar.
- Notificaciones con marcado individual y masivo como leidas.
- Perfil del usuario autenticado.
- Administracion de usuarios.
- Administracion de categorias.
- Administracion de politicas SLA.
- Pantallas de sistema para acceso denegado y pagina no encontrada.

## Stack principal

- Angular `21`
- TypeScript `5.9`
- RxJS `7.8`
- PrimeNG `21`
- Bootstrap `5.3`
- Vitest `4`
- Playwright `1.61`
- ESLint `10`
- Prettier `3`

## Arquitectura

La aplicacion sigue una organizacion por capas ligeras y por features:

- `core`
  - autenticacion y autorizacion,
  - configuracion runtime,
  - interceptors HTTP,
  - layout principal,
  - tema global.
- `shared`
  - modelos,
  - constantes,
  - utilidades reutilizables.
- `features`
  - `auth`
  - `dashboard`
  - `tickets`
  - `notifications`
  - `profile`
  - `administration`
  - `system`

Patrones usados:

- **Standalone components** en toda la app.
- **Route-level lazy loading** para aislar modulos.
- **Stores basados en Signals** como fachada de estado por feature.
- **RxJS** para HTTP, refresh, mutaciones, busquedas y sincronizacion.
- **Guards** para acceso autenticado, invitado y rutas con permisos.
- **Interceptors** para correlation id, manejo uniforme de errores y refresh de sesion.
- **Zoneless change detection** configurado desde `app.config.ts`.

## Navegacion y control de acceso

Rutas principales:

- `/login`
- `/dashboard`
- `/tickets`
- `/tickets/new`
- `/tickets/:ticketId`
- `/notifications`
- `/profile`
- `/admin/users`
- `/admin/categories`
- `/admin/sla`
- `/forbidden`

La navegacion lateral no esta amarrada de forma rigida al rol visual, sino a permisos:

- `USER_READ` muestra **Users**.
- Cualquier permiso entre `CATEGORY_CREATE`, `CATEGORY_UPDATE` o `CATEGORY_DISABLE` muestra **Categories**.
- `SLA_READ` muestra **SLA**.

Importante:

- El frontend oculta o muestra opciones como capa UX.
- La autorizacion real debe seguir validandose en el backend.

## Seguridad y comunicacion con backend

- `authGuard`, `guestGuard` y `permissionGuard` protegen la navegacion.
- `authInterceptor` agrega `Authorization: Bearer ...` y recupera la sesion cuando corresponde.
- `correlationIdInterceptor` agrega `X-Correlation-Id` a cada request.
- `errorInterceptor` normaliza errores backend y fallos de red al contrato `ProblemDetails`.
- El frontend espera un backend disponible en `/api/v1`.

Notas del contrato:

- Los recursos mutables usan `version` para optimistic locking.
- La creacion de tickets requiere `Idempotency-Key` en backend.
- Los errores usan `ProblemDetails` con `code`, `correlationId`, `timestamp` y `fieldErrors`.

## Configuracion de entorno

Archivos disponibles:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/environments/environment.production.ts`

Actualmente el valor principal es:

```ts
apiBaseUrl: 'http://localhost:8080/api/v1';
```

Si el backend corre en otro host o puerto, actualiza `apiBaseUrl` en el environment correspondiente.

## Estructura del proyecto

```text
src/
  app/
    core/
    features/
      administration/
      auth/
      dashboard/
      notifications/
      profile/
      system/
      tickets/
    shared/
    tests/
  environments/
docs/
  decisions/
README.md
README.en.md
```

Patron interno por feature:

```text
feature/
  pages/
  components/
  services/
  stores/
  tests/
    units/
    integrations/
    e2e/
```

## Requisitos

- Node.js compatible con Angular 21.
- npm como package manager.
- Backend de `Management Tickets` corriendo y accesible desde el frontend.

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Asegura que el backend este disponible en `http://localhost:8080/api/v1`.

3. Inicia el servidor de desarrollo:

```bash
npm start
```

4. Abre la aplicacion en:

```text
http://localhost:4200
```

## Scripts disponibles

```bash
npm start
npm run build
npm run watch
npm test
npm run test:e2e
npm run test:e2e:headed
npm run validate
npm run format
npm run format:check
npm run lint
npm run typecheck
```

Descripcion rapida:

- `npm start`: levanta el dev server Angular.
- `npm run build`: genera build de produccion.
- `npm run watch`: recompila en modo desarrollo.
- `npm test`: ejecuta la suite con Vitest a traves del builder de Angular.
- `npm run test:e2e`: ejecuta las pruebas end-to-end con Playwright en Chromium.
- `npm run test:e2e:headed`: ejecuta las e2e con navegador visible.
- `npm run validate`: ejecuta format check, lint, typecheck, tests de Vitest y pruebas e2e.
- `npm run format`: aplica Prettier.
- `npm run format:check`: valida formato.
- `npm run lint`: ejecuta ESLint.
- `npm run typecheck`: valida TypeScript para app, specs y pruebas e2e.

## Calidad y pruebas

La estrategia actual de calidad contempla:

- linting con ESLint,
- formateo con Prettier,
- chequeo estricto de tipos,
- pruebas unitarias e integracion con Vitest,
- pruebas end-to-end con Playwright.

Comandos recomendados:

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test -- --watch=false
npm run test:e2e
npm run validate
```

Organizacion de pruebas:

- `tests/units`: stores, guards, interceptors y helpers.
- `tests/integrations`: componentes y paginas con dependencias mockeadas.
- `tests/e2e`: escenarios end-to-end reales organizados por modulo.

Estado actual de e2e:

- Playwright ya esta configurado en el repositorio.
- Actualmente se ejecutan escenarios e2e para autenticacion, autorizacion, tickets y notificaciones.

## Documentacion del repositorio

Documentos principales:

- [Arquitectura](./docs/architecture.md)
- [Contrato API](./docs/api-contract.md)
- [Modelo de dominio](./docs/domain-model.md)
- [Testing strategy](./docs/testing-strategy.md)
- [Implementation plan](./docs/implementation-plan.md)
- [Implementation progress](./docs/implementation-progress.md)

Decision records:

- [001 - Clean architecture](./docs/decisions/001-clean-architecture.md)
- [002 - Authentication strategy](./docs/decisions/002-authentication-strategy.md)
- [003 - Angular state management](./docs/decisions/003-angular-state-management.md)
- [004 - Ticket workflow](./docs/decisions/004-ticket-workflow.md)

## Integracion con el backend

Este repositorio contiene solo el frontend. La solucion completa descrita en la documentacion contempla un backend separado llamado `tickets-backend`, responsable de:

- reglas de negocio,
- autenticacion,
- persistencia,
- notificaciones,
- dashboard,
- SLA,
- auditoria.

## Estado actual

El proyecto ya cuenta con:

- modulos funcionales principales implementados,
- navegacion con permisos,
- tablas con paginacion,
- tema claro/oscuro,
- manejo consistente de errores,
- suite de pruebas organizada por modulo,
- base e2e real ejecutable con Playwright,
- documentacion tecnica base en `docs/`.

## Siguientes mejoras sugeridas

- Incorporar coverage automatizado en CI.
- Publicar ejemplos de usuarios y permisos para ambientes demo.
- Agregar capturas de pantalla o gifs del flujo principal.
