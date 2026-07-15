# Domain Model

## Roles

- `ADMIN`
- `SUPPORT_MANAGER`
- `SUPPORT_AGENT`
- `CUSTOMER`

## Core Permissions

- User management
- Category management
- SLA management
- Ticket read/create/update/assign/reassign/change status
- Public and internal comment creation
- Attachment upload/download
- Audit read
- Dashboard read

Permissions are centralized and mapped to roles in the identity module.

## Aggregates and Entities

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

## Ticket Lifecycle

- `CREATED`
- `ASSIGNED`
- `IN_PROGRESS`
- `WAITING_FOR_CUSTOMER`
- `RESOLVED`
- `CLOSED`
- `CANCELLED`

Allowed transitions are enforced in the ticket domain model, not in controllers.
