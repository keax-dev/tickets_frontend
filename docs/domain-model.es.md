<div align="right">
  <a href="./domain-model.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./domain-model.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# Modelo de Dominio

## Roles

- `ADMIN`
- `SUPPORT_MANAGER`
- `SUPPORT_AGENT`
- `CUSTOMER`

## Permisos Principales

- Gestion de usuarios
- Gestion de categorias
- Gestion de SLA
- Lectura, creacion, actualizacion, asignacion, reasignacion y cambio de estado de tickets
- Creacion de comentarios publicos e internos
- Carga y descarga de adjuntos
- Lectura de auditoria
- Lectura de dashboard

Los permisos estan centralizados y mapeados a roles en el modulo `identity`.

## Agregados y Entidades

### User

- `id`
- `firstName`
- `lastName`
- `email`
- `passwordHash`
- `role`
- `active`
- `failedLoginAttempts`
- `lastLoginAt`
- `createdAt`
- `updatedAt`
- `version`

### Category

- `id`
- `name`
- `description`
- `active`
- `createdAt`
- `updatedAt`
- `version`

### SlaPolicy

- `id`
- `priority`
- `firstResponseHours`
- `resolutionHours`
- `active`
- `createdAt`
- `updatedAt`
- `version`

### Ticket

- `id`
- `code`
- `title`
- `description`
- `status`
- `priority`
- `requesterId`
- `assignedAgentId`
- `categoryId`
- `firstResponseDueAt`
- `resolutionDueAt`
- `firstRespondedAt`
- `resolvedAt`
- `closedAt`
- `cancelledAt`
- `slaPausedAt`
- `accumulatedPausedSeconds`
- `slaFirstResponseBreached`
- `slaResolutionBreached`
- `resolutionSummary`
- `createdAt`
- `updatedAt`
- `version`

### TicketComment

- `id`
- `ticketId`
- `authorId`
- `content`
- `visibility`
- `createdAt`
- `updatedAt`

### TicketAttachment

- `id`
- `ticketId`
- `commentId`
- `uploadedBy`
- `originalFilename`
- `storedFilename`
- `contentType`
- `size`
- `storagePath`
- `createdAt`

### TicketHistory

- `id`
- `ticketId`
- `action`
- `performedBy`
- `previousValue`
- `newValue`
- `metadata`
- `createdAt`

### Notification

- `id`
- `recipientId`
- `type`
- `title`
- `message`
- `relatedTicketId`
- `read`
- `createdAt`
- `readAt`

### RefreshToken

- `id`
- `userId`
- `tokenHash`
- `createdAt`
- `expiresAt`
- `revokedAt`
- `replacedByTokenId`

### IdempotencyRecord

- `id`
- `idempotencyKey`
- `userId`
- `requestHash`
- `responseStatus`
- `responseBody`
- `resourceId`
- `createdAt`
- `expiresAt`

## Ciclo de Vida del Ticket

- `CREATED`
- `ASSIGNED`
- `IN_PROGRESS`
- `WAITING_FOR_CUSTOMER`
- `RESOLVED`
- `CLOSED`
- `CANCELLED`

Las transiciones permitidas se aplican en el modelo de dominio de `ticket`, no en los controllers.
