export type AppRole = 'ADMIN' | 'SUPPORT_MANAGER' | 'SUPPORT_AGENT' | 'CUSTOMER';

export type AppPermission =
  | 'USER_READ'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DISABLE'
  | 'CATEGORY_READ'
  | 'CATEGORY_CREATE'
  | 'CATEGORY_UPDATE'
  | 'CATEGORY_DISABLE'
  | 'SLA_READ'
  | 'SLA_UPDATE'
  | 'TICKET_CREATE'
  | 'TICKET_READ_OWN'
  | 'TICKET_READ_ASSIGNED'
  | 'TICKET_READ_ALL'
  | 'TICKET_UPDATE'
  | 'TICKET_ASSIGN'
  | 'TICKET_REASSIGN'
  | 'TICKET_CHANGE_PRIORITY'
  | 'TICKET_CHANGE_STATUS'
  | 'TICKET_RESOLVE'
  | 'TICKET_CLOSE'
  | 'TICKET_REOPEN'
  | 'TICKET_CANCEL'
  | 'COMMENT_CREATE_PUBLIC'
  | 'COMMENT_CREATE_INTERNAL'
  | 'COMMENT_READ_INTERNAL'
  | 'AUDIT_READ'
  | 'DASHBOARD_READ_GLOBAL'
  | 'DASHBOARD_READ_PERSONAL'
  | 'NOTIFICATION_READ';

export type TicketStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCommentVisibility = 'PUBLIC' | 'INTERNAL';
export type SortDirection = 'ASC' | 'DESC';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string[];
}

export interface FieldErrorResponse {
  field: string;
  message: string;
}

export interface ProblemDetails {
  status: number;
  title: string;
  detail: string;
  code: string;
  correlationId?: string;
  fieldErrors?: FieldErrorResponse[];
}

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  permissions: AppPermission[];
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: CurrentUser;
}

export interface DashboardSummary {
  activeTickets: number;
  createdToday: number;
  unassignedTickets: number;
  breachedTickets: number;
  dueSoonTickets: number;
  assignedToCurrentUser: number;
  ticketsByStatus: Record<TicketStatus, number>;
  ticketsByPriority: Record<TicketPriority, number>;
}

export interface RecentActivity {
  id: string;
  ticketId: string;
  action: string;
  performedByName: string | null;
  createdAt: string;
}

export interface TicketSummary {
  id: string;
  code: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  requesterId: string;
  requesterName: string | null;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  categoryId: string;
  categoryName: string | null;
  resolutionDueAt: string;
  slaFirstResponseBreached: boolean;
  slaResolutionBreached: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TicketDetail extends TicketSummary {
  description: string;
  firstResponseDueAt: string;
  firstRespondedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  slaPausedAt: string | null;
  accumulatedPausedSeconds: number;
  resolutionSummary: string | null;
  availableActions: string[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string | null;
  content: string;
  visibility: TicketCommentVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface TicketHistory {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string | null;
  previousValue: string | null;
  newValue: string | null;
  metadataJson: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedTicketId: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  active: boolean;
  lastLoginAt: string | null;
  version: number;
}

export interface SlaPolicy {
  id: string;
  priority: TicketPriority;
  firstResponseHours: number;
  resolutionHours: number;
  active: boolean;
  version: number;
}

export interface TicketListFilters {
  search?: string;
  status?: TicketStatus | null;
  priority?: TicketPriority | null;
  categoryId?: string | null;
  assignedAgentId?: string | null;
  sortBy?: string;
  direction?: SortDirection;
  page: number;
  size: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  categoryId: string;
  priority: TicketPriority;
}

export interface UpdateTicketRequest {
  version: number;
  title?: string;
  description?: string;
  priority?: TicketPriority;
  categoryId?: string;
}

export interface TicketVersionRequest {
  version: number;
}

export interface AssignTicketRequest extends TicketVersionRequest {
  agentId: string;
}

export interface RequestInformationRequest extends TicketVersionRequest {
  content: string;
}

export interface ResolveTicketRequest extends TicketVersionRequest {
  resolutionSummary: string;
}

export interface ReopenTicketRequest extends TicketVersionRequest {
  reason: string;
}

export interface CancelTicketRequest extends TicketVersionRequest {
  reason: string;
}

export interface AddTicketCommentRequest extends TicketVersionRequest {
  content: string;
  visibility: TicketCommentVisibility;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AppRole;
}

export interface UpdateUserRequest {
  version: number;
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
}

export interface ActivationChangeRequest {
  version: number;
  active: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description: string | null;
}

export interface UpdateCategoryRequest {
  version: number;
  name: string;
  description: string | null;
}

export interface UpdateSlaPolicyRequest {
  version: number;
  firstResponseHours: number;
  resolutionHours: number;
  active: boolean;
}
