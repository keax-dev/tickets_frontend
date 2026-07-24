<div align="right">
  <a href="./api-contract.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./api-contract.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# Contrato API

## Base Path

`/api/v1`

## Autenticacion

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Tickets

- `GET /tickets`
- `POST /tickets`
- `GET /tickets/{ticketId}`
- `PATCH /tickets/{ticketId}`
- `POST /tickets/{ticketId}/assign`
- `POST /tickets/{ticketId}/start`
- `POST /tickets/{ticketId}/request-information`
- `POST /tickets/{ticketId}/resolve`
- `POST /tickets/{ticketId}/close`
- `POST /tickets/{ticketId}/reopen`
- `POST /tickets/{ticketId}/cancel`
- `GET /tickets/{ticketId}/history`

## Comentarios

- `GET /tickets/{ticketId}/comments`
- `POST /tickets/{ticketId}/comments`

## Adjuntos

- `POST /tickets/{ticketId}/attachments`
- `GET /attachments/{attachmentId}/download`

## Categorias

- `GET /categories`
- `POST /categories`
- `PUT /categories/{categoryId}`
- `PATCH /categories/{categoryId}/status`

## Usuarios

- `GET /users`
- `POST /users`
- `GET /users/{userId}`
- `PUT /users/{userId}`
- `PATCH /users/{userId}/status`

## Politicas SLA

- `GET /sla-policies`
- `PUT /sla-policies/{priority}`

## Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/recent-activity`

## Notificaciones

- `GET /notifications`
- `PATCH /notifications/{notificationId}/read`
- `PATCH /notifications/read-all`

## Contrato de Error

Los errores usan `ProblemDetail` con estos campos personalizados:

- `code`
- `correlationId`
- `timestamp`
- `fieldErrors`

## Concurrencia e Idempotencia

- Los recursos mutables llevan `version`
- Los conflictos de version retornan HTTP `409`
- La creacion de tickets requiere `Idempotency-Key`
