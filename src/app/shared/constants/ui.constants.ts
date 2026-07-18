import {
  AppRole,
  TicketCommentVisibility,
  TicketPriority,
  TicketStatus,
} from '../models/api.models';

type SelectOption<T> = Readonly<{
  label: string;
  value: T;
}>;

export type TicketPriorityTagSeverity = 'secondary' | 'info' | 'warn' | 'danger';

function createOptions<T extends string>(
  labels: Readonly<Record<T, string>>,
): Array<SelectOption<T>> {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}

export const ROUTE_TITLES = {
  login: 'Sign in',
  dashboard: 'Dashboard',
  tickets: 'Tickets',
  ticketCreate: 'New ticket',
  ticketDetail: 'Ticket details',
  notifications: 'Notifications',
  profile: 'Profile',
  users: 'Users',
  categories: 'Categories',
  sla: 'SLA policies',
  forbidden: 'Access denied',
  notFound: 'Page not found',
} as const;

export const APP_ROLE_LABELS: Readonly<Record<AppRole, string>> = {
  ADMIN: 'Administrator',
  SUPPORT_MANAGER: 'Support manager',
  SUPPORT_AGENT: 'Support agent',
  CUSTOMER: 'Customer',
};

export const APP_ROLE_OPTIONS = createOptions(APP_ROLE_LABELS);

export function getAppRoleLabel(role: AppRole): string {
  return APP_ROLE_LABELS[role];
}

export const TICKET_PRIORITY_LABELS: Readonly<Record<TicketPriority, string>> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TICKET_PRIORITY_OPTIONS = createOptions(TICKET_PRIORITY_LABELS);

export const TICKET_PRIORITY_TAG_SEVERITIES: Readonly<
  Record<TicketPriority, TicketPriorityTagSeverity>
> = {
  LOW: 'secondary',
  MEDIUM: 'info',
  HIGH: 'warn',
  URGENT: 'danger',
};

export function getTicketPriorityLabel(priority: TicketPriority): string {
  return TICKET_PRIORITY_LABELS[priority];
}

export function getTicketPriorityTagSeverity(
  priority: TicketPriority,
): TicketPriorityTagSeverity {
  return TICKET_PRIORITY_TAG_SEVERITIES[priority];
}

export const TICKET_STATUS_LABELS: Readonly<Record<TicketStatus, string>> = {
  CREATED: 'Created',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  WAITING_FOR_CUSTOMER: 'Waiting for customer',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};

export const TICKET_STATUS_OPTIONS = createOptions(TICKET_STATUS_LABELS);

export function getTicketStatusLabel(status: TicketStatus): string {
  return TICKET_STATUS_LABELS[status];
}

export const ACTIVE_STATE_OPTIONS: Array<SelectOption<boolean>> = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

export function getActiveStateLabel(active: boolean): string {
  return active ? 'Active' : 'Inactive';
}

export function getActivationActionLabel(active: boolean): string {
  return active ? 'Deactivate' : 'Activate';
}

export const COMMENT_VISIBILITY_LABELS: Readonly<Record<TicketCommentVisibility, string>> = {
  PUBLIC: 'Public',
  INTERNAL: 'Internal',
};

export function getTicketCommentVisibilityOptions(
  includeInternal: boolean,
): Array<SelectOption<TicketCommentVisibility>> {
  if (includeInternal) {
    return [
      { label: COMMENT_VISIBILITY_LABELS.PUBLIC, value: 'PUBLIC' },
      { label: COMMENT_VISIBILITY_LABELS.INTERNAL, value: 'INTERNAL' },
    ];
  }

  return [{ label: COMMENT_VISIBILITY_LABELS.PUBLIC, value: 'PUBLIC' }];
}
