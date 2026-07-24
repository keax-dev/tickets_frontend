<div align="right">
  <a href="./testing-strategy.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./testing-strategy.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# Estrategia de Pruebas

## Frontend

### Unitarias

- Stores
- Guards
- Interceptors
- Validators
- Mappers
- Servicios por feature

### Integracion de Componentes

- Formulario de login
- Filtros del listado de tickets
- Validacion del formulario de tickets
- Acciones de detalle de ticket
- Interacciones de notificaciones

### End-to-End

- Autenticacion y restauracion de sesion
- Creacion de tickets y ciclo de vida
- Limites de autorizacion
- Manejo de conflictos de version

## Backend

### Unitarias

- Reglas del ciclo de vida del ticket
- Evaluacion de permisos
- Calculos SLA
- Politica de idempotencia
- Rotacion de refresh tokens

### Aplicacion

- Orquestacion de casos de uso con output ports mockeados
- Propagacion de errores
- Emision de notificaciones

### Integracion

- Migraciones Flyway
- Repositorios y queries
- Filtros de seguridad
- Optimistic locking
- Generacion concurrente del codigo de ticket

### API

- Login, refresh, logout y me
- CRUD de tickets y transiciones
- Comentarios y notificaciones
- Administracion de categorias y usuarios

## Objetivos de Coverage

- Dominio del backend y casos de uso criticos: `>= 90%`
- Coverage global del backend: `>= 80%`
- Stores y logica critica del frontend: `>= 85%`
- Coverage global del frontend: `>= 75%`
