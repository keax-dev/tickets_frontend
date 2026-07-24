<div align="right">
  <a href="./implementation-plan.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./implementation-plan.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# Plan de Implementacion de Management Tickets

## Alcance

Este par de repositorios contiene el frontend (`tickets-frontend`) y el backend (`tickets-backend`) para un sistema de gestion de tickets basado en un monolito modular. La implementacion prioriza un MVP vertical que sea funcional, testeable y extensible sin introducir complejidad distribuida antes de tiempo.

## Resumen de la Inspeccion Actual

- Frontend:
  - Angular `21.2.x`
  - TypeScript estricto habilitado
  - Aplicacion standalone ya inicializada
  - Sin codigo funcional de dominio al inicio de la evaluacion
- Backend:
  - Spring Boot `4.1.0`
  - Java `21`
  - Maven wrapper presente
  - Solo existian la clase bootstrap y las properties por defecto al inicio de la evaluacion
- Tooling:
  - Node `24.18.0`
  - npm `11.18.0`
  - Java `21.0.11`

## Estrategia de Entrega

El trabajo se divide en fases que preservan una aplicacion ejecutable en cada paso.

1. Fundamentos
   - Crear documentacion tecnica compartida
   - Preparar la estructura modular del backend
   - Preparar la estructura orientada a features del frontend
   - Agregar solo las dependencias requeridas
2. Nucleo del Backend
   - Security, JWT, rotacion de refresh token y acceso del usuario autenticado
   - Migraciones Flyway
   - Usuarios, roles, permisos, categorias y politicas SLA
   - Aggregate de ticket, historial, notificaciones e idempotencia
3. Nucleo del Frontend
   - Integracion de PrimeNG y design tokens
   - Shell de autenticacion, guards, interceptors y layout principal
   - Capa API compartida y stores por feature
4. Flujo Vertical de Tickets
   - Login y restauracion de sesion
   - Listado de tickets, creacion y detalle
   - Asignacion, progreso, comentarios, resolucion y cierre
   - Notificaciones y resumen del dashboard
5. Calidad y Entrega
   - Pruebas unitarias y de integracion
   - Docker y docker-compose
   - Workflows CI
   - README y guias de ejecucion

## Primer Vertical Slice

El primer slice funcional implementado en codigo debe cubrir:

- Login y restauracion de sesion autenticada
- Seed de categorias y politicas SLA
- Creacion de tickets con idempotency key
- Listado de tickets con filtros server-side y paginacion
- Detalle de ticket con comentarios e historial
- Asignacion y transiciones principales de estado
- Feed basico de notificaciones
- Resumen del dashboard

## Restricciones

- Mantener todos los identificadores tecnicos en ingles
- Mantener el texto visible para usuario en espanol
- Mantener comentarios en codigo en espanol solo cuando agreguen contexto no obvio
- Evitar APIs de Angular o Spring obsoletas
- No usar mock data en codigo de produccion
- No retornar entidades de persistencia desde endpoints REST

## Checklist de Verificacion

- El frontend compila con Angular 21
- El backend compila con Maven wrapper y Java 21
- El perfil MySQL y Flyway estan configurados
- Los endpoints principales estan documentados y asegurados
- Las rutas principales renderizan y aplican permisos
- Las pruebas cubren los flujos criticos del negocio
