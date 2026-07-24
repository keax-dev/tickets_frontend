<div align="right">
  <a href="./README.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./README.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# Management Tickets Frontend

SPA construida con Angular para el sistema **Management Tickets**. Este repositorio contiene el frontend del producto: autenticacion, dashboard, flujo de tickets, notificaciones, perfil y modulos de administracion con navegacion sensible a permisos.

## Resumen

- Angular 21 con componentes standalone y lazy loading por rutas.
- Estado local manejado con **Signals** y orquestacion async con **RxJS**.
- UI construida con **PrimeNG**, **PrimeIcons** y **Bootstrap 5**.
- Autenticacion basada en access token en memoria y refresh token por cookie HttpOnly.
- Guards, interceptors y stores orientados a features.
- Soporte de calidad con pruebas Angular, **Playwright**, ESLint, Prettier y chequeo estricto de tipos.

## Alcance funcional

El frontend actualmente incluye:

- Inicio de sesion y restauracion automatica de sesion.
- Cambio de tema claro y oscuro con persistencia en `localStorage`.
- Dashboard con resumen operativo y actividad reciente.
- Listado de tickets con filtros, ordenamiento, paginacion y navegacion a detalle.
- Creacion de tickets.
- Vista de detalle de ticket con resumen, comentarios, historial, asignacion o reasignacion, y acciones del flujo como iniciar, solicitar informacion, resolver y cerrar.
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
- Playwright `1.61`
- ESLint `10`
- Prettier `3`

## Arquitectura

La aplicacion se organiza alrededor de capas ligeras y limites por feature:

- `core`: autenticacion, autorizacion, configuracion runtime, interceptors HTTP, shell principal y tema global.
- `shared`: modelos, constantes, directivas, helpers y utilidades reutilizables.
- `features`: `auth`, `dashboard`, `tickets`, `notifications`, `profile`, `administration` y `system`.
- `tests`: soporte transversal para integracion y pruebas end-to-end.

Patrones usados en el codigo:

- **Standalone components** en toda la aplicacion.
- **Route-level lazy loading** para aislar features.
- **Stores basados en Signals** como fachadas de estado por feature.
- **RxJS** para HTTP, refresh, mutaciones, busquedas y sincronizacion.
- **Guards** para rutas autenticadas, de invitado y con permisos.
- **Interceptors** para correlation id, normalizacion uniforme de errores y refresh de sesion.
- **Zoneless change detection** configurado en `app.config.ts`.

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

La navegacion lateral esta gobernada por permisos y no por etiquetas de rol fijas:

- `USER_READ` muestra **Users**.
- Cualquier permiso entre `CATEGORY_CREATE`, `CATEGORY_UPDATE` o `CATEGORY_DISABLE` muestra **Categories**.
- `SLA_READ` muestra **SLA**.

Importante:

- El frontend solo oculta o muestra opciones como capa UX.
- El backend debe seguir siendo la fuente de verdad para la autorizacion.

## Seguridad y comunicacion con backend

- `authGuard`, `guestGuard` y `permissionGuard` protegen la navegacion.
- `authInterceptor` agrega `Authorization: Bearer ...` y restaura la sesion cuando corresponde.
- `correlationIdInterceptor` agrega `X-Correlation-Id` a cada request.
- `errorInterceptor` normaliza errores del backend y de red al contrato `ProblemDetails`.
- El frontend espera por defecto un backend expuesto en `http://localhost:8080/api/v1`.

Notas del contrato:

- Los recursos mutables usan `version` para optimistic locking.
- La creacion de tickets requiere `Idempotency-Key` en el backend.
- Los errores siguen `ProblemDetails` con `code`, `correlationId`, `timestamp` y `fieldErrors`.

## Configuracion de entorno

Archivos disponibles:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/environments/environment.production.ts`

Valor principal actual:

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
README.es.md
```

Patron comun interno por feature:

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

- `npm start`: Ejecuta el servidor de desarrollo de Angular.
- `npm run build`: Genera el build de produccion.
- `npm run watch`: Recompila continuamente en modo desarrollo.
- `npm test`: Ejecuta la suite de pruebas unitarias de Angular.
- `npm run test:e2e`: Ejecuta pruebas end-to-end con Playwright en Chromium.
- `npm run test:e2e:headed`: Ejecuta las e2e con navegador visible.
- `npm run validate`: Ejecuta format check, lint, typecheck, pruebas unitarias y pruebas e2e.
- `npm run format`: Aplica Prettier.
- `npm run format:check`: Valida formato.
- `npm run lint`: Ejecuta ESLint.
- `npm run typecheck`: Valida TypeScript para app, specs y pruebas e2e.

## Calidad y pruebas

La estrategia actual de calidad contempla:

- Linting con ESLint.
- Formateo con Prettier.
- Chequeo estricto de tipos.
- Pruebas unitarias e integracion dentro del setup de pruebas Angular.
- Pruebas end-to-end con Playwright.

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

- `tests/units`: Stores, guards, interceptors y helpers.
- `tests/integrations`: Componentes y paginas con dependencias mockeadas.
- `tests/e2e`: Escenarios end-to-end reales organizados por modulo.

Estado actual de e2e:

- Playwright ya esta configurado en este repositorio.
- La suite actual cubre flujos de autenticacion, autorizacion, tickets y notificaciones.

## Documentacion del repositorio

Documentos principales:

- [Arquitectura](./docs/architecture.es.md)
- [Contrato API](./docs/api-contract.es.md)
- [Modelo de dominio](./docs/domain-model.es.md)
- [Estrategia de pruebas](./docs/testing-strategy.es.md)
- [Plan de implementacion](./docs/implementation-plan.es.md)
- [Progreso de implementacion](./docs/implementation-progress.es.md)

Registros de decisiones:

- [001 - Arquitectura limpia pragmatica](./docs/decisions/001-clean-architecture.es.md)
- [002 - Estrategia de autenticacion](./docs/decisions/002-authentication-strategy.es.md)
- [003 - Gestion de estado en Angular](./docs/decisions/003-angular-state-management.es.md)
- [004 - Flujo de tickets](./docs/decisions/004-ticket-workflow.es.md)

## Integracion con el backend

Este repositorio contiene solo el frontend. La solucion completa tambien incluye un backend separado llamado `tickets-backend`, responsable de reglas de negocio, autenticacion, persistencia, notificaciones, datos del dashboard, gestion SLA e historial de auditoria.

## Estado actual

El proyecto ya incluye:

- Los modulos funcionales principales.
- Navegacion sensible a permisos.
- Vistas de lista paginadas.
- Soporte para tema claro y oscuro.
- Manejo consistente de errores.
- Una suite de pruebas organizada por modulo.
- Una base real de e2e con Playwright lista para ejecutar.
- Documentacion tecnica base en `docs/`.

## Siguientes mejoras sugeridas

- Agregar reporte automatizado de coverage en CI.
- Publicar usuarios de ejemplo y matrices de permisos para ambientes demo.
- Agregar capturas o GIFs del flujo principal.
