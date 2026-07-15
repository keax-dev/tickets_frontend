# API Contract

## Base Path

`/api/v1`

## Authentication

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

## Comments

- `GET /tickets/{ticketId}/comments`
- `POST /tickets/{ticketId}/comments`

## Attachments

- `POST /tickets/{ticketId}/attachments`
- `GET /attachments/{attachmentId}/download`

## Categories

- `GET /categories`
- `POST /categories`
- `PUT /categories/{categoryId}`
- `PATCH /categories/{categoryId}/status`

## Users

- `GET /users`
- `POST /users`
- `GET /users/{userId}`
- `PUT /users/{userId}`
- `PATCH /users/{userId}/status`

## SLA Policies

- `GET /sla-policies`
- `PUT /sla-policies/{priority}`

## Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/recent-activity`

## Notifications

- `GET /notifications`
- `PATCH /notifications/{notificationId}/read`
- `PATCH /notifications/read-all`

## Error Contract

Errors use `ProblemDetail` with these custom fields:

- `code`
- `correlationId`
- `timestamp`
- `fieldErrors`

## Concurrency and Idempotency

- Mutable resources carry a `version`
- Version conflicts return HTTP `409`
- Ticket creation requires `Idempotency-Key`
