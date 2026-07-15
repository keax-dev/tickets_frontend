# Testing Strategy

## Frontend

### Unit

- Stores
- Guards
- Interceptors
- Validators
- Mappers
- Feature services

### Component Integration

- Login form
- Ticket list filters
- Ticket form validation
- Ticket detail actions
- Notification interactions

### E2E

- Authentication and session restore
- Ticket creation and lifecycle
- Authorization boundaries
- Version conflict handling

## Backend

### Unit

- Ticket lifecycle rules
- Permission evaluation
- SLA calculations
- Idempotency policy
- Refresh token rotation

### Application

- Use case orchestration with mocked output ports
- Error propagation
- Notification emission

### Integration

- Flyway migrations
- Repositories and queries
- Security filters
- Optimistic locking
- Concurrent ticket code generation

### API

- Login, refresh, logout, me
- Ticket CRUD and transitions
- Comments and notifications
- Category and user administration

## Coverage Targets

- Backend domain and critical use cases: `>= 90%`
- Backend global coverage: `>= 80%`
- Frontend stores and critical logic: `>= 85%`
- Frontend global coverage: `>= 75%`
